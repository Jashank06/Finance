import { investmentAPI } from './investmentAPI';
import projectAPI from './projectAPI';
import api from './api';

/**
 * Sync a payment transaction to its target module
 * @param {Object} transaction - The transaction data
 * @param {Object} payingFor - The payingFor object {module, referenceId, referenceName}
 * @param {string} transactionType - Type of transaction ('cash', 'card', 'bank')
 */
export const syncPaymentToModule = async (transaction, payingFor, transactionType) => {
    if (!payingFor || !payingFor.module || !payingFor.referenceId) {
        return; // No sync needed
    }

    const { module, referenceId } = payingFor;

    try {
        switch (module) {
            case 'loan-ledger':
                await syncToLoanLedger(transaction, referenceId);
                break;

            case 'project-expense':
            case 'project-income':
                await syncToProject(transaction, referenceId, module);
                break;

            case 'loan-amortization':
                await syncToLoanAmortization(transaction, referenceId);
                break;

            case 'targets':
                await syncToTargets(transaction, referenceId);
                break;

            case 'nps-investments':
                await syncToNpsInvestments(transaction, referenceId);
                break;

            case 'gold-investments':
                await syncToGoldInvestments(transaction, referenceId);
                break;

            case 'rd-fd-deposits':
                await syncToRdFdDeposits(transaction, referenceId);
                break;

            case 'cheque-register':
                await syncToChequeRegister(transaction, referenceId);
                break;

            case 'daily-cash':
                await syncToDailyCash(transaction, referenceId);
                break;

            case 'manage-finance':
                await syncToManageFinance(transaction, referenceId);
                break;

            case 'bill-dates':
                await syncToBillDates(transaction, referenceId);
                break;

            default:
                console.warn(`Sync not implemented for module: ${module}`);
        }
    } catch (error) {
        console.error(`Error syncing payment to ${module}:`, error);
        throw error;
    }
};

/**
 * Sync payment to Loan Ledger (Udhar Lena/Dena)
 */
const syncToLoanLedger = async (transaction, loanId) => {
    try {
        // Fetch the loan
        const response = await investmentAPI.getAll('loan-ledger');
        const loan = response.data.investments.find(l => l._id === loanId);

        if (!loan) {
            throw new Error('Loan not found');
        }

        // Parse existing notes
        const notes = JSON.parse(loan.notes || '{}');
        const paymentAmount = transaction.amount;

        // Update payment history
        const payments = notes.payments || [];
        payments.push({
            date: transaction.date,
            amount: paymentAmount,
            paymentDetails: `${transaction.merchant} (via ${transaction.modeOfTransaction || 'transaction'})`,
            comments: transaction.description || '',
            transactionId: transaction._id
        });

        // Update totals
        const totalPaid = (notes.totalPaid || 0) + paymentAmount;
        const balanceAmount = loan.amount - totalPaid;

        // Update loan
        await investmentAPI.update(loanId, {
            notes: JSON.stringify({
                ...notes,
                totalPaid,
                balanceAmount,
                payments
            })
        });

        console.log('Successfully synced payment to Loan Ledger');
    } catch (error) {
        console.error('Error syncing to Loan Ledger:', error);
        throw error;
    }
};

/**
 * Sync payment to Project Wise Income/Expense
 */
const syncToProject = async (transaction, projectId, module) => {
    try {
        // Create a new project income/expense entry
        const entryData = {
            category: 'project-wise',
            type: module === 'project-income' ? 'Income' : 'Expense',
            name: transaction.payingFor.referenceName, // Project name
            source: transaction.merchant || 'Payment',
            amount: transaction.amount,
            startDate: transaction.date,
            frequency: 'one-time',
            notes: `${transaction.description || ''} (Transaction ID: ${transaction._id})`
        };

        await investmentAPI.create(entryData);
        console.log('Successfully synced payment to Project');
    } catch (error) {
        console.error('Error syncing to Project:', error);
        throw error;
    }
};

/**
 * Sync payment to Loan Amortization
 */
const syncToLoanAmortization = async (transaction, loanId) => {
    try {
        // Similar logic to loan ledger but for amortization loans
        // This would update the loan's payment schedule
        console.log('Syncing to Loan Amortization:', loanId);
        // Implementation depends on your loan amortization structure
    } catch (error) {
        console.error('Error syncing to Loan Amortization:', error);
        throw error;
    }
};

/**
 * Sync payment to Targets for Life
 */
const syncToTargets = async (transaction, targetId) => {
    try {
        const response = await investmentAPI.getAll('targets');
        const target = response.data.investments.find(t => t._id === targetId);

        if (!target) {
            throw new Error('Target not found');
        }

        const notes = JSON.parse(target.notes || '{}');
        const payments = notes.payments || [];
        payments.push({
            date: transaction.date,
            amount: transaction.amount,
            source: transaction.merchant,
            description: transaction.description || '',
            transactionId: transaction._id
        });

        const totalPaid = (notes.totalPaid || 0) + transaction.amount;
        const remaining = target.amount - totalPaid;

        await investmentAPI.update(targetId, {
            notes: JSON.stringify({
                ...notes,
                totalPaid,
                remaining,
                payments
            })
        });

        console.log('Successfully synced payment to Targets');
    } catch (error) {
        console.error('Error syncing to Targets:', error);
        throw error;
    }
};

/**
 * Sync payment to NPS/PPF Investments
 */
const syncToNpsInvestments = async (transaction, investmentId) => {
    try {
        const response = await investmentAPI.getAll('nps-ppf');
        const investment = response.data.investments.find(i => i._id === investmentId);

        if (!investment) {
            throw new Error('Investment not found');
        }

        const notes = JSON.parse(investment.notes || '{}');
        const contributions = notes.contributions || [];
        contributions.push({
            date: transaction.date,
            amount: transaction.amount,
            source: transaction.merchant,
            transactionId: transaction._id
        });

        const totalContributed = (notes.totalContributed || 0) + transaction.amount;

        await investmentAPI.update(investmentId, {
            notes: JSON.stringify({
                ...notes,
                totalContributed,
                contributions
            })
        });

        console.log('Successfully synced payment to NPS/PPF');
    } catch (error) {
        console.error('Error syncing to NPS/PPF:', error);
        throw error;
    }
};

/**
 * Sync payment to Gold/SGB Investments
 */
const syncToGoldInvestments = async (transaction, investmentId) => {
    try {
        const response = await investmentAPI.getAll('gold-sgb');
        const investment = response.data.investments.find(i => i._id === investmentId);

        if (!investment) {
            throw new Error('Investment not found');
        }

        const notes = JSON.parse(investment.notes || '{}');
        const purchases = notes.purchases || [];
        purchases.push({
            date: transaction.date,
            amount: transaction.amount,
            source: transaction.merchant,
            transactionId: transaction._id
        });

        const totalInvested = (notes.totalInvested || 0) + transaction.amount;

        await investmentAPI.update(investmentId, {
            notes: JSON.stringify({
                ...notes,
                totalInvested,
                purchases
            })
        });

        console.log('Successfully synced payment to Gold/SGB');
    } catch (error) {
        console.error('Error syncing to Gold/SGB:', error);
        throw error;
    }
};

/**
 * Sync payment to RD/FD Deposits
 */
const syncToRdFdDeposits = async (transaction, depositId) => {
    try {
        const response = await investmentAPI.getAll('bank-schemes');
        const deposit = response.data.investments.find(d => d._id === depositId);

        if (!deposit) {
            throw new Error('Deposit not found');
        }

        const notes = JSON.parse(deposit.notes || '{}');
        const deposits = notes.deposits || [];
        deposits.push({
            date: transaction.date,
            amount: transaction.amount,
            source: transaction.merchant,
            transactionId: transaction._id
        });

        const totalDeposited = (notes.totalDeposited || 0) + transaction.amount;

        await investmentAPI.update(depositId, {
            notes: JSON.stringify({
                ...notes,
                totalDeposited,
                deposits
            })
        });

        console.log('Successfully synced payment to RD/FD');
    } catch (error) {
        console.error('Error syncing to RD/FD:', error);
        throw error;
    }
};

/**
 * Sync payment to Cheque Register
 */
const syncToChequeRegister = async (transaction, chequeId) => {
    try {
        // Log the payment - implement based on your cheque register structure
        console.log('Syncing to Cheque Register:', chequeId);
        console.log('Transaction:', transaction);
        // TODO: Implement actual sync logic when API is ready
    } catch (error) {
        console.error('Error syncing to Cheque Register:', error);
        throw error;
    }
};

/**
 * Sync payment to Daily Cash Register
 */
const syncToDailyCash = async (transaction, entryId) => {
    try {
        console.log('Syncing to Daily Cash Register:', entryId);
        console.log('Transaction:', transaction);
        // TODO: Implement actual sync logic when API is ready
    } catch (error) {
        console.error('Error syncing to Daily Cash:', error);
        throw error;
    }
};

/**
 * Sync payment to Manage Finance
 */
const syncToManageFinance = async (transaction, expenseId) => {
    try {
        const response = await api.get('/scheduled-expenses');
        const expense = response.data.find(e => e._id === expenseId);

        if (!expense) {
            throw new Error('Scheduled expense not found');
        }

        // Mark expense as paid
        await api.put(`/scheduled-expenses/${expenseId}`, {
            ...expense,
            isPaid: true,
            paidDate: transaction.date,
            paidAmount: transaction.amount,
            paymentTransactionId: transaction._id,
            paymentMethod: transaction.modeOfTransaction || 'transaction'
        });

        console.log('Successfully synced payment to Manage Finance');
    } catch (error) {
        console.error('Error syncing to Manage Finance:', error);
        throw error;
    }
};

/**
 * Sync payment to Bill Dates
 */
const syncToBillDates = async (transaction, billId) => {
    try {
        const response = await investmentAPI.getAll('daily-bill-checklist');
        const bill = response.data.investments.find(b => b._id === billId);

        if (!bill) {
            throw new Error('Bill not found');
        }

        // Parse existing notes
        let notes = {};
        try { notes = bill.notes ? JSON.parse(bill.notes) : {}; } catch { }

        // Update payment details
        const payments = notes.payments || [];
        payments.push({
            date: transaction.date,
            amount: transaction.amount,
            paymentMethod: transaction.modeOfTransaction || 'transaction',
            merchant: transaction.merchant,
            description: transaction.description || '',
            transactionId: transaction._id
        });

        const totalPaid = (notes.totalPaid || 0) + transaction.amount;
        const billAmount = bill.amount || notes.amount || 0;

        // Update bill status to paid if full amount is paid
        const status = totalPaid >= billAmount ? 'paid' : 'partial';

        // Update bill with new payment info
        await investmentAPI.update(billId, {
            notes: JSON.stringify({
                ...notes,
                status: status,
                totalPaid: totalPaid,
                lastPaymentDate: transaction.date,
                payments: payments
            })
        });

        // If this bill is synced from Manage Finance, update it there too
        if (notes.syncedFrom === 'Manage Finance' && notes.manageFinanceId) {
            try {
                await syncToManageFinance(transaction, notes.manageFinanceId);
            } catch (error) {
                console.warn('Could not sync to Manage Finance:', error);
            }
        }

        console.log('Successfully synced payment to Bill Dates');
    } catch (error) {
        console.error('Error syncing to Bill Dates:', error);
        throw error;
    }
};

/**
 * Sync payment to Bill Checklist
 */
const syncToBillChecklist = async (transaction, billId) => {
    try {
        console.log('Syncing to Bill Checklist:', billId);
        console.log('Transaction:', transaction);
        // TODO: Implement actual sync logic when API is ready
    } catch (error) {
        console.error('Error syncing to Bill Checklist:', error);
        throw error;
    }
};

/**
 * Sync payment to Calendars
 */
const syncToCalendars = async (transaction, eventId) => {
    try {
        console.log('Syncing to Calendars:', eventId);
        console.log('Transaction:', transaction);
        // TODO: Implement actual sync logic when API is ready
    } catch (error) {
        console.error('Error syncing to Calendars:', error);
        throw error;
    }
};

/**
 * Sync payment to Retirement Planner
 */
const syncToRetirementPlanner = async (transaction, planId) => {
    try {
        console.log('Syncing to Retirement Planner:', planId);
        console.log('Transaction:', transaction);
        // TODO: Implement actual sync logic when API is ready
    } catch (error) {
        console.error('Error syncing to Retirement Planner:', error);
        throw error;
    }
};

/**
 * Get module configuration
 */
export const getModuleConfig = () => {
    return {
        'loan-ledger': {
            label: 'Udhar Lena/Dena',
            description: 'Link payment to a loan entry'
        },
        'project-expense': {
            label: 'Project Wise Income / Expense',
            description: 'Link payment to a project'
        },
        'loan-amortization': {
            label: 'Loan Management',
            description: 'Link payment to an amortization loan'
        }
    };
};
