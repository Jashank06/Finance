import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiCheck, FiX, FiSave, FiTrendingUp, FiDollarSign, FiPieChart, FiActivity, FiClock, FiCheckCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import './BillChecklistNew.css';

const BillChecklistNew = () => {
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'Household', bills: ['Mortgage/Rent', 'Electricity', 'Gas', 'Water', 'Alarm/security system', 'Garden services', 'Cleaning services', 'Other'] },
    { name: 'Insurance', bills: ['Car', 'Life', 'Household', 'Health', 'Other'] },
    { name: 'Loans, credit & overdrafts', bills: ['Car', 'Student', 'Personal', 'Credit card', 'Other'] },
    { name: 'Savings', bills: ['Personal', 'Retirement', 'Holiday', 'Other'] },
    { name: 'Other', bills: ['School fees', 'Mobile & telephone', 'Internet', 'Netflix or similar'] }
  ]);
  
  // Removed calendar view - only spreadsheet view now
  const [editingBill, setEditingBill] = useState(null);
  const [showAddBill, setShowAddBill] = useState({ show: false, category: null });
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBillForm, setNewBillForm] = useState({
    billName: '',
    dueDate: '',
    onlinePaymentUrl: '',
    username: '',
    password: '',
    modeOfPayment: '',
    amount: 0
  });
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const CATEGORY_KEY = 'daily-bill-checklist-new';
  const CATEGORIES_KEY = 'bill-checklist-categories';

  // Summary Calculations
  const summaryData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    let totalBills = 0;
    let totalAmount = 0;
    let paidThisMonth = 0;
    let unpaidThisMonth = 0;
    let overdueThisMonth = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    
    const categoryStats = {};
    const monthlyTrend = [];
    const paymentStatus = { paid: 0, unpaid: 0, overdue: 0 };
    
    // Initialize category stats
    categories.forEach(cat => {
      categoryStats[cat.name] = { count: 0, amount: 0, paid: 0 };
    });
    
    // Calculate monthly trend for last 6 months
    for (let i = 5; i >= 0; i--) {
      const trendDate = new Date(currentYear, currentMonth - i, 1);
      const trendMonthKey = `${trendDate.getFullYear()}-${String(trendDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = trendDate.toLocaleString('en-US', { month: 'short' });
      
      let monthPaid = 0;
      let monthTotal = 0;
      
      bills.forEach(bill => {
        const payment = bill.payments?.[trendMonthKey];
        if (payment) {
          monthTotal += Number(payment.amount) || Number(bill.amount) || 0;
          if (payment.done) {
            monthPaid += Number(payment.amount) || Number(bill.amount) || 0;
          }
        }
      });
      
      monthlyTrend.push({
        month: monthName,
        paid: monthPaid,
        unpaid: monthTotal - monthPaid,
        total: monthTotal
      });
    }
    
    // Process bills for current stats
    bills.forEach(bill => {
      totalBills++;
      totalAmount += Number(bill.amount) || 0;
      
      const category = bill.category || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, amount: 0, paid: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].amount += Number(bill.amount) || 0;
      
      const currentPayment = bill.payments?.[currentMonthKey];
      if (currentPayment) {
        if (currentPayment.done) {
          paidThisMonth++;
          paidAmount += Number(currentPayment.amount) || Number(bill.amount) || 0;
          categoryStats[category].paid++;
          paymentStatus.paid++;
        } else {
          unpaidThisMonth++;
          unpaidAmount += Number(currentPayment.amount) || Number(bill.amount) || 0;
          paymentStatus.unpaid++;
          
          // Check if overdue
          const dueDate = Number(bill.dueDate);
          const today = now.getDate();
          if (dueDate && today > dueDate) {
            overdueThisMonth++;
            paymentStatus.overdue++;
          }
        }
      } else {
        unpaidThisMonth++;
        unpaidAmount += Number(bill.amount) || 0;
        paymentStatus.unpaid++;
        
        // Check if overdue
        const dueDate = Number(bill.dueDate);
        const today = now.getDate();
        if (dueDate && today > dueDate) {
          overdueThisMonth++;
          paymentStatus.overdue++;
        }
      }
    });
    
    const completionRate = totalBills > 0 ? Math.round((paidThisMonth / totalBills) * 100) : 0;
    
    return {
      totalBills,
      totalAmount,
      paidThisMonth,
      unpaidThisMonth,
      overdueThisMonth,
      paidAmount,
      unpaidAmount,
      completionRate,
      categoryStats: Object.entries(categoryStats).map(([name, stats]) => ({
        name,
        ...stats,
        completion: stats.count > 0 ? Math.round((stats.paid / stats.count) * 100) : 0
      })),
      monthlyTrend,
      paymentStatus
    };
  }, [bills, categories]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    fetchBills();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await investmentAPI.getAll(CATEGORIES_KEY);
      
      if (res.data.investments && res.data.investments.length > 0) {
        const savedCategories = JSON.parse(res.data.investments[0].notes || '{}');
        
        if (savedCategories.categories && Array.isArray(savedCategories.categories)) {
          setCategories(savedCategories.categories);
        }
      }
    } catch (e) {
      console.log('Using default categories');
    }
  };

  const saveCategories = async () => {
    try {
      const payload = {
        category: CATEGORIES_KEY,
        type: 'Categories',
        name: 'Bill Categories',
        amount: 0,
        startDate: new Date().toISOString().slice(0, 10),
        notes: JSON.stringify({ categories })
      };
      
      const existing = await investmentAPI.getAll(CATEGORIES_KEY);
      
      if (existing.data.investments && existing.data.investments.length > 0) {
        await investmentAPI.update(existing.data.investments[0]._id, payload);
      } else {
        await investmentAPI.create(payload);
      }
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const loadedBills = (res.data.investments || []).map(inv => {
        const notes = inv.notes ? JSON.parse(inv.notes) : {};
        return {
          _id: inv._id,
          category: notes.category || 'Other',
          billName: notes.billName || inv.name,
          dueDate: notes.dueDate || '',
          onlinePaymentUrl: notes.onlinePaymentUrl || '',
          username: notes.username || '',
          password: notes.password || '',
          modeOfPayment: notes.modeOfPayment || '',
          amount: inv.amount || 0,
          payments: notes.payments || {} // { 'YYYY-MM': { amount, datePaid, done } }
        };
      });
      setBills(loadedBills);
    } catch (e) {
      console.error('Error fetching bills:', e);
    }
  };

  const saveBill = async (billData, skipFetch = false) => {
    try {
      const payload = {
        category: CATEGORY_KEY,
        type: 'Bill',
        name: billData.billName,
        amount: billData.amount || 0,
        startDate: new Date().toISOString().slice(0, 10),
        notes: JSON.stringify(billData)
      };

      if (billData._id) {
        await investmentAPI.update(billData._id, payload);
      } else {
        await investmentAPI.create(payload);
      }
      
      // Only fetch bills if not skipping (for immediate updates)
      if (!skipFetch) {
        await fetchBills();
      }
    } catch (e) {
      alert('Error saving bill: ' + (e.response?.data?.message || e.message));
    }
  };

  const deleteBill = async (billId) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await investmentAPI.delete(billId);
      await fetchBills();
    } catch (e) {
      alert('Error deleting bill');
    }
  };

  const updatePayment = async (billId, monthKey, field, value) => {
    const bill = bills.find(b => b._id === billId);
    if (!bill) return;

    const updatedPayments = { ...bill.payments };
    if (!updatedPayments[monthKey]) {
      updatedPayments[monthKey] = { amount: '', datePaid: '', done: false };
    }
    updatedPayments[monthKey][field] = value;
    
    // If marking as done, set the amount to bill's default amount
    if (field === 'done' && value === true) {
      updatedPayments[monthKey].amount = bill.amount || 0;
      // Also set today's date
      updatedPayments[monthKey].datePaid = new Date().toISOString().slice(0, 10);
    }

    const updatedBill = { ...bill, payments: updatedPayments };
    
    // Update state immediately for instant UI update
    const updatedBills = bills.map(b => b._id === billId ? updatedBill : b);
    setBills(updatedBills);
    
    // Save to backend without fetching (to prevent state overwrite)
    await saveBill(updatedBill, true);
  };

  const addNewBill = (category) => {
    if (!newBillForm.billName.trim()) return;
    
    const newBill = {
      category,
      ...newBillForm,
      payments: {}
    };
    
    saveBill(newBill);
    setNewBillForm({
      billName: '',
      dueDate: '',
      onlinePaymentUrl: '',
      username: '',
      password: '',
      modeOfPayment: '',
      amount: 0
    });
    setShowAddBill({ show: false, category: null });
  };

  const getBillsByCategory = (categoryName) => {
    return bills.filter(b => b.category === categoryName);
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    if (categories.find(c => c.name === newCategoryName)) {
      alert('Category already exists!');
      return;
    }
    const newCategories = [...categories, { name: newCategoryName, bills: [] }];
    setCategories(newCategories);
    setNewCategoryName('');
    await saveCategoriesDirect(newCategories);
  };

  const saveCategoriesDirect = async (categoriesToSave) => {
    try {
      const payload = {
        category: CATEGORIES_KEY,
        type: 'Categories',
        name: 'Bill Categories',
        amount: 0,
        startDate: new Date().toISOString().slice(0, 10),
        notes: JSON.stringify({ categories: categoriesToSave })
      };
      
      const existing = await investmentAPI.getAll(CATEGORIES_KEY);
      
      if (existing.data.investments && existing.data.investments.length > 0) {
        await investmentAPI.update(existing.data.investments[0]._id, payload);
      } else {
        await investmentAPI.create(payload);
      }
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  };

  const updateCategoryName = async (oldName, newName) => {
    if (!newName.trim() || newName === oldName) return;
    if (categories.find(c => c.name === newName && c.name !== oldName)) {
      alert('Category name already exists!');
      return;
    }
    
    const newCategories = categories.map(cat => 
      cat.name === oldName ? { ...cat, name: newName } : cat
    );
    
    setCategories(newCategories);
    
    // Update all bills in this category
    const categoryBills = getBillsByCategory(oldName);
    for (const bill of categoryBills) {
      await saveBill({ ...bill, category: newName });
    }
    
    setEditingCategory(null);
    await saveCategoriesDirect(newCategories);
  };

  const deleteCategory = async (categoryName) => {
    const categoryBills = getBillsByCategory(categoryName);
    if (categoryBills.length > 0) {
      if (!window.confirm(`This category has ${categoryBills.length} bill(s). Delete anyway?`)) {
        return;
      }
      // Delete all bills in this category
      for (const bill of categoryBills) {
        await deleteBill(bill._id);
      }
    }
    const newCategories = categories.filter(c => c.name !== categoryName);
    setCategories(newCategories);
    await saveCategoriesDirect(newCategories);
  };

  const renderSpreadsheetView = () => {
    return (
      <div className="spreadsheet-container">
        <table className="bill-spreadsheet">
          <thead>
            <tr>
              <th className="category-col">Category</th>
              <th className="bill-col">Bill (Due Date)</th>
              <th className="details-header" colSpan="5">Details</th>
              {months.map((month, idx) => (
                <th key={month} className="month-header" colSpan="3">{month}</th>
              ))}
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th className="detail-col">Online payment Site URL</th>
              <th className="detail-col">Username</th>
              <th className="detail-col">Password</th>
              <th className="detail-col">Mode of Payment</th>
              <th className="detail-col">Amount</th>
              {months.map(month => (
                <React.Fragment key={month}>
                  <th key={`${month}-amt`} className="month-sub">Amount</th>
                  <th key={`${month}-date`} className="month-sub">Date paid</th>
                  <th key={`${month}-done`} className="month-sub">Done</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category, catIdx) => {
              const categoryBills = getBillsByCategory(category.name);
              
              return (
                <React.Fragment key={`category-${catIdx}`}>
                  <tr key={`cat-${catIdx}`} className="category-row">
                    <td className="category-name" rowSpan={categoryBills.length + 2}>
                      <div className="category-name-content">
                        <span>{category.name}</span>
                        <div className="category-actions">
                          <button onClick={() => setEditingCategory(category.name)} className="category-action-btn" title="Edit Category">
                            <FiEdit2 size={12} />
                          </button>
                          <button onClick={() => deleteCategory(category.name)} className="category-action-btn delete" title="Delete Category">
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {categoryBills.map((bill, billIdx) => (
                    <tr key={bill._id} className="bill-row">
                      <td className="bill-name">
                        {editingBill === bill._id ? (
                          <input 
                            type="text" 
                            value={bill.billName}
                            onChange={(e) => {
                              const updated = bills.map(b => 
                                b._id === bill._id ? {...b, billName: e.target.value} : b
                              );
                              setBills(updated);
                            }}
                            className="inline-edit"
                          />
                        ) : (
<span>{bill.billName} {bill.dueDate && `- ${String(bill.dueDate).padStart(2,'0')}`}</span>
                        )}
<div className="bill-meta">
                          {editingBill === bill._id ? (
                            <div className="inline-meta">
                              <select
                                value={bill.category}
                                onChange={(e)=>{
                                  const updated = bills.map(b => b._id===bill._id ? {...b, category: e.target.value} : b);
                                  setBills(updated);
                                }}
                                className="inline-edit"
                              >
                                {categories.map(c => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min={1}
                                max={31}
                                value={bill.dueDate}
                                onChange={(e)=>{
                                  const updated = bills.map(b => b._id===bill._id ? {...b, dueDate: e.target.value} : b);
                                  setBills(updated);
                                }}
                                className="inline-edit"
                                placeholder="Due day (e.g., 07)"
                              />
                            </div>
                          ) : (
                            <div className="inline-meta readonly">{bill.category} {bill.dueDate && `(Due ${String(bill.dueDate).padStart(2,'0')})`}</div>
                          )}
                          <div className="bill-actions">
                          {editingBill === bill._id ? (
                            <>
                              <button onClick={() => { saveBill(bill); setEditingBill(null); }} className="action-btn save">
                                <FiSave />
                              </button>
                              <button onClick={() => setEditingBill(null)} className="action-btn cancel">
                                <FiX />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditingBill(bill._id)} className="action-btn">
                                <FiEdit2 />
                              </button>
                              <button onClick={() => deleteBill(bill._id)} className="action-btn delete">
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </div>
                        </div>
                      </td>
                      <td className="detail-cell">
                        {editingBill === bill._id ? (
                          <input 
                            type="text" 
                            value={bill.onlinePaymentUrl}
                            onChange={(e) => {
                              const updated = bills.map(b => 
                                b._id === bill._id ? {...b, onlinePaymentUrl: e.target.value} : b
                              );
                              setBills(updated);
                            }}
                            className="inline-edit"
                          />
                        ) : (
                          <span>{bill.onlinePaymentUrl}</span>
                        )}
                      </td>
                      <td className="detail-cell">
                        {editingBill === bill._id ? (
                          <input 
                            type="text" 
                            value={bill.username}
                            onChange={(e) => {
                              const updated = bills.map(b => 
                                b._id === bill._id ? {...b, username: e.target.value} : b
                              );
                              setBills(updated);
                            }}
                            className="inline-edit"
                          />
                        ) : (
                          <span>{bill.username}</span>
                        )}
                      </td>
                      <td className="detail-cell password-cell">
                        {editingBill === bill._id ? (
                          <input 
                            type="password" 
                            value={bill.password}
                            onChange={(e) => {
                              const updated = bills.map(b => 
                                b._id === bill._id ? {...b, password: e.target.value} : b
                              );
                              setBills(updated);
                            }}
                            className="inline-edit"
                          />
                        ) : (
                          <span>{'•'.repeat(bill.password?.length || 0)}</span>
                        )}
                      </td>
                      <td className="detail-cell">
                        {editingBill === bill._id ? (
                          <select
                            value={bill.modeOfPayment}
                            onChange={(e) => {
                              const updated = bills.map(b => 
                                b._id === bill._id ? {...b, modeOfPayment: e.target.value} : b
                              );
                              setBills(updated);
                            }}
                            className="inline-edit"
                          >
                            <option value="">Select...</option>
                            <option value="UPI">UPI</option>
                            <option value="NetBanking">NetBanking</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Auto-Debit">Auto-Debit</option>
                          </select>
                        ) : (
                          <span>{bill.modeOfPayment}</span>
                        )}
                      </td>
                      <td className="detail-cell">
                        {editingBill === bill._id ? (
                          <input 
                            type="number" 
                            value={bill.amount}
                            onChange={(e) => {
                              const updated = bills.map(b => 
                                b._id === bill._id ? {...b, amount: Number(e.target.value)} : b
                              );
                              setBills(updated);
                            }}
                            className="inline-edit"
                          />
                        ) : (
                          <span>₹{bill.amount}</span>
                        )}
                      </td>
                      
                      {months.map((month, monthIdx) => {
                        const monthKey = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}`;
                        const payment = bill.payments?.[monthKey] || { amount: '', datePaid: '', done: false };
                        
                        return (
                          <React.Fragment key={`${bill._id}-${monthKey}`}>
                            <td key={`${bill._id}-${monthKey}-amt`} className="month-cell">
                              <input 
                                type="number"
                                value={payment.amount}
                                onChange={(e) => updatePayment(bill._id, monthKey, 'amount', e.target.value)}
                                placeholder=""
                                className="month-input"
                              />
                            </td>
                            <td key={`${bill._id}-${monthKey}-date`} className="month-cell">
                              <input 
                                type="date"
                                value={payment.datePaid}
                                onChange={(e) => updatePayment(bill._id, monthKey, 'datePaid', e.target.value)}
                                className="month-input"
                              />
                            </td>
                            <td key={`${bill._id}-${monthKey}-done`} className="month-cell checkbox-cell">
                              <input 
                                type="checkbox"
                                checked={payment.done}
                                onChange={(e) => updatePayment(bill._id, monthKey, 'done', e.target.checked)}
                                className="month-checkbox"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                  
                  <tr className="add-bill-row">
                    <td colSpan="17">
                      <button 
                        onClick={() => setShowAddBill({ show: true, category: category.name })} 
                        className="btn-add-bill"
                      >
                        <FiPlus /> Add Bill to {category.name}
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <div className="bill-summary-section">
        <div className="summary-header">
          <h2><FiPieChart /> Bill Payment Summary</h2>
          <p>Track your monthly bill payments and financial overview</p>
        </div>
        
        {/* Key Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <FiDollarSign />
            </div>
            <div className="metric-content">
              <h3>₹{summaryData.totalAmount.toLocaleString()}</h3>
              <p>Total Monthly Bills</p>
            </div>
          </div>
          
          <div className="metric-card success">
            <div className="metric-icon">
              <FiCheckCircle />
            </div>
            <div className="metric-content">
              <h3>{summaryData.completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${summaryData.completionRate}%` }}
              />
            </div>
          </div>
          
          <div className="metric-card warning">
            <div className="metric-icon">
              <FiClock />
            </div>
            <div className="metric-content">
              <h3>{summaryData.unpaidThisMonth}</h3>
              <p>Pending Bills</p>
            </div>
          </div>
          
          <div className="metric-card danger">
            <div className="metric-icon">
              <FiActivity />
            </div>
            <div className="metric-content">
              <h3>{summaryData.overdueThisMonth}</h3>
              <p>Overdue Bills</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Payment Status Pie Chart */}
          <div className="chart-card">
            <h3>Payment Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: summaryData.paymentStatus.paid },
                    { name: 'Unpaid', value: summaryData.paymentStatus.unpaid },
                    { name: 'Overdue', value: summaryData.paymentStatus.overdue }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip formatter={(value) => [`${value} bills`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend Bar Chart */}
          <div className="chart-card">
            <h3>6-Month Payment Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summaryData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="paid" stackId="a" fill="#10B981" name="Paid" />
                <Bar dataKey="unpaid" stackId="a" fill="#F59E0B" name="Unpaid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="category-breakdown">
          <h3>Category Performance</h3>
          <div className="category-cards">
            {summaryData.categoryStats.map((category, index) => (
              <div key={category.name} className="category-card">
                <div className="category-header">
                  <h4>{category.name}</h4>
                  <span className="category-count">{category.count} bills</span>
                </div>
                <div className="category-amount">₹{category.amount.toLocaleString()}</div>
                <div className="category-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${category.completion}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <span className="progress-text">{category.completion}% paid</span>
                </div>
                <div className="category-stats">
                  <span className="stat paid">{category.paid} paid</span>
                  <span className="stat unpaid">{category.count - category.paid} pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const calendarEvents = [];
    
    bills.forEach(bill => {
      Object.entries(bill.payments || {}).forEach(([monthKey, payment]) => {
        if (payment.datePaid) {
          calendarEvents.push({
            date: payment.datePaid,
            billName: bill.billName,
            amount: payment.amount || bill.amount,
            done: payment.done,
            category: bill.category
          });
        }
        
        // Also show due dates if set
        if (bill.dueDate) {
          const [, month] = monthKey.split('-');
          const dueDate = `${currentYear}-${month.padStart(2, '0')}-${bill.dueDate}`;
          calendarEvents.push({
            date: dueDate,
            billName: bill.billName,
            amount: bill.amount,
            isDue: true,
            done: payment.done,
            category: bill.category
          });
        }
      });
    });

    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <button onClick={() => setCurrentYear(currentYear - 1)}>← {currentYear - 1}</button>
          <h2>{currentYear} Calendar</h2>
          <button onClick={() => setCurrentYear(currentYear + 1)}>{currentYear + 1} →</button>
        </div>
        
        <div className="calendar-grid">
          {months.map((month, idx) => {
            const monthKey = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
            const daysInMonth = new Date(currentYear, idx + 1, 0).getDate();
            const firstDay = new Date(currentYear, idx, 1).getDay();
            
            const monthEvents = calendarEvents.filter(e => e.date?.startsWith(monthKey));
            
            return (
              <div key={month} className="calendar-month">
                <h3>{month} {currentYear}</h3>
                <div className="calendar-days-header">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-name">{day}</div>
                  ))}
                </div>
                <div className="calendar-days">
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty"></div>
                  ))}
                  {[...Array(daysInMonth)].map((_, dayIdx) => {
                    const day = dayIdx + 1;
                    const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
                    const dayEvents = monthEvents.filter(e => e.date === dateStr);
                    
                    return (
                      <div key={day} className="calendar-day">
                        <div className="day-number">{day}</div>
                        {dayEvents.map((event, eIdx) => (
                          <div 
                            key={eIdx} 
                            className={`calendar-event ${event.done ? 'paid' : event.isDue ? 'due' : 'unpaid'}`}
                            title={`${event.billName} - ₹${event.amount}`}
                          >
                            {event.billName.substring(0, 10)}...
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bill-checklist-new">
      <div className="page-header">
        <h1>Bill Paying Checklist</h1>
        <div className="header-controls">
          <div className="year-selector">
            <button onClick={() => setCurrentYear(currentYear - 1)} className="year-nav-btn">
              ←
            </button>
            <span className="current-year">{currentYear}</span>
            <button onClick={() => setCurrentYear(currentYear + 1)} className="year-nav-btn">
              →
            </button>
          </div>
          <button onClick={() => setShowManageCategories(true)} className="btn-manage-categories">
            <FiEdit2 /> Manage Categories
          </button>
        </div>
      </div>

      {renderSpreadsheetView()}

      {renderSummary()}

      {/* Manage Categories Modal */}
      {showManageCategories && (
        <div className="modal-overlay" onClick={() => setShowManageCategories(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Categories</h2>
              <button onClick={() => setShowManageCategories(false)} className="modal-close">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="categories-list">
                {categories.map((cat, idx) => (
                  <div key={idx} className="category-item">
                    {editingCategory === cat.name ? (
                      <div className="category-edit-row">
                        <input
                          type="text"
                          defaultValue={cat.name}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateCategoryName(cat.name, e.target.value);
                            }
                          }}
                          onBlur={(e) => updateCategoryName(cat.name, e.target.value)}
                          autoFocus
                          className="category-edit-input"
                        />
                        <button onClick={() => setEditingCategory(null)} className="btn-cancel-small">
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="category-item-name">{cat.name}</span>
                        <span className="category-item-count">({getBillsByCategory(cat.name).length} bills)</span>
                        <div className="category-item-actions">
                          <button onClick={() => setEditingCategory(cat.name)} className="btn-icon-small">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => deleteCategory(cat.name)} className="btn-icon-small delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="add-category-section">
                <h3>Add New Category</h3>
                <div className="add-category-row">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="Enter category name..."
                    className="category-input"
                  />
                  <button onClick={addCategory} className="btn-add" disabled={!newCategoryName.trim()}>
                    <FiPlus /> Add
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowManageCategories(false)} className="btn-add">
                <FiCheck /> Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill.show && (
        <div className="modal-overlay" onClick={() => setShowAddBill({ show: false, category: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Bill to {showAddBill.category}</h2>
              <button onClick={() => setShowAddBill({ show: false, category: null })} className="modal-close">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label>Bill Name *</label>
                  <input
                    type="text"
                    value={newBillForm.billName}
                    onChange={(e) => setNewBillForm({ ...newBillForm, billName: e.target.value })}
                    placeholder="e.g., Electricity, Water, etc."
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Due Date (Day of Month)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newBillForm.dueDate}
                    onChange={(e) => setNewBillForm({ ...newBillForm, dueDate: e.target.value })}
                    placeholder="e.g., 07, 15, 28"
                  />
                </div>
                <div className="form-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={newBillForm.amount}
                    onChange={(e) => setNewBillForm({ ...newBillForm, amount: Number(e.target.value) })}
                    placeholder="Default amount"
                  />
                </div>
                <div className="form-field">
                  <label>Mode of Payment</label>
                  <select
                    value={newBillForm.modeOfPayment}
                    onChange={(e) => setNewBillForm({ ...newBillForm, modeOfPayment: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="UPI">UPI</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Auto-Debit">Auto-Debit</option>
                  </select>
                </div>
                <div className="form-field full-width">
                  <label>Online Payment URL</label>
                  <input
                    type="url"
                    value={newBillForm.onlinePaymentUrl}
                    onChange={(e) => setNewBillForm({ ...newBillForm, onlinePaymentUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={newBillForm.username}
                    onChange={(e) => setNewBillForm({ ...newBillForm, username: e.target.value })}
                    placeholder="Login username"
                  />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newBillForm.password}
                    onChange={(e) => setNewBillForm({ ...newBillForm, password: e.target.value })}
                    placeholder="Login password"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddBill({ show: false, category: null })} className="btn-cancel">
                <FiX /> Cancel
              </button>
              <button onClick={() => addNewBill(showAddBill.category)} className="btn-add" disabled={!newBillForm.billName.trim()}>
                <FiCheck /> Add Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillChecklistNew;
