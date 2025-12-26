import React from 'react';
import './TransactionTable.css';

const TransactionTable = ({
  transactions,
  currency = 'INR',
  initialBalance = 0,
  onEdit,
  onDelete
}) => {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions yet. Click "Add Transaction" to record an expense or income.</p>
      </div>
    );
  }

  // Calculate running balance
  let runningBalance = initialBalance;

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Date</th>
            <th>Mode of Transaction</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
            <th>Type of Transaction</th>
            <th>Broader Category</th>
            <th>Main Category</th>
            <th>Sub Category</th>
            <th>Relevance/Expense Type</th>
            <th>Details (Narration)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => {
            // Determine if it's debit or credit
            const isDebit = transaction.type === 'withdrawal' ||
              transaction.type === 'purchase' ||
              transaction.type === 'payment' ||
              transaction.type === 'fee' ||
              transaction.type === 'expense' ||
              transaction.type === 'transfer';

            const isCredit = transaction.type === 'deposit' ||
              transaction.type === 'refund' ||
              transaction.type === 'income' ||
              transaction.type === 'interest';

            const debit = isDebit ? transaction.amount : 0;
            const credit = isCredit ? transaction.amount : 0;

            // Update running balance
            if (isDebit) {
              runningBalance -= transaction.amount;
            } else if (isCredit) {
              runningBalance += transaction.amount;
            }

            return (
              <tr key={transaction._id}>
                <td className="sr-no">{index + 1}</td>
                <td className="date-col">{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                <td className="mode-col">
                  <span className="mode-badge">
                    {transaction.modeOfTransaction ?
                      transaction.modeOfTransaction.toUpperCase().replace(/-/g, ' ') :
                      (transaction.type === 'purchase' || transaction.type === 'payment' ? 'CARD' : 'NEFT')
                    }
                  </span>
                </td>
                <td className="description-col">
                  {transaction.merchant || transaction.description || '-'}
                </td>
                <td className="debit-amount">
                  {debit > 0 ? `${currency} ${debit.toLocaleString('en-IN')}` : '-'}
                </td>
                <td className="credit-amount">
                  {credit > 0 ? `${currency} ${credit.toLocaleString('en-IN')}` : '-'}
                </td>
                <td className={`balance-amount ${runningBalance < 0 ? 'negative' : ''}`}>
                  {currency} {runningBalance.toLocaleString('en-IN')}
                </td>
                <td className="transaction-type-col">
                  {transaction.transactionType ?
                    transaction.transactionType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                    '-'
                  }
                </td>
                <td className="category-col">
                  {transaction.broaderCategory || '-'}
                </td>
                <td className="category-col">
                  {transaction.mainCategory || '-'}
                </td>
                <td className="category-col">
                  {transaction.subCategory === 'Other' && transaction.customSubCategory
                    ? transaction.customSubCategory
                    : (transaction.subCategory || '-')}
                </td>
                <td className="expense-type-col">
                  {transaction.expenseType ?
                    transaction.expenseType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                    '-'
                  }
                </td>
                <td className="narration-col">
                  {transaction.narration || transaction.notes || transaction.description || '-'}
                </td>
                <td className="actions-col">
                  <div className="table-actions">
                    <button
                      onClick={() => onEdit && onEdit(transaction)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(transaction._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
