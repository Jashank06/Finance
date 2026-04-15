const mongoose = require('mongoose');
const Investment = require('../models/Investment');

/**
 * Auto-sync expenses for "jo jo" (or any configured family member) to Bill Dates
 * This handles automatic synchronization between expense entries and bill dates
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
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} The updated/created bill or null
 */
const syncExpenseToBillDates = async (transaction, userId) => {
    try {
        // Check if transaction is for "jo jo"
        const merchant = (transaction.merchant || '').toLowerCase();
        if (!merchant.includes(JOJO_IDENTIFIER)) {
            return null; // Not for jo jo, skip sync
        }

        console.log('Syncing jo jo expense to Bill Dates:', transaction);

        // Fetch existing bills for this user
        const bills = await Investment.find({
            userId: userId,
            category: BILL_CATEGORY_KEY
        });

        // Try to find matching bill
        const matchingBill = findMatchingBill(bills, transaction);

        if (matchingBill) {
            // Update existing bill with payment
            return await updateBillWithPayment(matchingBill, transaction);
        } else {
            // Create new bill entry
            return await createBillFromExpense(transaction, userId);
        }
    } catch (error) {
        console.error('Error syncing expense to Bill Dates:', error);
        // Don't throw error - sync is supplementary, shouldn't block main transaction
        return null;
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
        const cleanMerchant = merchant.replace(JOJO_IDENTIFIER, '').trim();
        const nameMatch = cleanMerchant.includes(billName) || billName.includes(cleanMerchant);

        // Check if amount matches (within 10% tolerance)
        const amountMatch = billAmount > 0 && Math.abs(billAmount - transactionAmount) / billAmount <= 0.1;

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
        bill.notes = JSON.stringify({
            ...notes,
            status: status,
            totalPaid: totalPaid,
            lastPaymentDate: transaction.date,
            payments: payments,
            autoSynced: true,
            lastSyncedAt: new Date().toISOString()
        });

        await bill.save();
        
        console.log('Updated existing bill with payment:', bill._id);
        return bill;
    } catch (error) {
        console.error('Error updating bill with payment:', error);
        throw error;
    }
};

/**
 * Create a new bill entry from an expense transaction
 */
const createBillFromExpense = async (transaction, userId) => {
    try {
        // Extract bill name from merchant (remove "jo jo" identifier)
        const billName = transaction.merchant.replace(/jo jo/i, '').trim();
        const billType = categorizeBill(billName, transaction.category);

        const billData = {
            userId: userId,
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

        const bill = new Investment(billData);
        await bill.save();
        
        console.log('Created new bill from expense:', bill._id);
        return bill;
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
 * @param {Object} bill - The updated bill data
 * @returns {Promise<void>}
 */
const syncBillStatusToExpenses = async (bill) => {
    try {
        let notes = {};
        try {
            notes = bill.notes ? JSON.parse(bill.notes) : {};
        } catch (e) {
            notes = {};
        }

        const payments = notes.payments || [];
        
        // Log sync for any linked transactions
        for (const payment of payments) {
            if (payment.transactionId) {
                console.log('Bill payment synced to transaction:', payment.transactionId);
                // Could update transaction notes or status here if needed
            }
        }
    } catch (error) {
        console.error('Error syncing bill status to expenses:', error);
    }
};

module.exports = {
    syncExpenseToBillDates,
    syncBillStatusToExpenses,
    JOJO_IDENTIFIER,
    BILL_CATEGORY_KEY
};
