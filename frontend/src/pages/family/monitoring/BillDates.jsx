import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar, FiClock, FiDollarSign, FiPlus } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const BillDates = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyProvisions, setMonthlyProvisions] = useState([]);
  const [cycleMix, setCycleMix] = useState([]);
  const [yearlySchedule, setYearlySchedule] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const [lastBillData, setLastBillData] = useState({});
  const [editingBill, setEditingBill] = useState(null);
  const [showBillOptions, setShowBillOptions] = useState(null);
  const [referenceBills, setReferenceBills] = useState([]);
  const [showReferencePanel, setShowReferencePanel] = useState(true);

  // Helper function to convert day input to full date based on cycle
  const convertDayToDate = (day, cycle, baseDate = new Date()) => {
    const dayNum = parseInt(day);
    if (!dayNum || dayNum < 1 || dayNum > 31) return '';

    const date = new Date(baseDate);

    if (cycle === 'monthly') {
      // For monthly, use current month and year
      date.setDate(dayNum);
    } else if (cycle === 'quarterly') {
      // For quarterly, use current quarter
      const month = Math.floor(date.getMonth() / 3) * 3;
      date.setMonth(month);
      date.setDate(dayNum);
    } else if (cycle === 'yearly') {
      // For yearly, use current year
      date.setDate(dayNum);
    } else {
      // For one-time, use current date
      date.setDate(dayNum);
    }

    return date.toISOString().slice(0, 10);
  };

  // Helper function to extract day from full date
  const extractDayFromDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  // Handle day input changes
  const handleDayChange = (field, value) => {
    const dayValue = value.replace(/\D/g, '').slice(0, 2); // Only allow numbers, max 2 digits
    const cycle = inputs.cycle || 'monthly';

    if (field === 'dueDate') {
      setInputs({ ...inputs, dueDate: convertDayToDate(dayValue, cycle) });
    } else if (field === 'payableDate') {
      setInputs({ ...inputs, payableDate: convertDayToDate(dayValue, cycle) });
    }
  };

  const [inputs, setInputs] = useState({
    billType: 'Electricity',
    billName: '',
    provider: '',
    accountNumber: '',
    cycle: 'monthly',
    billingCycle: '',
    billGenerationDate: '',
    amount: 1000,
    dueDate: '',
    payableDate: '',
    autoDebit: false,
    paymentMethod: 'UPI',
    status: 'pending',
    reminderDays: 3,
    notes: '',
    startDate: new Date().toISOString().slice(0, 10),
    // Electricity specific fields
    billingUnit: '',
    nameOnBill: '',
    paidAmount: '',
    description: '',
    // Water specific fields
    meterNumber: '',
    connectionType: 'Domestic',
    // Gas specific fields
    consumerNumber: '',
    gasAgency: '',
    // Internet specific fields
    planType: 'Broadband',
    dataLimit: '',
    // Mobile specific fields
    simNumber: '',
    networkProvider: '',
    // Credit Card specific fields
    cardNumber: '',
    bankName: '',
    // Rent specific fields
    propertyAddress: '',
    ownerName: '',
    // Insurance specific fields
    policyNumber: '',
    insuranceCompany: '',
    // School Fees specific fields
    studentName: '',
    schoolName: '',
    grade: '',
    // Maintenance specific fields
    societyName: '',
    wing: '',
    flatNumber: '',
    // Additional fields for all bill types
    additional1: '',
    additional2: '',
  });

  const CATEGORY_KEY = 'daily-bill-checklist';

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return {
      _id: inv._id,
      billType: notes.billType || 'Bill',
      billName: notes.billName || inv.provider || notes.provider || notes.billType || '',
      provider: inv.provider || notes.provider || '',
      accountNumber: inv.accountNumber || notes.accountNumber || '',
      cycle: inv.frequency || notes.cycle || 'monthly',
      amount: inv.amount || notes.amount || 0,
      dueDate: inv.maturityDate?.slice(0, 10) || notes.dueDate || '',
      payableDate: inv.payableDate?.slice(0, 10) || notes.payableDate || '',
      billingCycle: notes.billingCycle || '',
      billGenerationDate: notes.billGenerationDate || '',
      autoDebit: notes.autoDebit || false,
      status: notes.status || 'pending',
      startDate: inv.startDate?.slice(0, 10) || notes.startDate || '',
    };
  };

  const fetchEntries = async (year = selectedYear) => {
    try {
      setLoading(true);
      // Prefer backend analytics for performance with selected year
      const analytics = await investmentAPI.getBillDatesAnalytics({ year });
      const a = analytics.data || {};
      if (a.monthlyProvisions && a.cycleMix && a.yearlySchedule && a.upcoming) {
        setMonthlyProvisions(a.monthlyProvisions);
        setCycleMix(a.cycleMix);
        setYearlySchedule(a.yearlySchedule);
        setUpcoming(a.upcoming);
        setAnnualTotal((a.summary && a.summary.annualTotal) || 0);
        setEntries([]);
        return;
      }
      // Fallback to client-side aggregation if analytics not available
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);
      setEntries(list);
    } catch (e) {
      console.error('Error fetching bill dates:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceBills = async () => {
    try {
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const bills = (res.data.investments || []).map(inv => {
        let notes = {};
        try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { }
        return {
          ...fromInvestment(inv),
          source: notes.syncedFrom || 'Manual',
          lastSynced: notes.lastSynced || null,
          status: notes.status || 'pending'
        };
      })
        // Filter out paid bills for current month
        .filter(bill => {
          // Show bill if not paid, or if paid but for a different month
          if (bill.status !== 'paid') return true;

          // If paid, check if it's for current month
          const billDate = new Date(bill.dueDate);
          const now = new Date();
          const isSameMonth = billDate.getMonth() === now.getMonth() &&
            billDate.getFullYear() === now.getFullYear();

          // Hide if paid in current month, show if paid in different month
          return !isSameMonth;
        });

      setReferenceBills(bills);
    } catch (e) {
      console.error('Error fetching reference bills:', e);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/monitoring/bill-dates', 'view');
    fetchEntries();
    fetchReferenceBills();
  }, [selectedYear]); // Re-fetch when year changes

  const handleBillClick = (bill) => {
    setShowBillOptions(bill);
  };

  const handleEditBill = async (bill) => {
    console.log('Edit bill received:', bill);
    console.log('Entries available:', entries.length);
    console.log('Reference bills available:', referenceBills.length);

    // Find the original bill with _id from entries or referenceBills
    let originalBill = null;
    const allBills = [...entries, ...referenceBills];
    console.log('All bills for matching:', allBills.map(b => ({ _id: b._id, billName: b.billName, dueDate: b.dueDate })));

    for (const b of allBills) {
      console.log('Checking bill:', b.billName, 'against:', bill.billName || bill.provider);
      if ((b.billName === (bill.billName || bill.provider) && b.dueDate === bill.dueDate) ||
        (b._id && b._id === bill._id) ||
        (b.billName === (bill.billName || bill.provider) && b.billType === bill.billType && Math.abs(Number(b.amount) - Number(bill.amount)) < 1)) {
        originalBill = b;
        console.log('Found original bill:', originalBill);
        break;
      }
    }

    console.log('Original bill found locally:', originalBill);

    // If not found in local arrays, fetch from API
    if (!originalBill) {
      try {
        const res = await investmentAPI.getAll(CATEGORY_KEY);
        const fetchedBills = (res.data.investments || []).map(inv => {
          let notes = {};
          try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
          return {
            _id: inv._id,
            ...fromInvestment(inv),
            source: notes.syncedFrom || 'Manual',
            lastSynced: notes.lastSynced || null
          };
        });

        for (const b of fetchedBills) {
          console.log('Checking against fetched bill:', b);
          // More flexible matching - try multiple combinations
          if (
            // Match by billName and dueDate (primary method)
            (b.billName && (bill.billName || bill.provider) && b.billName === (bill.billName || bill.provider) && b.dueDate === bill.dueDate) ||
            // Match by billName, billType, and amount (fallback)
            (b.billName && (bill.billName || bill.provider) && b.billName === (bill.billName || bill.provider) &&
              b.billType === bill.billType &&
              Math.abs(Number(b.amount) - Number(bill.amount)) < 1) ||
            // Match by billName and day (from dueDate)
            (b.billName && (bill.billName || bill.provider) && b.billName === (bill.billName || bill.provider) &&
              b.dueDate && new Date(b.dueDate).getDate() === bill.day) ||
            // Match by billType, cycle, and amount (last resort)
            (b.billType === bill.billType &&
              b.cycle === bill.cycle &&
              Math.abs(Number(b.amount) - Number(bill.amount)) < 1) ||
            // Match by day and amount only (final fallback)
            (b.dueDate && new Date(b.dueDate).getDate() === bill.day &&
              Math.abs(Number(b.amount) - Number(bill.amount)) < 1)
          ) {
            originalBill = b;
            console.log('Found match with fetched bill:', b);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching bills for edit:', error);
      }
    }

    // Debug: log what we found
    console.log('Calendar bill:', bill);
    console.log('Original bill found:', originalBill);

    // If originalBill is found, use it for editing
    // If not found, use the calendar bill but mark it as a new bill (no _id)
    const billToEdit = originalBill || { ...bill, _id: null };
    console.log('Bill to edit:', billToEdit);
    console.log('Setting inputs with billName:', billToEdit.billName);
    setInputs({
      billType: billToEdit.billType || '',
      billName: billToEdit.billName || '',
      provider: billToEdit.provider || '',
      accountNumber: billToEdit.accountNumber || '',
      cycle: billToEdit.cycle || '',
      amount: billToEdit.amount || 0,
      dueDate: billToEdit.dueDate || '',
      payableDate: billToEdit.payableDate || '',
      autoDebit: billToEdit.autoDebit || false,
      paymentMethod: billToEdit.paymentMethod || 'UPI',
      status: billToEdit.status || 'pending',
      reminderDays: billToEdit.reminderDays || 3,
      notes: billToEdit.notes || '',
      startDate: billToEdit.startDate || '',
      // Electricity specific fields
      billingUnit: billToEdit.billingUnit || '',
      nameOnBill: billToEdit.nameOnBill || '',
      paidAmount: billToEdit.paidAmount || '',
      description: billToEdit.description || '',
      // Water specific fields
      meterNumber: billToEdit.meterNumber || '',
      connectionType: billToEdit.connectionType || 'Domestic',
      // Gas specific fields
      consumerNumber: billToEdit.consumerNumber || '',
      gasAgency: billToEdit.gasAgency || ''
    });
    setEditingBill(billToEdit);
    setShowForm(true);
    setShowBillOptions(null);
  };

  const handleDeleteBill = async (bill) => {
    if (window.confirm(`Are you sure you want to delete the ${bill.billName || bill.provider} bill?`)) {
      try {
        // Since entries and referenceBills are empty, we need to find the bill by matching properties
        // First, try to fetch all bills to find a match
        const res = await investmentAPI.getAll(CATEGORY_KEY);
        const allBills = (res.data.investments || []).map(inv => {
          let notes = {};
          try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
          return {
            _id: inv._id,
            ...fromInvestment(inv),
            source: notes.syncedFrom || 'Manual',
            lastSynced: notes.lastSynced || null
          };
        });

        // Find matching bill by comparing properties
        let originalBill = null;
        for (const b of allBills) {
          if ((b.billName === (bill.billName || bill.provider) && b.dueDate === bill.dueDate) ||
            (b._id && b._id === bill._id) ||
            (b.billName === (bill.billName || bill.provider) && b.billType === bill.billType && Math.abs(Number(b.amount) - Number(bill.amount)) < 1)) {
            originalBill = b;
            break;
          }
        }

        const billId = originalBill?._id;
        if (!billId) {
          alert('Cannot delete bill: No valid ID found');
          return;
        }
        await investmentAPI.delete(billId);
        await fetchEntries();
        await fetchReferenceBills();
        setShowBillOptions(null);
      } catch (error) {
        alert('Error deleting bill. Please try again.');
      }
    }
  };

  const now = new Date();

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: 'Bill',
    name: `${data.billType} - ${data.billName || data.provider || data.accountNumber || ''}`.trim(),
    provider: data.provider || data.billType,
    accountNumber: data.accountNumber || '',
    amount: Number(data.amount) || 0,
    startDate: data.startDate || new Date().toISOString().slice(0, 10),
    maturityDate: data.dueDate || undefined,
    payableDate: data.payableDate || undefined,
    frequency: data.cycle || 'monthly',
    notes: JSON.stringify({ ...data }),
  });

  const monthlyProvisionsLocal = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      idx: i,
      key: `${selectedYear}-${i + 1}`,
      name: new Date(selectedYear, i, 1).toLocaleString('en-US', { month: 'short' }),
      total: 0,
    }));

    const addToMonth = (monthIdx, amt) => {
      if (monthIdx >= 0 && monthIdx < 12) months[monthIdx].total += amt;
    };

    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (!amt) continue;
      const due = e.dueDate ? new Date(e.dueDate) : null;
      const start = e.startDate ? new Date(e.startDate) : null;
      const startMonth = start && start.getFullYear() === selectedYear ? start.getMonth() : 0;
      const baseMonth = due && due.getFullYear() === selectedYear ? due.getMonth() : startMonth;
      if (e.cycle === 'monthly') {
        for (let m = Math.max(0, startMonth); m < 12; m++) addToMonth(m, amt);
      } else if (e.cycle === 'quarterly') {
        const first = Math.max(0, baseMonth);
        for (let m = first; m < 12; m += 3) addToMonth(m, amt);
      } else if (e.cycle === 'yearly' || e.cycle === 'one-time') {
        addToMonth(Math.max(0, baseMonth), amt);
      } else {
        addToMonth(Math.max(0, baseMonth), amt);
      }
    }

    return months.map(m => ({ name: m.name, total: m.total }));
  }, [entries, selectedYear]);

  const annualTotalLocal = useMemo(() => monthlyProvisionsLocal.reduce((s, m) => s + m.total, 0), [monthlyProvisionsLocal]);

  const cycleMixLocal = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.cycle || 'monthly';
      const prev = map.get(key) || { name: key, value: 0 };
      prev.value += 1;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const yearlyScheduleLocal = useMemo(() => {
    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      monthIdx: i,
      name: new Date(selectedYear, i, 1).toLocaleString('en-US', { month: 'long' }),
      items: [],
      total: 0,
    }));
    // Combine entries with referenceBills to get _id
    const allBills = [...entries, ...referenceBills];
    const uniqueBills = allBills.reduce((acc, bill) => {
      const key = bill._id || `${bill.provider}-${bill.billName}-${bill.dueDate}`;
      if (!acc[key]) {
        acc[key] = bill;
      }
      return acc;
    }, {});

    for (const e of Object.values(uniqueBills)) {
      // Use payableDate if available, otherwise fall back to dueDate
      const dateToUse = e.payableDate || e.dueDate;
      if (!dateToUse) continue;
      const d = new Date(dateToUse);
      if (d.getFullYear() !== selectedYear) continue;
      const bucket = byMonth[d.getMonth()];
      bucket.items.push({
        _id: e._id,
        id: e._id, // Add id as backup
        day: d.getDate(),
        provider: e.provider,
        billName: e.billName || e.provider || e.billType,
        billType: e.billType,
        cycle: e.cycle,
        amount: Number(e.amount) || 0,
        accountNumber: e.accountNumber,
        dueDate: e.dueDate,
        payableDate: e.payableDate,
        autoDebit: e.autoDebit,
        status: e.status,
        startDate: e.startDate,
        paymentMethod: e.paymentMethod,
        reminderDays: e.reminderDays,
        notes: e.notes,
      });
      bucket.total += Number(e.amount) || 0;
    }
    for (const m of byMonth) {
      m.items.sort((a, b) => a.day - b.day);
    }
    return byMonth;
  }, [entries, referenceBills, selectedYear]);

  const upcomingLocal = useMemo(() => {
    const horizon = 60; // days
    const end = new Date(now);
    end.setDate(end.getDate() + horizon);
    const list = [];
    for (const e of entries) {
      if (!e.dueDate) continue;
      const d = new Date(e.dueDate);
      if (d >= now && d <= end) {
        list.push({
          date: d.toISOString().slice(0, 10),
          provider: e.billName || e.provider || e.billType,
          billType: e.billType,
          amount: Number(e.amount) || 0,
          cycle: e.cycle,
        });
      }
    }
    list.sort((a, b) => (a.date > b.date ? 1 : -1));
    return list;
  }, [entries]);

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#8B5CF6'];

  if (loading && entries.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Bill Dates: Monthly Provisions & Yearly Schedule</h1>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#0A0A0A',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiPlus style={{ color: 'white' }} /> {showForm ? 'Cancel' : 'Add Bill'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Annual Provisions</p>
            <h3 className="stat-value">₹{Math.round((annualTotal || annualTotalLocal)).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <p className="stat-label">Upcoming (60 days)</p>
            <h3 className="stat-value">₹{Math.round((upcoming.length ? upcoming.reduce((s, i) => s + i.amount, 0) : upcomingLocal.reduce((s, i) => s + i.amount, 0))).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #252525 100%)' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <p className="stat-label">Scheduled This Year</p>
            <h3 className="stat-value">{(yearlySchedule.length ? yearlySchedule : yearlyScheduleLocal).reduce((s, m) => s + m.items.length, 0)}</h3>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="investment-form-card">
          <h2>{editingBill ? 'Edit Bill' : 'Add Bill'}</h2>
          <form className="investment-form" onSubmit={async (e) => {
            e.preventDefault();
            try {
              setSaving(true);
              // If editing (editingBill has _id), update; otherwise create
              console.log('editingBill:', editingBill);
              console.log('editingBill._id:', editingBill?._id);
              if (editingBill && editingBill._id) {
                console.log('Updating existing bill with ID:', editingBill._id);
                await investmentAPI.update(editingBill._id, toPayload(inputs));
              } else {
                console.log('Creating new bill');
                await investmentAPI.create(toPayload(inputs));
              }
              // Save current bill data for this bill type
              setLastBillData(prev => ({
                ...prev,
                [inputs.billType]: { ...inputs }
              }));
              await fetchEntries();
              await fetchReferenceBills();
              setInputs({ billType: 'Electricity', billName: '', provider: '', accountNumber: '', cycle: 'monthly', billingCycle: '', billGenerationDate: '', amount: 1000, dueDate: '', autoDebit: false, paymentMethod: 'UPI', status: 'pending', reminderDays: 3, notes: '', startDate: new Date().toISOString().slice(0, 10), additional1: '', additional2: '' });
              setEditingBill(null);
              setShowForm(false);
            } catch (error) {
              alert(error.response?.data?.message || 'Error saving bill');
            } finally {
              setSaving(false);
            }
          }}>
            <div className="form-row">
              <div className="form-field">
                <label>Bill Type *</label>
                <select value={inputs.billType} onChange={(e) => {
                  const newBillType = e.target.value;
                  // Load last saved data for this bill type if available
                  const savedData = lastBillData[newBillType];
                  if (savedData) {
                    setInputs({
                      ...savedData,
                      billType: newBillType,
                      dueDate: '', // Clear due date for new bill
                      paidAmount: '' // Clear paid amount for new bill
                    });
                  } else {
                    // Reset to defaults for new bill type
                    setInputs({
                      billType: newBillType,
                      billName: '',
                      provider: '',
                      accountNumber: '',
                      cycle: 'monthly',
                      amount: 1000,
                      dueDate: '',
                      autoDebit: false,
                      paymentMethod: 'UPI',
                      status: 'pending',
                      reminderDays: 3,
                      notes: '',
                      startDate: new Date().toISOString().slice(0, 10),
                      billingUnit: '',
                      nameOnBill: '',
                      paidAmount: '',
                      description: '',
                      meterNumber: '',
                      connectionType: 'Domestic',
                      consumerNumber: '',
                      gasAgency: '',
                      planType: 'Broadband',
                      dataLimit: '',
                      simNumber: '',
                      networkProvider: '',
                      cardNumber: '',
                      bankName: '',
                      propertyAddress: '',
                      ownerName: '',
                      policyNumber: '',
                      insuranceCompany: '',
                      studentName: '',
                      schoolName: '',
                      grade: '',
                      societyName: '',
                      wing: '',
                      flatNumber: '',
                      additional1: '',
                      additional2: ''
                    });
                  }
                }} required>
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Gas</option>
                  <option>Internet</option>
                  <option>Mobile</option>
                  <option>Credit Card</option>
                  <option>Rent</option>
                  <option>Insurance</option>
                  <option>School Fees</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Bill Name *</label>
                <input type="text" value={inputs.billName} onChange={(e) => setInputs({ ...inputs, billName: e.target.value })} placeholder="Enter bill name" required />
              </div>
              <div className="form-field">
                <label>Account Number</label>
                <input type="text" value={inputs.accountNumber} onChange={(e) => setInputs({ ...inputs, accountNumber: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Cycle *</label>
                <select value={inputs.cycle} onChange={(e) => {
                  const newCycle = e.target.value;
                  const currentDueDay = extractDayFromDate(inputs.dueDate);
                  const currentPayableDay = extractDayFromDate(inputs.payableDate);

                  setInputs({
                    ...inputs,
                    cycle: newCycle,
                    dueDate: currentDueDay ? convertDayToDate(currentDueDay, newCycle) : '',
                    payableDate: currentPayableDay ? convertDayToDate(currentPayableDay, newCycle) : ''
                  });
                }} required>
                  <option>monthly</option>
                  <option>quarterly</option>
                  <option>yearly</option>
                  <option>one-time</option>
                </select>
              </div>
              <div className="form-field">
                <label>Billing Cycle</label>
                <input
                  type="text"
                  value={inputs.billingCycle}
                  onChange={(e) => setInputs({ ...inputs, billingCycle: e.target.value })}
                  placeholder="e.g., 15-20"
                  style={{ textTransform: 'lowercase' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Enter billing cycle range (e.g., 15-20 for 15th to 20th of each month)
                </small>
              </div>
              <div className="form-field">
                <label>Bill Generation Date</label>
                <input
                  type="text"
                  value={inputs.billGenerationDate}
                  onChange={(e) => setInputs({ ...inputs, billGenerationDate: e.target.value })}
                  placeholder="e.g., 1"
                  maxLength={2}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Enter day of month when bill is generated (e.g., 1 for 1st of each month)
                </small>
              </div>
              <div className="form-field">
                <label>Amount (₹) *</label>
                <input type="number" value={inputs.amount} onChange={(e) => setInputs({ ...inputs, amount: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Due Date *</label>
                <input
                  type="text"
                  value={extractDayFromDate(inputs.dueDate)}
                  onChange={(e) => handleDayChange('dueDate', e.target.value)}
                  placeholder="Day (1-31)"
                  maxLength={2}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Enter day only (e.g., 15). {inputs.cycle === 'monthly' ? 'Monthly cycle applies' : inputs.cycle === 'yearly' ? 'Yearly cycle applies' : inputs.cycle === 'quarterly' ? 'Quarterly cycle applies' : 'One-time'}
                </small>
              </div>
              <div className="form-field">
                <label>Payable Date</label>
                <input
                  type="text"
                  value={extractDayFromDate(inputs.payableDate)}
                  onChange={(e) => handleDayChange('payableDate', e.target.value)}
                  placeholder="Day (1-31)"
                  maxLength={2}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Enter day only (e.g., 10). {inputs.cycle === 'monthly' ? 'Monthly cycle applies' : inputs.cycle === 'yearly' ? 'Yearly cycle applies' : inputs.cycle === 'quarterly' ? 'Quarterly cycle applies' : 'One-time'}
                </small>
              </div>
            </div>

            {/* Bill Type Specific Fields */}
            {inputs.billType === 'Electricity' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Billing Unit</label>
                  <input type="text" value={inputs.billingUnit} onChange={(e) => setInputs({ ...inputs, billingUnit: e.target.value })} placeholder="e.g., kWh" />
                </div>
                <div className="form-field">
                  <label>Name on the Bill</label>
                  <input type="text" value={inputs.nameOnBill} onChange={(e) => setInputs({ ...inputs, nameOnBill: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Paid Amount</label>
                  <input type="number" value={inputs.paidAmount} onChange={(e) => setInputs({ ...inputs, paidAmount: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Electricity' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Description</label>
                  <input type="text" value={inputs.description} onChange={(e) => setInputs({ ...inputs, description: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Water' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Meter Number</label>
                  <input type="text" value={inputs.meterNumber} onChange={(e) => setInputs({ ...inputs, meterNumber: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Connection Type</label>
                  <select value={inputs.connectionType} onChange={(e) => setInputs({ ...inputs, connectionType: e.target.value })}>
                    <option>Domestic</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                  </select>
                </div>
              </div>
            )}

            {inputs.billType === 'Gas' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Consumer Number</label>
                  <input type="text" value={inputs.consumerNumber} onChange={(e) => setInputs({ ...inputs, consumerNumber: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Gas Agency</label>
                  <input type="text" value={inputs.gasAgency} onChange={(e) => setInputs({ ...inputs, gasAgency: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Internet' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Plan Type</label>
                  <select value={inputs.planType} onChange={(e) => setInputs({ ...inputs, planType: e.target.value })}>
                    <option>Broadband</option>
                    <option>Fiber</option>
                    <option>DSL</option>
                    <option>Mobile Data</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Data Limit</label>
                  <input type="text" value={inputs.dataLimit} onChange={(e) => setInputs({ ...inputs, dataLimit: e.target.value })} placeholder="e.g., 500GB" />
                </div>
              </div>
            )}

            {inputs.billType === 'Mobile' && (
              <div className="form-row">
                <div className="form-field">
                  <label>SIM Number</label>
                  <input type="text" value={inputs.simNumber} onChange={(e) => setInputs({ ...inputs, simNumber: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Network Provider</label>
                  <input type="text" value={inputs.networkProvider} onChange={(e) => setInputs({ ...inputs, networkProvider: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Credit Card' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Card Number</label>
                  <input type="text" value={inputs.cardNumber} onChange={(e) => setInputs({ ...inputs, cardNumber: e.target.value })} placeholder="Last 4 digits" />
                </div>
                <div className="form-field">
                  <label>Bank Name</label>
                  <input type="text" value={inputs.bankName} onChange={(e) => setInputs({ ...inputs, bankName: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Rent' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Property Address</label>
                  <input type="text" value={inputs.propertyAddress} onChange={(e) => setInputs({ ...inputs, propertyAddress: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Owner Name</label>
                  <input type="text" value={inputs.ownerName} onChange={(e) => setInputs({ ...inputs, ownerName: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Insurance' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Policy Number</label>
                  <input type="text" value={inputs.policyNumber} onChange={(e) => setInputs({ ...inputs, policyNumber: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Insurance Company</label>
                  <input type="text" value={inputs.insuranceCompany} onChange={(e) => setInputs({ ...inputs, insuranceCompany: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'School Fees' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Student Name</label>
                  <input type="text" value={inputs.studentName} onChange={(e) => setInputs({ ...inputs, studentName: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>School Name</label>
                  <input type="text" value={inputs.schoolName} onChange={(e) => setInputs({ ...inputs, schoolName: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Grade</label>
                  <input type="text" value={inputs.grade} onChange={(e) => setInputs({ ...inputs, grade: e.target.value })} />
                </div>
              </div>
            )}

            {inputs.billType === 'Maintenance' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Society Name</label>
                  <input type="text" value={inputs.societyName} onChange={(e) => setInputs({ ...inputs, societyName: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Wing</label>
                  <input type="text" value={inputs.wing} onChange={(e) => setInputs({ ...inputs, wing: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Flat Number</label>
                  <input type="text" value={inputs.flatNumber} onChange={(e) => setInputs({ ...inputs, flatNumber: e.target.value })} />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-field">
                <label>Additional 1</label>
                <input type="text" value={inputs.additional1} onChange={(e) => setInputs({ ...inputs, additional1: e.target.value })} placeholder="Enter additional info" />
              </div>
              <div className="form-field">
                <label>Additional 2</label>
                <input type="text" value={inputs.additional2} onChange={(e) => setInputs({ ...inputs, additional2: e.target.value })} placeholder="Enter additional info" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editingBill ? 'Update' : 'Save')}
              </button>
              {editingBill && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingBill(null);
                    setInputs({ billType: 'Electricity', billName: '', provider: '', accountNumber: '', cycle: 'monthly', billingCycle: '', billGenerationDate: '', amount: 1000, dueDate: '', autoDebit: false, paymentMethod: 'UPI', status: 'pending', reminderDays: 3, notes: '', startDate: new Date().toISOString().slice(0, 10), additional1: '', additional2: '' });
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="investments-table-card">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Monthly Schedule</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0', border: '2px solid #2563EB' }}>
            {/* Dates 1-10 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
              <div key={`header-${day}`} style={{
                border: '1px solid #2563EB',
                padding: '8px',
                fontWeight: 'bold',
                textAlign: 'center',
                background: '#f8fafc'
              }}>
                {day}
              </div>
            ))}
            {/* Bills for dates 1-10 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => {
              const monthData = (yearlySchedule.length ? yearlySchedule : yearlyScheduleLocal)[selectedMonth];
              const bills = monthData ? monthData.items.filter(it => it.day === day) : [];
              return (
                <div key={`content-${day}`} style={{
                  border: '1px solid #2563EB',
                  padding: '8px',
                  minHeight: '100px',
                  fontSize: '12px',
                  background: day === 27 || day === 28 ? '#dbeafe' : '#fff',
                  position: 'relative'
                }}>
                  {bills.map((bill, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '4px',
                        lineHeight: '1.4',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '4px',
                        border: '1px solid #0ea5e9',
                        position: 'relative'
                      }}
                      onClick={() => handleBillClick({ ...bill, day })}
                    >
                      {bill.billName || bill.provider}
                      {showBillOptions && (showBillOptions.billName || showBillOptions.provider) === (bill.billName || bill.provider) && showBillOptions.day === day && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          zIndex: 1000,
                          minWidth: '120px'
                        }}>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBill(bill);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#ef4444'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBill(bill);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Dates 11-20 */}
            {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(day => (
              <div key={`header-${day}`} style={{
                border: '1px solid #2563EB',
                padding: '8px',
                fontWeight: 'bold',
                textAlign: 'center',
                background: '#f8fafc'
              }}>
                {day}
              </div>
            ))}
            {/* Bills for dates 11-20 */}
            {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(day => {
              const monthData = (yearlySchedule.length ? yearlySchedule : yearlyScheduleLocal)[selectedMonth];
              const bills = monthData ? monthData.items.filter(it => it.day === day) : [];
              return (
                <div key={`content-${day}`} style={{
                  border: '1px solid #2563EB',
                  padding: '8px',
                  minHeight: '100px',
                  fontSize: '12px',
                  background: day === 27 || day === 28 ? '#dbeafe' : '#fff',
                  position: 'relative'
                }}>
                  {bills.map((bill, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '4px',
                        lineHeight: '1.4',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '4px',
                        border: '1px solid #0ea5e9',
                        position: 'relative'
                      }}
                      onClick={() => handleBillClick({ ...bill, day })}
                    >
                      {bill.billName || bill.provider}
                      {showBillOptions && (showBillOptions.billName || showBillOptions.provider) === (bill.billName || bill.provider) && showBillOptions.day === day && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          zIndex: 1000,
                          minWidth: '120px'
                        }}>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBill(bill);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#ef4444'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBill(bill);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Dates 21-30 */}
            {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(day => (
              <div key={`header-${day}`} style={{
                border: '1px solid #2563EB',
                padding: '8px',
                fontWeight: 'bold',
                textAlign: 'center',
                background: '#f8fafc'
              }}>
                {day}
              </div>
            ))}
            {/* Bills for dates 21-30 */}
            {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(day => {
              const monthData = (yearlySchedule.length ? yearlySchedule : yearlyScheduleLocal)[selectedMonth];
              const bills = monthData ? monthData.items.filter(it => it.day === day) : [];
              return (
                <div key={`content-${day}`} style={{
                  border: '1px solid #2563EB',
                  padding: '8px',
                  minHeight: '100px',
                  fontSize: '12px',
                  background: day === 27 || day === 28 ? '#dbeafe' : '#fff',
                  position: 'relative'
                }}>
                  {bills.map((bill, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '4px',
                        lineHeight: '1.4',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '4px',
                        border: '1px solid #0ea5e9',
                        position: 'relative'
                      }}
                      onClick={() => handleBillClick({ ...bill, day })}
                    >
                      {bill.billName || bill.provider}
                      {showBillOptions && (showBillOptions.billName || showBillOptions.provider) === (bill.billName || bill.provider) && showBillOptions.day === day && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          zIndex: 1000,
                          minWidth: '120px'
                        }}>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBill(bill);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#ef4444'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBill(bill);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Provisions & Cycle Mix</h2>
          <p>Month-wise totals and cycle distribution</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Monthly Provisions</h3>
              </div>
              <div className="chart-subtitle">Budgeted amounts per month</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={(monthlyProvisions.length ? monthlyProvisions : monthlyProvisionsLocal)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Total']} />
                  <Legend />
                  <Bar dataKey="total" fill="#2563EB" name="Total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Cycle Mix</h3>
              </div>
              <div className="chart-subtitle">Monthly vs Quarterly vs Yearly</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={(cycleMix.length ? cycleMix : cycleMixLocal)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {(cycleMix.length ? cycleMix : cycleMixLocal).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Reference Panel */}
      {showReferencePanel && referenceBills.length > 0 && (
        <div className="investments-table-card" style={{ marginTop: '20px' }}>
          <div className="table-header">
            <h2>📋 All Bills Reference ({referenceBills.length} total)</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              Bills from all sources - Auto-synced from Mobile/Email, Memberships, Digital Assets, Investments
            </p>
          </div>
          <div className="table-container">
            <table className="investments-table">
              <thead>
                <tr>
                  <th>Bill Type</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Cycle</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referenceBills.map((bill, idx) => (
                  <tr key={idx} style={{
                    background: bill.source !== 'Manual' ? '#f0fdf4' : '#fff'
                  }}>
                    <td><strong>{bill.billType}</strong></td>
                    <td>{bill.provider || bill.billName}</td>
                    <td>₹{Math.round(bill.amount || 0).toLocaleString('en-IN')}</td>
                    <td>{bill.dueDate || '-'}</td>
                    <td>
                      <span style={{
                        background: bill.cycle === 'monthly' ? '#dbeafe' :
                          bill.cycle === 'quarterly' ? '#fef3c7' :
                            bill.cycle === 'yearly' ? '#dcfce7' : '#f3f4f6',
                        color: bill.cycle === 'monthly' ? '#1e40af' :
                          bill.cycle === 'quarterly' ? '#92400e' :
                            bill.cycle === 'yearly' ? '#166534' : '#374151',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {bill.cycle}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: bill.source === 'Manual' ? '#f3f4f6' : '#dcfce7',
                        color: bill.source === 'Manual' ? '#374151' : '#166534',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {bill.source === 'MobileEmailDetails' ? '📱 Mobile/Email' :
                          bill.source === 'MembershipList' ? '🎫 Membership' :
                            bill.source === 'DigitalAssets' ? '🌐 Digital' :
                              bill.source === 'GoldSgbInvestment' ? '🪙 Gold/SGB' :
                                bill.source === 'NpsPpfInvestment' ? '💰 NPS/PPF' :
                                  bill.source === 'MfInsuranceShares' ? '📈 Insurance' :
                                    '✏️ Manual'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: bill.status === 'paid' ? '#d1fae5' :
                          bill.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: bill.status === 'paid' ? '#065f46' :
                          bill.status === 'pending' ? '#92400e' : '#991b1b',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {bill.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDates;
