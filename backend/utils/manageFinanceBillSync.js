const mongoose = require('mongoose');
const Investment = require('../models/Investment');

/**
 * Sync between Manage Finance (Scheduled Expenses) and Bill Dates
 * This creates bidirectional synchronization:
 * 1. Scheduled Expense → Bill Dates (auto-create bill)
 * 2. Bill Dates (paid) → Scheduled Expense (mark as paid)
 */

const BILL_CATEGORY_KEY = 'daily-bill-checklist';

/**
 * Sync scheduled expense to Bill Dates
 * When a scheduled expense is created in Manage Finance, automatically create
 * corresponding bill entry in Bill Dates
 * 
 * @param {Object} scheduledExpense - The scheduled expense document
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} The created/updated bill or null
 */
const syncScheduledExpenseToBillDates = async (scheduledExpense, userId) => {
    try {
        console.log('Syncing scheduled expense to Bill Dates:', scheduledExpense.title);

        // Check if bill already exists for this scheduled expense
        const existingBills = await Investment.find({
            userId: userId,
            category: BILL_CATEGORY_KEY
        });

        // Try to find matching bill
        const matchingBill = existingBills.find(bill => {
            let notes = {};
            try {
                notes = bill.notes ? JSON.parse(bill.notes) : {};
            } catch (e) {
                notes = {};
            }
            
            // Check if bill is linked to this scheduled expense
            return notes.scheduledExpenseId === scheduledExpense._id.toString();
        });

        if (matchingBill) {
            // Update existing bill
            return await updateBillFromScheduledExpense(matchingBill, scheduledExpense);
        } else {
            // Create new bill
            return await createBillFromScheduledExpense(scheduledExpense, userId);
        }
    } catch (error) {
        console.error('Error syncing scheduled expense to Bill Dates:', error);
        return null;
    }
};

/**
 * Create a new bill in Bill Dates from a scheduled expense
 */
const createBillFromScheduledExpense = async (scheduledExpense, userId) => {
    try {
        const billType = mapCategoryToBillType(scheduledExpense.category);
        
        const billData = {
            userId: userId,
            category: BILL_CATEGORY_KEY,
            type: 'Bill',
            name: `${billType} - ${scheduledExpense.title}`,
            provider: scheduledExpense.title,
            accountNumber: scheduledExpense.bankAccount || '',
            amount: scheduledExpense.amount,
            startDate: scheduledExpense.createdAt || new Date(),
            maturityDate: scheduledExpense.dueDate,
            frequency: scheduledExpense.frequency,
            notes: JSON.stringify({
                billType: billType,
                billName: scheduledExpense.title,
                provider: scheduledExpense.title,
                cycle: scheduledExpense.frequency,
                amount: scheduledExpense.amount,
                dueDate: scheduledExpense.dueDate,
                status: 'pending',
                autoCreated: true,
                createdFrom: 'manage-finance',
                scheduledExpenseId: scheduledExpense._id.toString(),
                syncedAt: new Date().toISOString(),
                description: scheduledExpense.description || '',
                bankAccount: scheduledExpense.bankAccount || '',
                payments: []
            })
        };

        const bill = new Investment(billData);
        await bill.save();
        
        console.log('Created bill in Bill Dates from scheduled expense:', bill._id);
        return bill;
    } catch (error) {
        console.error('Error creating bill from scheduled expense:', error);
        throw error;
    }
};

/**
 * Update existing bill from scheduled expense
 */
const updateBillFromScheduledExpense = async (bill, scheduledExpense) => {
    try {
        let notes = {};
        try {
            notes = bill.notes ? JSON.parse(bill.notes) : {};
        } catch (e) {
            notes = {};
        }

        // Update bill details
        bill.name = `${mapCategoryToBillType(scheduledExpense.category)} - ${scheduledExpense.title}`;
        bill.provider = scheduledExpense.title;
        bill.amount = scheduledExpense.amount;
        bill.maturityDate = scheduledExpense.dueDate;
        bill.frequency = scheduledExpense.frequency;
        bill.accountNumber = scheduledExpense.bankAccount || '';

        // Update notes
        notes.billName = scheduledExpense.title;
        notes.amount = scheduledExpense.amount;
        notes.dueDate = scheduledExpense.dueDate;
        notes.cycle = scheduledExpense.frequency;
        notes.description = scheduledExpense.description || '';
        notes.bankAccount = scheduledExpense.bankAccount || '';
        notes.lastSyncedAt = new Date().toISOString();

        bill.notes = JSON.stringify(notes);
        await bill.save();

        console.log('Updated bill in Bill Dates from scheduled expense:', bill._id);
        return bill;
    } catch (error) {
        console.error('Error updating bill from scheduled expense:', error);
        throw error;
    }
};

/**
 * Map Manage Finance category to Bill Type
 */
const mapCategoryToBillType = (category) => {
    const categoryMap = {
        'bill': 'Bill',
        'emi': 'EMI',
        'rent': 'Rent',
        'utilities': 'Utilities',
        'insurance': 'Insurance',
        'loan': 'Loan',
        'credit-card': 'Credit Card',
        'subscription': 'Subscription',
        'education': 'School Fees',
        'other': 'Other'
    };
    
    return categoryMap[category] || 'Other';
};

/**
 * Sync payment from Bill Dates back to Scheduled Expense
 * When a bill is marked as paid in Bill Dates, update the scheduled expense
 * 
 * @param {Object} bill - The bill that was marked as paid
 * @returns {Promise<Object|null>} The updated scheduled expense or null
 */
const syncBillPaymentToScheduledExpense = async (bill) => {
    try {
        let notes = {};
        try {
            notes = bill.notes ? JSON.parse(bill.notes) : {};
        } catch (e) {
            notes = {};
        }

        // Check if this bill is linked to a scheduled expense
        if (!notes.scheduledExpenseId) {
            return null; // Not linked to scheduled expense
        }

        const ScheduledExpense = mongoose.model('ScheduledExpense');
        const scheduledExpense = await ScheduledExpense.findById(notes.scheduledExpenseId);

        if (!scheduledExpense) {
            console.log('Scheduled expense not found:', notes.scheduledExpenseId);
            return null;
        }

        // Check if bill status is paid
        if (notes.status === 'paid') {
            console.log('Bill is paid, syncing to scheduled expense:', scheduledExpense.title);

            // Update scheduled expense for next cycle
            if (scheduledExpense.frequency !== 'one-time') {
                const currentDue = new Date(scheduledExpense.dueDate);
                let nextDue;

                switch (scheduledExpense.frequency) {
                    case 'monthly':
                        nextDue = new Date(currentDue.getFullYear(), currentDue.getMonth() + 1, currentDue.getDate());
                        break;
                    case 'quarterly':
                        nextDue = new Date(currentDue.getFullYear(), currentDue.getMonth() + 3, currentDue.getDate());
                        break;
                    case 'yearly':
                        nextDue = new Date(currentDue.getFullYear() + 1, currentDue.getMonth(), currentDue.getDate());
                        break;
                    default:
                        nextDue = currentDue;
                }

                scheduledExpense.dueDate = nextDue;
            } else {
                // For one-time expenses, mark as inactive
                scheduledExpense.isActive = false;
            }

            scheduledExpense.updatedAt = new Date();
            await scheduledExpense.save();

            // Also update the bill's due date to match
            bill.maturityDate = scheduledExpense.dueDate;
            notes.dueDate = scheduledExpense.dueDate;
            notes.lastPaymentSyncedAt = new Date().toISOString();
            bill.notes = JSON.stringify(notes);
            await bill.save();

            console.log('Successfully synced payment to scheduled expense');
            return scheduledExpense;
        }

        return null;
    } catch (error) {
        console.error('Error syncing bill payment to scheduled expense:', error);
        return null;
    }
};

/**
 * Delete bill when scheduled expense is deleted
 * 
 * @param {string} scheduledExpenseId - The scheduled expense ID
 * @param {string} userId - The user ID
 */
const deleteBillForScheduledExpense = async (scheduledExpenseId, userId) => {
    try {
        const bills = await Investment.find({
            userId: userId,
            category: BILL_CATEGORY_KEY
        });

        for (const bill of bills) {
            let notes = {};
            try {
                notes = bill.notes ? JSON.parse(bill.notes) : {};
            } catch (e) {
                continue;
            }

            if (notes.scheduledExpenseId === scheduledExpenseId) {
                await Investment.findByIdAndDelete(bill._id);
                console.log('Deleted linked bill:', bill._id);
            }
        }
    } catch (error) {
        console.error('Error deleting bill for scheduled expense:', error);
    }
};

/**
 * Get all bills that are synced from Manage Finance
 */
const getManagedFinanceBills = async (userId) => {
    try {
        const bills = await Investment.find({
            userId: userId,
            category: BILL_CATEGORY_KEY
        });

        return bills.filter(bill => {
            let notes = {};
            try {
                notes = bill.notes ? JSON.parse(bill.notes) : {};
            } catch (e) {
                return false;
            }
            return notes.createdFrom === 'manage-finance';
        });
    } catch (error) {
        console.error('Error fetching managed finance bills:', error);
        return [];
    }
};

module.exports = {
    syncScheduledExpenseToBillDates,
    syncBillPaymentToScheduledExpense,
    deleteBillForScheduledExpense,
    getManagedFinanceBills,
    BILL_CATEGORY_KEY
};
