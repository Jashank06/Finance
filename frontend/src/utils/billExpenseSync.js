import { investmentAPI } from './investmentAPI';
import api from './api';

/**
 * Auto-sync expenses for "jo jo" to Bill Dates page
 * This utility handles automatic synchronization between expense entries and bill dates
 */

const BILL_CATEGORY_KEY = 'daily-bill-checklist';
const JOJO_IDENTIFIER = 'jo jo'; // Can be configured for other family members

/**
 * Sync expense entry to Bill Dates
 * When an expense is created for "jo jo", this function:
 * 1. Checks if a matching bill exists in Bill Dates
 * 2. Creates a new bill if none exists
 * 3. Updates the bill's payment status if it exists
 * 
 * @param {Object} transaction - The transaction/expense data
 * @param {string} transactionType - Type: 'cash', 'card', 'bank', 'income-expense'
 */
export const syncExpenseToBillDates = async (transaction, transactionType = 'card') => {
    try {
        // Check if transaction is for "jo jo"
        const merchant = (transaction.merchant || '').toLowerCase();
        if (!merchant.includes(JOJO_IDENTIFIER)) {
            return; // Not for jo jo, skip sync
        }

        console.log('Syncing jo jo expense to Bill Dates:', transaction);

        // Fetch existing bills
        const billsResponse = await investmentAPI.getAll(BILL_CATEGORY_KEY);
        const bills = billsResponse.data.investments || [];

        // Try to find matching bill
        const matchingBill = findMatchingBill(bills, transaction);

        if (matchingBill) {
            // Update existing bill with payment
            await updateBillWithPayment(matchingBill, transaction);
            console.log('Updated existing bill with payment');
        } else {
            // Create new bill entry
            await createBillFromExpense(transaction);
            console.log('Created new bill from expense');
        }
    } catch (error) {
        console.error('Error syncing expense to Bill Dates:', error);
        // Don't throw error - sync is supplementary, shouldn't block main transaction
    }
};

/**
 * Find a matching bill for the transaction
 * Matching logic: Similar merchant name, amount, and due date proximity
 */
const findMatchingBill = (bills, transaction) => {
    const transactionDate = new Date(transaction.date);
    const transactionAmount = transaction.amount;
    const merchant = (transaction.merchant || '').toLowerCase();

    return bills.find(bill => {
        let notes = {};
        try {
            notes = bill.notes ? JSON.parse(bill.notes) : {};
        } catch (e) {
            notes = {};
        }

        const billName = (notes.billName || bill.provider || '').toLowerCase();
        const billAmount = bill.amount || notes.amount || 0;
        const billDueDate = bill.maturityDate || notes.dueDate;

        // Check if merchant/bill name matches (partial match)
        const nameMatch = merchant.includes(billName) || billName.includes(merchant.replace(JOJO_IDENTIFIER, '').trim());

        // Check if amount matches (within 10% tolerance)
        const amountMatch = Math.abs(billAmount - transactionAmount) / billAmount <= 0.1;

        // Check if date is within same month (bill might be paid early/late)
        let dateMatch = true;
        if (billDueDate) {
            const dueDate = new Date(billDueDate);
            dateMatch = dueDate.getMonth() === transactionDate.getMonth() &&
                       dueDate.getFullYear() === transactionDate.getFullYear();
        }

        return nameMatch && amountMatch && dateMatch;
    });
};

/**
 * Update an existing bill with payment information
 */
const updateBillWithPayment = async (bill, transaction) => {
    try {
        let notes = {};
        try {
            notes = bill.notes ? JSON.parse(bill.notes) : {};
        } catch (e) {
            notes = {};
        }

        // Add payment record
        const payments = notes.payments || [];
        payments.push({
            date: transaction.date,
            amount: transaction.amount,
            paymentMethod: transaction.modeOfTransaction || 'card',
            merchant: transaction.merchant,
            description: transaction.description || transaction.narration || '',
            transactionId: transaction._id,
            syncedFrom: 'expense',
            syncedAt: new Date().toISOString()
        });

        const totalPaid = (notes.totalPaid || 0) + transaction.amount;
        const billAmount = bill.amount || notes.amount || 0;

        // Update bill status to paid if full amount is paid
        const status = totalPaid >= billAmount ? 'paid' : 'partial';

        // Update bill with new payment info
        await investmentAPI.update(bill._id, {
            notes: JSON.stringify({
                ...notes,
                status: status,
                totalPaid: totalPaid,
                lastPaymentDate: transaction.date,
                payments: payments,
                autoSynced: true,
                lastSyncedAt: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error updating bill with payment:', error);
        throw error;
    }
};

/**
 * Create a new bill entry from an expense transaction
 */
const createBillFromExpense = async (transaction) => {
    try {
        // Extract bill name from merchant (remove "jo jo" identifier)
        const billName = transaction.merchant.replace(/jo jo/i, '').trim();
        const billType = categorizeBill(billName, transaction.category);

        const billData = {
            category: BILL_CATEGORY_KEY,
            type: 'Bill',
            name: `${billType} - ${billName}`,
            provider: billName,
            accountNumber: '',
            amount: transaction.amount,
            startDate: transaction.date,
            maturityDate: transaction.date, // Use transaction date as due date
            frequency: 'monthly', // Default to monthly, can be updated later
            notes: JSON.stringify({
                billType: billType,
                billName: billName,
                provider: billName,
                cycle: 'monthly',
                amount: transaction.amount,
                dueDate: transaction.date,
                status: 'paid', // Marked as paid since payment was made
                totalPaid: transaction.amount,
                lastPaymentDate: transaction.date,
                autoCreated: true,
                createdFrom: 'expense',
                createdAt: new Date().toISOString(),
                payments: [{
                    date: transaction.date,
                    amount: transaction.amount,
                    paymentMethod: transaction.modeOfTransaction || 'card',
                    merchant: transaction.merchant,
                    description: transaction.description || transaction.narration || '',
                    transactionId: transaction._id,
                    syncedFrom: 'expense',
                    syncedAt: new Date().toISOString()
                }]
            })
        };

        await investmentAPI.create(billData);
    } catch (error) {
        console.error('Error creating bill from expense:', error);
        throw error;
    }
};

/**
 * Categorize bill based on merchant name and category
 */
const categorizeBill = (merchantName, category) => {
    const name = merchantName.toLowerCase();

    // Electricity patterns
    if (name.includes('electric') || name.includes('power') || name.includes('bijli') ||
        name.includes('mseb') || name.includes('discom')) {
        return 'Electricity';
    }

    // Water patterns
    if (name.includes('water') || name.includes('jal') || name.includes('municipal')) {
        return 'Water';
    }

    // Gas patterns
    if (name.includes('gas') || name.includes('lpg') || name.includes('indane') ||
        name.includes('bharat') || name.includes('hp gas')) {
        return 'Gas';
    }

    // Internet patterns
    if (name.includes('internet') || name.includes('broadband') || name.includes('wifi') ||
        name.includes('airtel') || name.includes('jio') || name.includes('bsnl')) {
        return 'Internet';
    }

    // Mobile patterns
    if (name.includes('mobile') || name.includes('recharge') || name.includes('prepaid') ||
        name.includes('postpaid')) {
        return 'Mobile';
    }

    // Rent patterns
    if (name.includes('rent') || name.includes('lease')) {
        return 'Rent';
    }

    // Insurance patterns
    if (name.includes('insurance') || name.includes('policy') || name.includes('premium')) {
        return 'Insurance';
    }

    // School fees patterns
    if (name.includes('school') || name.includes('college') || name.includes('university') ||
        name.includes('fees') || name.includes('tuition')) {
        return 'School Fees';
    }

    // Maintenance patterns
    if (name.includes('maintenance') || name.includes('society') || name.includes('hoa')) {
        return 'Maintenance';
    }

    // Use category if available
    if (category) {
        if (category.includes('utilit')) return 'Utilities';
        if (category.includes('education')) return 'School Fees';
        if (category.includes('healthcare')) return 'Healthcare';
    }

    return 'Other';
};

/**
 * Sync bill status back to expenses when bill is marked as paid
 * This creates a reverse sync - when bill status changes, update related transactions
 * 
 * @param {string} billId - The bill ID that was updated
 * @param {Object} billData - The updated bill data
 */
export const syncBillStatusToExpenses = async (billId, billData) => {
    try {
        let notes = {};
        try {
            notes = billData.notes ? JSON.parse(billData.notes) : {};
        } catch (e) {
            notes = {};
        }

        const payments = notes.payments || [];
        
        // Update any linked transaction statuses
        for (const payment of payments) {
            if (payment.transactionId) {
                // Update transaction notes to reflect bill payment status
                // This would require additional API endpoints in your backend
                console.log('Syncing bill status to transaction:', payment.transactionId);
            }
        }
    } catch (error) {
        console.error('Error syncing bill status to expenses:', error);
    }
};

/**
 * Get all bills that were auto-synced from expenses
 */
export const getAutoSyncedBills = async () => {
    try {
        const billsResponse = await investmentAPI.getAll(BILL_CATEGORY_KEY);
        const bills = billsResponse.data.investments || [];

        return bills.filter(bill => {
            let notes = {};
            try {
                notes = bill.notes ? JSON.parse(bill.notes) : {};
            } catch (e) {
                notes = {};
            }
            return notes.autoCreated || notes.autoSynced;
        });
    } catch (error) {
        console.error('Error fetching auto-synced bills:', error);
        return [];
    }
};

/**
 * Manually link an expense to a bill
 */
export const manuallyLinkExpenseToBill = async (transactionId, billId) => {
    try {
        // Fetch the transaction and bill
        // Update both with cross-references
        console.log('Manually linking transaction', transactionId, 'to bill', billId);
        // Implementation depends on your transaction storage structure
    } catch (error) {
        console.error('Error manually linking expense to bill:', error);
        throw error;
    }
};

export default {
    syncExpenseToBillDates,
    syncBillStatusToExpenses,
    getAutoSyncedBills,
    manuallyLinkExpenseToBill
};
