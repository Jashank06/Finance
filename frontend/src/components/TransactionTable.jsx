import React from 'react';
import './TransactionTable.css';

const TransactionTable = ({
  transactions,
  currency = 'INR',
  initialBalance = 0,
  onEdit,
  onDelete,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions yet. Click "Add Transaction" to record an expense or income.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // For newest-first sorting (standard for latest transactions)
  // We calculate the total net amount of ALL transactions to find the current total balance
  const totalNetAmount = transactions.reduce((total, t) => {
    const isDebit = t.type === 'debit' || t.type === 'withdrawal' || t.type === 'purchase' || t.type === 'payment' || t.type === 'fee' || t.type === 'expense' || t.type === 'transfer';
    const isCredit = t.type === 'credit' || t.type === 'deposit' || t.type === 'refund' || t.type === 'income' || t.type === 'interest';
    const amount = parseFloat(t.amount || 0);
    if (isDebit) return total - amount;
    if (isCredit) return total + amount;
    return total;
  }, 0);

  // Starting balance for the entire list (current balance)
  let currentRunningBalance = initialBalance + totalNetAmount;

  // For the current page, we need to subtract transactions that occurred AFTER the items on this page
  // (i.e., items from index 0 to startIndex - 1)
  for (let i = 0; i < startIndex; i++) {
    const t = transactions[i];
    const isDebit = t.type === 'debit' || t.type === 'withdrawal' || t.type === 'purchase' || t.type === 'payment' || t.type === 'fee' || t.type === 'expense' || t.type === 'transfer';
    const isCredit = t.type === 'credit' || t.type === 'deposit' || t.type === 'refund' || t.type === 'income' || t.type === 'interest';
    const amount = parseFloat(t.amount || 0);
    if (isDebit) currentRunningBalance += amount; // Add back debit to go back in time
    else if (isCredit) currentRunningBalance -= amount; // Subtract credit to go back in time
  }

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Date</th>
            <th>Transaction Type</th>
            <th>Mode of Transaction</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
            <th>Broader Category</th>
            <th>Main Category</th>
            <th>Sub Category</th>
            <th>Relevance/Expense Type</th>
            <th>Details (Narration)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map((transaction, index) => {
            const absoluteIndex = startIndex + index;
            const isDebit = transaction.type === 'debit' ||
              transaction.type === 'withdrawal' ||
              transaction.type === 'purchase' ||
              transaction.type === 'payment' ||
              transaction.type === 'fee' ||
              transaction.type === 'expense' ||
              transaction.type === 'transfer';

            const isCredit = transaction.type === 'credit' ||
              transaction.type === 'deposit' ||
              transaction.type === 'refund' ||
              transaction.type === 'income' ||
              transaction.type === 'interest';

            const debit = isDebit ? transaction.amount : 0;
            const credit = isCredit ? transaction.amount : 0;

            const rowBalance = currentRunningBalance;
            
            const amt = parseFloat(transaction.amount || 0);
            
            // Update running balance for NEXT row (going back in time)
            if (isDebit) {
              currentRunningBalance += amt;
            } else if (isCredit) {
              currentRunningBalance -= amt;
            }

            return (
              <tr key={transaction._id}>
                <td className="sr-no">{absoluteIndex + 1}</td>
                <td className="date-col">{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                <td className="transaction-type-col">
                  <span className={`type-badge ${transaction.type === 'debit' || isDebit ? 'debit-badge' : 'credit-badge'}`}>
                    {transaction.type === 'debit' || isDebit ? 'Debit' : 'Credit'}
                  </span>
                </td>
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
                <td className={`balance-amount ${rowBalance < 0 ? 'negative' : ''}`}>
                  {currency} {rowBalance.toLocaleString('en-IN')}
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

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`pagination-page ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
