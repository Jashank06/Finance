import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import CardTemplate from '../../../assets/Card.xlsx';
import BankTemplate from '../../../assets/Bank.xlsx';
import api from '../../../utils/api';
import { staticAPI } from '../../../utils/staticAPI';
import FinancialOverviewChart from '../../../components/FinancialOverviewChart';
import CashMemberManagement from '../../../components/CashMemberManagement';
import TransactionTable from '../../../components/TransactionTable';
import './CashCardsBank.css';
import { syncInventoryFromTransaction } from '../../../utils/inventorySyncUtil';
import { getBroaderCategories, getMainCategories, getSubCategories } from '../../../utils/categoryData';
import PayingForDropdown from '../../../components/PayingForDropdown';
import { syncPaymentToModule } from '../../../utils/payingForSync';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';
import { investmentAPI } from '../../../utils/investmentAPI';

const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(children, document.body);
};

const CashCardsBank = () => {
  const [activeTab, setActiveTab] = useState('cash');
  const [cashRecords, setCashRecords] = useState([]);
  const [cardRecords, setCardRecords] = useState([]);
  const [bankRecords, setBankRecords] = useState([]);
  const [companyRecords, setCompanyRecords] = useState([]); // New state for companies
  const [showCashForm, setShowCashForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [cardTransactions, setCardTransactions] = useState([]);
  const [showCardColumnsModal, setShowCardColumnsModal] = useState(false);
  const [showBankColumnsModal, setShowBankColumnsModal] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [uploadingBank, setUploadingBank] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const cardFileInputRef = useRef(null);
  const bankFileInputRef = useRef(null);
  const [bankTransactionForm, setBankTransactionForm] = useState({
    accountId: '',
    type: 'credit',
    amount: '',
    merchant: '',
    category: 'other',
    broaderCategory: '',
    mainCategory: '',
    subCategory: '',
    customSubCategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'INR',
    transactionType: '',
    expenseType: '',
    payingFor: {
      module: '',
      referenceId: '',
      referenceName: ''
    },
    isMilestone: false,
    // Udhar Lena Dena fields
    createAsUdhar: false,
    udharPersonName: '',
    udharPurpose: '',
    udharReturnDate: '',
    // On Behalf fields
    createAsOnBehalf: false,
    onBehalfPersonName: '',
    onBehalfPurpose: '',
    onBehalfReceivedAmount: '',
    onBehalfReceiptDate: ''
  });
  const [showBankTransactionForm, setShowBankTransactionForm] = useState(false);
  const [editingBankTransaction, setEditingBankTransaction] = useState(null);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState('all');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedCardFilter, setSelectedCardFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);

  // Card list filters
  const [cardNameFilter, setCardNameFilter] = useState('');
  const [cardholderNameFilter, setCardholderNameFilter] = useState('');

  // Bank list filters
  const [accountNameFilter, setAccountNameFilter] = useState('');
  const [accountHolderFilter, setAccountHolderFilter] = useState('');

  // Card transaction filters
  const [cardTransactionExpenseTypeFilter, setCardTransactionExpenseTypeFilter] = useState('all');
  const [cardTransactionStartDate, setCardTransactionStartDate] = useState('');
  const [cardTransactionEndDate, setCardTransactionEndDate] = useState('');

  // Bank transaction filters
  const [bankTransactionExpenseTypeFilter, setBankTransactionExpenseTypeFilter] = useState('all');
  const [bankTransactionStartDate, setBankTransactionStartDate] = useState('');
  const [bankTransactionEndDate, setBankTransactionEndDate] = useState('');

  // Form states
  const [cashForm, setCashForm] = useState({
    type: 'cash',
    amount: '',
    currency: 'INR',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    location: '',
    transactionType: '',
    expenseType: '',
    walletProvider: '',
    walletNumber: '',
    walletType: 'prepaid',
    cryptoType: '',
    exchange: '',
    walletAddress: '',
    notes: '',
    payingFor: {
      module: '',
      referenceId: '',
      referenceName: ''
    }
  });

  const [cardForm, setCardForm] = useState({
    type: 'credit-card',
    name: '',
    issuer: '',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    creditLimit: '',
    availableCredit: '',
    interestRate: '',
    minimumPayment: '',
    billingCycle: 'monthly',
    dueDate: '',
    linkedAccount: '',
    bankName: '',
    currency: 'INR',
    isInternational: false,
    contactless: false,
    transactionType: '',
    expenseType: '',
    description: '',
    notes: ''
  });

  const [bankForm, setBankForm] = useState({
    type: 'savings',
    name: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    currency: 'INR',
    balance: '0',
    depositAmount: '',
    interestRate: '',
    tenure: '',
    maturityDate: '',
    autoRenewal: false,
    jointHolders: [],
    ifscCode: '',
    micrCode: '',
    branchName: '',
    branchAddress: '',
    city: '',
    state: '',
    pincode: '',
    netBankingEnabled: false,
    mobileBankingEnabled: false,
    upiEnabled: false,
    upiId: '',
    nomineeName: '',
    nomineeRelationship: '',
    nomineeAge: '',
    nomineeContact: '',
    transactionType: '',
    expenseType: '',
    description: '',
    notes: ''
  });

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    cardId: '',
    type: 'debit',
    amount: '',
    merchant: '',
    category: 'other',
    broaderCategory: '',
    mainCategory: '',
    subCategory: '',
    customSubCategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'INR',
    transactionType: '',
    expenseType: '',
    payingFor: {
      module: '',
      referenceId: '',
      referenceName: ''
    },
    isMilestone: false
  });

  useEffect(() => {
    fetchData();
    // Track page view
    trackFeatureUsage('/family/daily/cash-cards-bank', 'view');
  }, []);

  const fetchData = async () => {
    try {
      const [cashRes, cardRes, bankRes, transactionRes, bankTransactionRes, familyRes, companyRes] = await Promise.all([
        api.get('/cash'),
        api.get('/cards'),
        api.get('/bank'),
        api.get('/transactions'),
        api.get('/bank-transactions'),
        staticAPI.getFamilyProfile(),
        staticAPI.getCompanyRecords()
      ]);

      setCashRecords(cashRes.data);
      setCardRecords(cardRes.data);
      setBankRecords(bankRes.data);
      setCardTransactions(transactionRes.data);
      setBankTransactions(bankTransactionRes.data);
      setCompanyRecords(companyRes.data || []);

      // Extract family members
      if (familyRes.data && familyRes.data.length > 0) {
        setFamilyMembers(familyRes.data[0].members || []);
      }

      // Correctly set company records from the 6th response (index 5 in Promise.all array if we added one, but wait, let's check array index)
      // Original Promise.all had 6 items before my edit? No, it had 6 items: cash, card, bank, trans, bankTrans, family.
      // I added one more. So it should be 7 items.
      // cashRes (0), cardRes (1), bankRes (2), transactionRes (3), bankTransactionRes (4), familyRes (5), companyRes (6)

      // Re-doing the fetch block properly in next chunk to avoid confusion


      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const resetCashForm = () => {
    setCashForm({
      type: 'physical-cash',
      name: '',
      currency: 'INR',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      walletProvider: '',
      walletNumber: '',
      walletType: 'prepaid',
      cryptoType: '',
      exchange: '',
      walletAddress: '',
      transactionType: '',
      expenseType: '',
      description: '',
      notes: ''
    });
  };

  const resetCardForm = () => {
    setCardForm({
      type: 'credit-card',
      name: '',
      issuer: '',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
      creditLimit: '',
      availableCredit: '',
      interestRate: '',
      minimumPayment: '',
      billingCycle: 'monthly',
      dueDate: '',
      linkedAccount: '',
      bankName: '',
      currency: 'INR',
      isInternational: false,
      contactless: false,
      transactionType: '',
      expenseType: '',
      description: '',
      notes: ''
    });
  };

  const resetBankForm = () => {
    setBankForm({
      type: 'savings',
      name: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      currency: 'INR',
      balance: '0',
      depositAmount: '',
      interestRate: '',
      tenure: '',
      maturityDate: '',
      autoRenewal: false,
      jointHolders: [],
      ifscCode: '',
      micrCode: '',
      branchName: '',
      branchAddress: '',
      city: '',
      state: '',
      pincode: '',
      netBankingEnabled: false,
      mobileBankingEnabled: false,
      upiEnabled: false,
      upiId: '',
      nomineeName: '',
      nomineeRelationship: '',
      nomineeAge: '',
      nomineeContact: '',
      transactionType: '',
      expenseType: '',
      description: '',
      notes: ''
    });
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      cardId: '',
      type: 'debit',
      amount: '',
      merchant: '',
      category: 'other',
      broaderCategory: '',
      mainCategory: '',
      subCategory: '',
      customSubCategory: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'INR',
      transactionType: '',
      expenseType: '',
      isMilestone: false
    });
  };

  const resetBankTransactionForm = () => {
    setBankTransactionForm({
      accountId: '',
      type: 'credit',
      amount: '',
      merchant: '',
      category: 'other',
      broaderCategory: '',
      mainCategory: '',
      subCategory: '',
      customSubCategory: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'INR',
      transactionType: '',
      expenseType: '',
      isMilestone: false,
      // Udhar Lena Dena fields
      createAsUdhar: false,
      udharPersonName: '',
      udharPurpose: '',
      udharReturnDate: '',
      // On Behalf fields
      createAsOnBehalf: false,
      onBehalfPersonName: '',
      onBehalfPurpose: '',
      onBehalfReceivedAmount: '',
      onBehalfReceiptDate: ''
    });
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/cash/${editingItem._id}`, cashForm);
        trackAction.update('/family/daily/cash-cards-bank', { type: 'cash' });
      } else {
        await api.post('/cash', cashForm);
        trackAction.create('/family/daily/cash-cards-bank', { type: 'cash' });
      }
      resetCashForm();
      setShowCashForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving cash record:', error);
      alert('Error saving cash record');
    }
  };

  const getErrorMessage = (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      const msg = data.message || '';

      // Display detailed validation errors if available
      if (data.details && Array.isArray(data.details)) {
        const fieldErrors = data.details.map(d => `  • ${d.field}: ${d.message}`).join('\n');
        return `❌ Validation Error:\n${fieldErrors}`;
      }

      // Display error message with additional details
      if (data.error && msg) {
        return `❌ ${msg}\n\nDetails: ${data.error}`;
      }

      // Card validation errors
      if (msg.includes('Card number must be 13-19 digits')) {
        return '❌ Card number must be between 13-19 digits. Please enter a valid card number.';
      }
      if (msg.includes('Expiry date must be in MM/YY format')) {
        return '❌ Expiry date format is incorrect. Please use MM/YY format (e.g., 12/25).';
      }
      if (msg.includes('CVV must be 3 or 4 digits')) {
        return '❌ CVV must be 3 or 4 digits only. Please check your CVV.';
      }

      // Bank validation errors
      if (msg.includes('Invalid IFSC code format')) {
        return '❌ IFSC code format is incorrect. It should be 11 characters (e.g., SBIN0001234).\nFormat: First 4 letters (Bank code) + 0 + Last 6 characters (Branch code)';
      }
      if (msg.includes('Pincode must be 6 digits')) {
        return '❌ Pincode must be exactly 6 digits. Please enter a valid pincode.';
      }
      if (msg.includes('duplicate key') && msg.includes('accountNumber')) {
        return '❌ This account number already exists in the system. Please check and try again.';
      }

      // General validation errors
      if (msg.includes('Required fields are missing')) {
        return '❌ Some required fields are missing. Please fill all mandatory fields.';
      }
      if (msg.includes('ValidationError')) {
        return '❌ Validation failed. Please check all fields and try again.';
      }

      if (msg) {
        return `❌ ${msg}`;
      }
    }

    if (error.response?.status === 400) {
      return '❌ Invalid data provided. Please check all fields and try again.';
    }
    if (error.response?.status === 500) {
      return '❌ Server error occurred. Please try again later.';
    }

    return '❌ An error occurred. Please check your internet connection and try again.';
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Create a copy to avoid mutating state directly and to filter fields
        const updateData = { ...cardForm };

        // Remove masked fields if they haven't been changed
        if (updateData.cardNumber && updateData.cardNumber.includes('*')) {
          delete updateData.cardNumber;
        }
        if (updateData.cvv && updateData.cvv.includes('*')) {
          delete updateData.cvv;
        }

        await api.put(`/cards/${editingItem._id}`, updateData);
        trackAction.update('/family/daily/cash-cards-bank', { type: 'card' });
      } else {
        await api.post('/cards', cardForm);
        trackAction.create('/family/daily/cash-cards-bank', { type: 'card' });
      }
      resetCardForm();
      setShowCardForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving card:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/bank/${editingItem._id}`, bankForm);
      } else {
        await api.post('/bank', bankForm);
      }
      resetBankForm();
      setShowBankForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving bank account:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      // Prepare transaction data for backend (remove frontend-only fields)
      const dataToSend = { ...transactionForm };

      // Save and remove isMilestone from dataToSend
      const { isMilestone } = dataToSend;
      delete dataToSend.isMilestone;

      // Clean up empty string values (Mongoose enum fields don't accept empty strings)
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '') {
          delete dataToSend[key];
        }
      });

      // Clean up payingFor object if all fields are empty
      if (dataToSend.payingFor) {
        const hasValidPayingFor = dataToSend.payingFor.module &&
          dataToSend.payingFor.module !== '';
        if (!hasValidPayingFor) {
          delete dataToSend.payingFor;
        }
      }

      // If inventory category exists, append it to description
      if (dataToSend.inventoryCategory) {
        const categoryInfo = `[Inventory: ${dataToSend.inventoryCategory}]`;
        dataToSend.description = dataToSend.description
          ? `${categoryInfo} ${dataToSend.description}`
          : categoryInfo;
        delete dataToSend.inventoryCategory; // Remove field not in backend model
      }

      if (editingTransaction) {
        // Update existing transaction
        response = await api.put(`/transactions/${editingTransaction._id}`, dataToSend);

        // Update local state
        setCardTransactions(cardTransactions.map(t =>
          t._id === editingTransaction._id ? response.data : t
        ));
      } else {
        // Create new transaction
        response = await api.post('/transactions', dataToSend);

        // Add to local state for immediate display
        const newTransaction = response.data;
        setCardTransactions([...cardTransactions, newTransaction]);

        // Sync to Inventory if category is inventory-related
        await syncInventoryFromTransaction(transactionForm, 'card');

        // Sync to target module if payingFor is specified
        if (transactionForm.payingFor && transactionForm.payingFor.module) {
          await syncPaymentToModule(newTransaction, transactionForm.payingFor, 'card');
        }
      }

      // Save milestone if checked
      if (isMilestone) {
        try {
          await api.post('/budget/milestones', {
            title: `Transaction: ${transactionForm.merchant}`,
            description: transactionForm.description || `Card transaction amount: ${transactionForm.amount}`,
            startDate: transactionForm.date,
            endDate: transactionForm.date,
            status: 'completed',
            priority: 'medium',
            progress: 100
          });
          console.log('Milestone created successfully');
        } catch (msError) {
          console.error('Error saving milestone:', msError);
        }
      }

      resetTransactionForm();
      setShowTransactionForm(false);
      setEditingTransaction(null);

      // Refresh data to update chart
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      console.error('Error details:', error.response?.data);
      alert(getErrorMessage(error));
    }
  };

  const handleBankTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      // Prepare transaction data for backend (remove frontend-only fields)
      const dataToSend = { ...bankTransactionForm };

      // Save and remove isMilestone from dataToSend
      const { isMilestone, createAsUdhar, udharPersonName, udharPurpose, udharReturnDate,
        createAsOnBehalf, onBehalfPersonName, onBehalfPurpose, onBehalfReceivedAmount, onBehalfReceiptDate } = dataToSend;
      delete dataToSend.isMilestone;
      delete dataToSend.createAsUdhar;
      delete dataToSend.udharPersonName;
      delete dataToSend.udharPurpose;
      delete dataToSend.udharReturnDate;
      delete dataToSend.createAsOnBehalf;
      delete dataToSend.onBehalfPersonName;
      delete dataToSend.onBehalfPurpose;
      delete dataToSend.onBehalfReceivedAmount;
      delete dataToSend.onBehalfReceiptDate;

      // Clean up empty string values (Mongoose enum fields don't accept empty strings)
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '') {
          delete dataToSend[key];
        }
      });

      // If type is credit, remove expenseType
      if (dataToSend.type === 'credit') {
        delete dataToSend.expenseType;
      }

      // Clean up payingFor object if all fields are empty
      if (dataToSend.payingFor) {
        const hasValidPayingFor = dataToSend.payingFor.module &&
          dataToSend.payingFor.module !== '';
        if (!hasValidPayingFor) {
          delete dataToSend.payingFor;
        }
      }

      // If inventory category exists, append it to description
      if (dataToSend.inventoryCategory) {
        const categoryInfo = `[Inventory: ${dataToSend.inventoryCategory}]`;
        dataToSend.description = dataToSend.description
          ? `${categoryInfo} ${dataToSend.description}`
          : categoryInfo;
        delete dataToSend.inventoryCategory; // Remove field not in backend model
      }

      if (editingBankTransaction) {
        // Update existing bank transaction
        response = await api.put(`/bank-transactions/${editingBankTransaction._id}`, dataToSend);

        // Update local state
        setBankTransactions(bankTransactions.map(t =>
          t._id === editingBankTransaction._id ? response.data : t
        ));
      } else {
        // Create new bank transaction
        response = await api.post('/bank-transactions', dataToSend);

        // Add to local state for immediate display
        const newTransaction = response.data;
        setBankTransactions([...bankTransactions, newTransaction]);

        // Sync to Inventory if category is inventory-related
        await syncInventoryFromTransaction(bankTransactionForm, 'bank');

        // Sync to target module if payingFor is specified
        if (bankTransactionForm.payingFor && bankTransactionForm.payingFor.module) {
          await syncPaymentToModule(newTransaction, bankTransactionForm.payingFor, 'bank');
        }

        // Create loan record if "Create as Udhar Lena Dena" is checked
        if (createAsUdhar) {
          try {
            // Determine loan type based on transaction type
            // Credit (Deposit) = Borrowed (Udhar Lia)
            // Debit (Withdrawal) = Lent (Udhar Dia)
            const loanType = bankTransactionForm.type === 'credit' ? 'Borrowed' : 'Lent';

            const loanPayload = {
              category: 'loan-ledger',
              type: loanType,
              name: udharPersonName || bankTransactionForm.merchant,
              amount: Number(bankTransactionForm.amount),
              startDate: bankTransactionForm.date,
              maturityDate: udharReturnDate || bankTransactionForm.date,
              frequency: 'one-time',
              source: `Bank: ${bankRecords.find(b => b._id === bankTransactionForm.accountId)?.name || 'Bank Transfer'}`,
              notes: JSON.stringify({
                forPurpose: udharPurpose || bankTransactionForm.description || 'Bank Transaction',
                comments: `Created from bank transaction on ${new Date().toLocaleDateString('en-IN')}`,
                totalPaid: 0,
                balanceAmount: Number(bankTransactionForm.amount),
                payments: [],
                bankTransactionId: newTransaction._id
              })
            };

            await investmentAPI.create(loanPayload);
            console.log('Loan record created successfully');
          } catch (loanError) {
            console.error('Error creating loan record:', loanError);
            alert('Bank transaction created but failed to create loan record: ' + (loanError.response?.data?.message || loanError.message));
          }
        }

        // Create On Behalf record if "Create as On Behalf Payment" is checked
        if (createAsOnBehalf) {
          try {
            const onBehalfPayload = {
              category: 'on-behalf',
              type: 'On Behalf',
              name: onBehalfPersonName || bankTransactionForm.merchant,
              amount: Number(bankTransactionForm.amount),
              startDate: bankTransactionForm.date,
              maturityDate: onBehalfReceiptDate || bankTransactionForm.date,
              frequency: 'one-time',
              source: `Bank: ${bankRecords.find(b => b._id === bankTransactionForm.accountId)?.name || 'Bank Transfer'}`,
              notes: JSON.stringify({
                forPurpose: onBehalfPurpose || bankTransactionForm.description || 'Bank Transaction',
                receivedAmount: Number(onBehalfReceivedAmount || 0),
                totalReceived: Number(onBehalfReceivedAmount || 0),
                dateOfReceipt: onBehalfReceiptDate,
                comments: `Created from bank transaction on ${new Date().toLocaleDateString('en-IN')}`,
                bankTransactionId: newTransaction._id
              })
            };

            await investmentAPI.create(onBehalfPayload);
            console.log('On Behalf record created successfully');
          } catch (onBehalfError) {
            console.error('Error creating on behalf record:', onBehalfError);
            alert('Bank transaction created but failed to create on behalf record: ' + (onBehalfError.response?.data?.message || onBehalfError.message));
          }
        }
      }

      // Save milestone if checked
      if (isMilestone) {
        try {
          await api.post('/budget/milestones', {
            title: `Transaction: ${bankTransactionForm.merchant}`,
            description: bankTransactionForm.description || `Transaction amount: ${bankTransactionForm.amount}`,
            startDate: bankTransactionForm.date,
            endDate: bankTransactionForm.date,
            status: 'completed',
            priority: 'medium',
            progress: 100
          });
          console.log('Milestone created successfully');
        } catch (msError) {
          console.error('Error saving milestone:', msError);
        }
      }

      resetBankTransactionForm();
      setShowBankTransactionForm(false);
      setEditingBankTransaction(null);

      // Refresh data to update chart
      fetchData();

      // Show success message
      if (createAsUdhar && createAsOnBehalf) {
        alert('✅ Bank transaction, Loan record, and On Behalf record saved successfully!');
      } else if (createAsUdhar) {
        alert('✅ Bank transaction and Loan record saved successfully!');
      } else if (createAsOnBehalf) {
        alert('✅ Bank transaction and On Behalf record saved successfully!');
      }
    } catch (error) {
      console.error('Error saving bank transaction:', error);
      console.error('Error details:', error.response?.data);
      alert(getErrorMessage(error));
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'cash') {
      // Handle date field for existing records (use createdAt if date doesn't exist)
      const cashData = {
        ...item,
        date: item.date ? item.date.split('T')[0] : new Date(item.createdAt).toISOString().split('T')[0]
      };
      setCashForm(cashData);
      setShowCashForm(true);
      setActiveTab('cash');
    } else if (type === 'card') {
      console.log('Editing card:', item);
      setCardForm(item);
      setShowCardForm(true);
      setActiveTab('cards');
      console.log('showCardForm set to true, current value:', showCardForm);
    } else if (type === 'bank') {
      setBankForm(item);
      setShowBankForm(true);
      setActiveTab('bank');
    } else if (type === 'transaction') {
      setTransactionForm({
        cardId: item.cardId._id || item.cardId,
        type: item.type,
        amount: item.amount,
        merchant: item.merchant,
        category: item.category,
        broaderCategory: item.broaderCategory || '',
        mainCategory: item.mainCategory || '',
        subCategory: item.subCategory || '',
        customSubCategory: item.customSubCategory || '',
        description: item.description,
        date: new Date(item.date).toISOString().split('T')[0],
        currency: item.currency,
        transactionType: item.transactionType || '',
        expenseType: item.expenseType || ''
      });
      setEditingTransaction(item);
      setShowTransactionForm(true);
      setActiveTab('cards');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/${type}/${id}`);
        trackAction.delete('/family/daily/cash-cards-bank', { type });
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleTransactionEdit = (transaction) => {
    handleEdit(transaction, 'transaction');
  };

  const handleTransactionDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${transactionId}`);

        // Update local state immediately
        setCardTransactions(cardTransactions.filter(t => t._id !== transactionId));

        // Refresh data to update chart
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction');
      }
    }
  };

  const handleBankTransactionEdit = (transaction) => {
    setBankTransactionForm({
      accountId: transaction.accountId._id || transaction.accountId,
      type: transaction.type,
      amount: transaction.amount,
      merchant: transaction.merchant,
      category: transaction.category,
      broaderCategory: transaction.broaderCategory || '',
      mainCategory: transaction.mainCategory || '',
      subCategory: transaction.subCategory || '',
      customSubCategory: transaction.customSubCategory || '',
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
      currency: transaction.currency,
      transactionType: transaction.transactionType || '',
      expenseType: transaction.expenseType || ''
    });
    setEditingBankTransaction(transaction);
    setShowBankTransactionForm(true);
    setActiveTab('bank');
  };

  const handleBankTransactionDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this bank transaction?')) {
      try {
        await api.delete(`/bank-transactions/${transactionId}`);

        // Update local state immediately
        setBankTransactions(bankTransactions.filter(t => t._id !== transactionId));

        // Refresh data to update chart
        fetchData();
      } catch (error) {
        console.error('Error deleting bank transaction:', error);
        alert('Error deleting bank transaction');
      }
    }
  };

  const handleCardExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingCard(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Excel file is empty!');
        setUploadingCard(false);
        return;
      }

      const required = ['Card', 'Transaction Type', 'Amount', 'Broader Category', 'Date'];
      const firstRow = jsonData[0];
      const missing = required.filter(col => !(col in firstRow));

      if (missing.length > 0) {
        alert(`Missing required columns: ${missing.join(', ')}`);
        setUploadingCard(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Helper to match keys case-insensitively and ignore whitespace
      const getValue = (row, key) => {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '').trim();
        const actualKey = Object.keys(row).find(k =>
          k.toLowerCase().replace(/\s+/g, '').trim() === normalizedKey
        );
        return actualKey ? row[actualKey] : undefined;
      };

      // Helper to parse date from DD/MM/YY or Excel serial
      const parseExcelDate = (input) => {
        if (!input) return new Date().toISOString().split('T')[0];

        // Case 1: Excel Serial Date (Number)
        if (typeof input === 'number') {
          const date = new Date(Math.round((input - 25569) * 86400 * 1000));
          return date.toISOString().split('T')[0];
        }

        // Case 2: String DD/MM/YY or DD/MM/YYYY
        if (typeof input === 'string') {
          // check if it matches DD/MM/YY or DD/MM/YYYY
          if (input.includes('/')) {
            const parts = input.trim().split('/');
            if (parts.length === 3) {
              let [d, m, y] = parts;
              // Handle YY -> 20YY
              if (y.length === 2) y = '20' + y;
              return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
          }
        }

        // Fallback
        try {
          const date = new Date(input);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error("Date parse error", input);
        }

        return new Date().toISOString().split('T')[0];
      };

      setUploadProgress(0); // Initialize progress
      const totalRows = jsonData.length;

      for (let i = 0; i < totalRows; i++) {
        const row = jsonData[i];
        try {
          const cardNameStr = String(getValue(row, 'Card') || '').trim();
          const normalizedCardName = cardNameStr.toLowerCase();

          // 1. Direct Match
          let card = cardRecords.find(c =>
            c.name.trim().toLowerCase() === normalizedCardName ||
            c.issuer.trim().toLowerCase() === normalizedCardName ||
            String(c.lastFourDigits) === cardNameStr
          );

          // 2. Parsed Match ('-' separation)
          if (!card && cardNameStr.includes('-')) {
            const tokens = cardNameStr.split('-').map(t => t.trim().toLowerCase());

            // Find all candidates
            const candidates = cardRecords.filter(c =>
              tokens.includes(c.name.trim().toLowerCase()) ||
              tokens.includes(c.issuer.trim().toLowerCase())
            );

            if (candidates.length === 1) {
              card = candidates[0];
            } else if (candidates.length > 1) {
              // Disambiguate using cardholderName
              const preciseMatch = candidates.find(c =>
                c.cardholderName && tokens.includes(c.cardholderName.trim().toLowerCase())
              );
              card = preciseMatch || candidates[0];
            }
          }

          if (!card) {
            console.error(`Card not found: "${cardName}". Available: ${cardRecords.map(c => c.name).join(', ')}`);
            errorCount++;
            continue;
          }

          const transaction = {
            cardId: card._id,
            type: getValue(row, 'Transaction Type')?.toLowerCase() || 'purchase',
            amount: parseFloat(getValue(row, 'Amount')) || 0,
            currency: getValue(row, 'Currency') || 'INR',
            merchant: getValue(row, 'Merchant/Description') || '',
            broaderCategory: getValue(row, 'Broader Category') || '',
            mainCategory: getValue(row, 'Main Category') || '',
            subCategory: getValue(row, 'Sub Category') || '',
            customSubCategory: getValue(row, 'Custom Sub Category') || '',
            description: getValue(row, 'Description') || '',
            date: parseExcelDate(getValue(row, 'Date')),
            transactionType: getValue(row, 'Type of Transaction') || undefined, // ensure undefined
            expenseType: getValue(row, 'Expense Type') || undefined // ensure undefined
          };

          await api.post('/transactions', transaction);
          successCount++;
        } catch (error) {
          console.error('Error importing row:', error);
          errorCount++;
        }

        // Update progress percentage
        setUploadProgress(Math.round(((i + 1) / totalRows) * 100));
      }

      alert(`Card transactions import completed!\nSuccess: ${successCount}\nErrors: ${errorCount}`);
      fetchData();
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format.');
    } finally {
      setUploadingCard(false);
      setUploadProgress(0); // Reset progress after completion or error
      if (cardFileInputRef.current) {
        cardFileInputRef.current.value = '';
      }
    }
  };

  const handleBankExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingBank(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Excel file is empty!');
        setUploadingBank(false);
        return;
      }

      const required = ['Account', 'Transaction Type', 'Amount', 'Broader Category', 'Date'];
      const firstRow = jsonData[0];
      const missing = required.filter(col => !(col in firstRow));

      if (missing.length > 0) {
        alert(`Missing required columns: ${missing.join(', ')}`);
        setUploadingBank(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Reuse getValue helper from Card upload scope if needed, but redefine here for safety/scoping
      const getValue = (row, key) => {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '').trim();
        const actualKey = Object.keys(row).find(k =>
          k.toLowerCase().replace(/\s+/g, '').trim() === normalizedKey
        );
        return actualKey ? row[actualKey] : undefined;
      };

      // Helper to parse date from DD/MM/YY or Excel serial
      const parseExcelDate = (input) => {
        if (!input) return new Date().toISOString().split('T')[0];

        // Case 1: Excel Serial Date (Number)
        if (typeof input === 'number') {
          const date = new Date(Math.round((input - 25569) * 86400 * 1000));
          return date.toISOString().split('T')[0];
        }

        // Case 2: String DD/MM/YY or DD/MM/YYYY
        if (typeof input === 'string') {
          // check if it matches DD/MM/YY or DD/MM/YYYY
          if (input.includes('/')) {
            const parts = input.trim().split('/');
            if (parts.length === 3) {
              let [d, m, y] = parts;
              // Handle YY -> 20YY
              if (y.length === 2) y = '20' + y;
              return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
          }
        }

        // Fallback
        try {
          const date = new Date(input);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error("Date parse error", input);
        }

        return new Date().toISOString().split('T')[0];
      };

      setUploadProgress(0); // Initialize progress
      const totalRows = jsonData.length;

      for (let i = 0; i < totalRows; i++) {
        const row = jsonData[i];
        try {
          const accountName = getValue(row, 'Account');
          // Match by Name OR Account Number (converted to string for safety)
          const account = bankRecords.find(b =>
            b.name === accountName ||
            (b.accountNumber && String(b.accountNumber) === String(accountName))
          );

          if (!account) {
            console.error(`Account not found: ${accountName}`);
            errorCount++;
            continue;
          }

          const transaction = {
            accountId: account._id,
            type: getValue(row, 'Transaction Type')?.toLowerCase() || 'withdrawal',
            amount: parseFloat(getValue(row, 'Amount')) || 0,
            currency: getValue(row, 'Currency') || 'INR',
            merchant: getValue(row, 'Merchant/Description') || '',
            broaderCategory: getValue(row, 'Broader Category') || '',
            mainCategory: getValue(row, 'Main Category') || '',
            subCategory: getValue(row, 'Sub Category') || '',
            customSubCategory: getValue(row, 'Custom Sub Category') || '',
            description: getValue(row, 'Description') || '',
            date: parseExcelDate(getValue(row, 'Date')),
            transactionType: getValue(row, 'Type of Transaction') || undefined, // ensure undefined
            expenseType: getValue(row, 'Expense Type') || undefined // ensure undefined
          };

          await api.post('/bank-transactions', transaction);
          successCount++;
        } catch (error) {
          console.error('Error importing row:', error);
          errorCount++;
        }

        // Update progress percentage
        setUploadProgress(Math.round(((i + 1) / totalRows) * 100));
      }

      alert(`Bank transactions import completed!\nSuccess: ${successCount}\nErrors: ${errorCount}`);
      fetchData();
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format.');
    } finally {
      setUploadingBank(false);
      if (bankFileInputRef.current) {
        bankFileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Function to calculate actual balance including transactions
  const calculateAccountBalance = (account) => {
    let balance = parseFloat(account.balance || 0);

    // Debug: Log account and transactions
    console.log('Account:', account);
    console.log('All bank transactions:', bankTransactions);

    // Get all transactions for this account
    const accountTransactions = bankTransactions.filter(transaction => {
      // Handle both string and object accountId
      const transactionAccountId = typeof transaction.accountId === 'object'
        ? transaction.accountId._id || transaction.accountId
        : transaction.accountId;

      console.log('Comparing:', transactionAccountId, 'with', account._id);
      return transactionAccountId === account._id;
    });

    console.log('Account transactions:', accountTransactions);

    // Calculate net transaction amount
    const netTransactionAmount = accountTransactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount || 0);
      // Credit transactions add to balance
      if (transaction.type === 'credit' || transaction.type === 'deposit' || transaction.type === 'refund' || transaction.type === 'income') {
        return total + amount;
      }
      // Debit transactions subtract from balance
      else if (transaction.type === 'debit' || transaction.type === 'withdrawal' || transaction.type === 'payment' || transaction.type === 'transfer') {
        return total - amount;
      }
      else {
        return total; // For other types like fee, interest, etc.
      }
    }, 0);

    const finalBalance = balance + netTransactionAmount;
    console.log('Original balance:', balance, 'Net transactions:', netTransactionAmount, 'Final balance:', finalBalance);

    return finalBalance;
  };

  return (
    <div className="cash-cards-bank">
      <h1>Cash, Cards & Bank Transactions</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'cash' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash')}
        >
          Cash ({cashRecords.length})
        </button>
        <button
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Cards ({cardRecords.length})
        </button>
        <button
          className={`tab ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          Bank ({bankRecords.length})
        </button>
        <button
          className={`tab chart-toggle ${showChart ? 'active' : ''}`}
          onClick={() => setShowChart(!showChart)}
        >
          {showChart ? 'Hide Chart' : 'Show Chart'}
        </button>
      </div>

      {/* Cash Section */}
      {activeTab === 'cash' && (
        <CashMemberManagement familyMembers={familyMembers} />
      )}

      {/* Cards Section */}
      {activeTab === 'cards' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Card Management</h2>
            <div className="header-buttons">
              <input
                type="file"
                ref={cardFileInputRef}
                onChange={handleCardExcelUpload}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
              />
              <button
                className="add-btn card-btn"
                onClick={() => {
                  resetCardForm();
                  setEditingItem(null);
                  setShowCardForm(true);
                }}
              >
                Add Card
              </button>
              <button
                className="add-btn transaction-btn"
                onClick={() => {
                  resetTransactionForm();
                  setShowTransactionForm(true);
                }}
              >
                Add Transaction
              </button>
              <button
                className="add-btn"
                onClick={() => cardFileInputRef.current?.click()}
                disabled={uploadingCard}
                style={{ background: uploadingCard ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                {uploadingCard ? 'Uploading...' : '📄 Upload Excel'}
              </button>
              <a
                href={CardTemplate}
                download="Card_Template.xlsx"
                className="add-btn"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⬇️ Template
              </a>
              <button
                className="add-btn"
                onClick={() => setShowCardColumnsModal(true)}
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                ℹ️ Columns
              </button>
            </div>
          </div>

          {showCardForm && (
            <ModalPortal>
              <div className="ccb-modal">
                <div className="ccb-modal-content">
                  <h3>{editingItem ? 'Edit' : 'Add'} Card</h3>
                  <form onSubmit={handleCardSubmit} autoComplete="off">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label>Type:</label>
                        <select
                          value={cardForm.type}
                          onChange={(e) => setCardForm({ ...cardForm, type: e.target.value })}
                        >
                          <option value="credit-card">Credit Card</option>
                          <option value="debit-card">Debit Card</option>
                          <option value="prepaid-card">Prepaid Card</option>
                          <option value="gift-card">Gift Card</option>
                          <option value="loyalty-card">Loyalty Card</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Card Name: *</label>
                        <input
                          type="text"
                          value={cardForm.name}
                          onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Issuer: *</label>
                        <input
                          type="text"
                          value={cardForm.issuer}
                          onChange={(e) => setCardForm({ ...cardForm, issuer: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Card Number: *</label>
                        <input
                          type="text"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          value={cardForm.cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                            setCardForm({ ...cardForm, cardNumber: val.substring(0, 19) });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name: *</label>
                        <select
                          value={cardForm.cardholderName}
                          onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                          required
                        >
                          <option value="">Select cardholder...</option>
                          {familyMembers.map((member, index) => (
                            <option key={index} value={member.name}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Expiry Date (MM/YY): *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardForm.expiryDate}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) {
                              val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            }
                            setCardForm({ ...cardForm, expiryDate: val });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV: *</label>
                        <input
                          type="text"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                          required
                        />
                      </div>

                      {cardForm.type === 'credit-card' && (
                        <>
                          <div className="form-group">
                            <label>Credit Limit: *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cardForm.creditLimit}
                              onChange={(e) => setCardForm({ ...cardForm, creditLimit: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Interest Rate (%):</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cardForm.interestRate}
                              onChange={(e) => setCardForm({ ...cardForm, interestRate: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Minimum Payment:</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cardForm.minimumPayment}
                              onChange={(e) => setCardForm({ ...cardForm, minimumPayment: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Due Date:</label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={cardForm.dueDate}
                              onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      {cardForm.type === 'debit-card' && (
                        <>
                          <div className="form-group">
                            <label>Linked Account: *</label>
                            <input
                              type="text"
                              value={cardForm.linkedAccount}
                              onChange={(e) => setCardForm({ ...cardForm, linkedAccount: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Bank Name:</label>
                            <input
                              type="text"
                              value={cardForm.bankName}
                              onChange={(e) => setCardForm({ ...cardForm, bankName: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      <div className="form-group">
                        <label>Currency:</label>
                        <select
                          value={cardForm.currency}
                          onChange={(e) => setCardForm({ ...cardForm, currency: e.target.value })}
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                        </select>
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={cardForm.isInternational}
                            onChange={(e) => setCardForm({ ...cardForm, isInternational: e.target.checked })}
                          />
                          International Card
                        </label>
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={cardForm.contactless}
                            onChange={(e) => setCardForm({ ...cardForm, contactless: e.target.checked })}
                          />
                          Contactless Enabled
                        </label>
                      </div>

                      <div className="form-group full-width">
                        <label>Description:</label>
                        <textarea
                          value={cardForm.description}
                          onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Notes:</label>
                        <textarea
                          value={cardForm.notes}
                          onChange={(e) => setCardForm({ ...cardForm, notes: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="button" onClick={() => setShowCardForm(false)}>Cancel</button>
                      <button type="submit">{editingItem ? 'Update' : 'Save'}</button>
                    </div>
                  </form>
                </div>
              </div>
            </ModalPortal>
          )}

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <ModalPortal>
              <div className="ccb-modal">
                <div className="ccb-modal-content">
                  <h3>{editingTransaction ? 'Edit' : 'Add'} Card Transaction</h3>
                  <form onSubmit={handleTransactionSubmit} autoComplete="off">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label>Select Card: *</label>
                        <select
                          value={transactionForm.cardId}
                          onChange={(e) => setTransactionForm({ ...transactionForm, cardId: e.target.value })}
                          required
                        >
                          <option value="">Choose a card...</option>
                          {cardRecords.map(card => (
                            <option key={card._id} value={card._id}>
                              {card.name} - {card.issuer}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Transaction Type:</label>
                        <select
                          value={transactionForm.type}
                          onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                        >
                          <option value="credit">Credit (Deposits)</option>
                          <option value="debit">Debit (Withdrawal)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Amount: *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={transactionForm.amount}
                          onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Currency:</label>
                        <select
                          value={transactionForm.currency}
                          onChange={(e) => setTransactionForm({ ...transactionForm, currency: e.target.value })}
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Merchant/Description: *</label>
                        <input
                          type="text"
                          value={transactionForm.merchant}
                          onChange={(e) => setTransactionForm({ ...transactionForm, merchant: e.target.value })}
                          placeholder="e.g., Amazon, Grocery Store"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Broader Category: *</label>
                        <select
                          value={transactionForm.broaderCategory}
                          onChange={(e) => {
                            const broader = e.target.value;
                            setTransactionForm({
                              ...transactionForm,
                              broaderCategory: broader,
                              mainCategory: '',
                              subCategory: '',
                              customSubCategory: ''
                            });
                          }}
                          required
                        >
                          <option value="">Select broader category...</option>
                          {transactionForm.type === 'credit' ? (
                            // Show only Income for Credit transactions
                            <option value="Income">Income</option>
                          ) : (
                            // Show all expense categories for Debit transactions
                            <>
                              {getBroaderCategories().filter(cat => cat !== 'Income').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="Investment to Business">Investment to Business</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Main Category - shown only when Broader Category is selected */}
                      {transactionForm.broaderCategory && (
                        <div className="form-group">
                          <label>Main Category: *</label>
                          <select
                            value={transactionForm.mainCategory}
                            onChange={(e) => {
                              const main = e.target.value;
                              setTransactionForm({
                                ...transactionForm,
                                mainCategory: main,
                                subCategory: '',
                                customSubCategory: ''
                              });
                            }}
                            required
                          >
                            <option value="">Select main category...</option>
                            {transactionForm.broaderCategory === 'Investment to Business' ? (
                              <option value="Business">Business</option>
                            ) : (
                              getMainCategories(transactionForm.broaderCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))
                            )}
                          </select>
                        </div>
                      )}

                      {/* Sub Category - shown only when Main Category is selected */}
                      {transactionForm.mainCategory && (
                        <div className="form-group">
                          <label>Sub Category: *</label>
                          <select
                            value={transactionForm.subCategory}
                            onChange={(e) => {
                              const sub = e.target.value;
                              setTransactionForm({
                                ...transactionForm,
                                subCategory: sub,
                                customSubCategory: sub === 'Other' ? '' : transactionForm.customSubCategory
                              });
                            }}
                            required
                          >
                            <option value="">Select sub category...</option>
                            {/* For Income -> Salary or Business, show company names */}
                            {transactionForm.broaderCategory === 'Income' && (transactionForm.mainCategory === 'Salary' || transactionForm.mainCategory === 'Business') ? (
                              <>
                                {companyRecords.map(company => (
                                  <option key={company._id || company.id} value={company.companyName}>{company.companyName}</option>
                                ))}
                                <option value="Other">Other</option>
                              </>
                            ) : transactionForm.broaderCategory === 'Investment to Business' && transactionForm.mainCategory === 'Business' ? (
                              <>
                                {companyRecords.map(company => (
                                  <option key={company._id || company.id} value={company.companyName}>{company.companyName}</option>
                                ))}
                              </>
                            ) : (
                              getSubCategories(transactionForm.broaderCategory, transactionForm.mainCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))
                            )}
                          </select>
                        </div>
                      )}

                      {/* Custom Sub Category - shown only when "Other" is selected */}
                      {transactionForm.subCategory === 'Other' && (
                        <div className="form-group">
                          <label>Custom Sub Category: *</label>
                          <input
                            type="text"
                            value={transactionForm.customSubCategory}
                            onChange={(e) => setTransactionForm({ ...transactionForm, customSubCategory: e.target.value })}
                            placeholder="Enter custom sub category..."
                            required
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label>Date: *</label>
                        <input
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                          required
                        />
                      </div>
                      {/* <div className="form-group">
                        <label>Type of Transaction:</label>
                        <select
                          value={transactionForm.transactionType}
                          onChange={(e) => setTransactionForm({ ...transactionForm, transactionType: e.target.value })}
                        >
                          <option value="">Select type...</option>
                          <option value="credit">Credit (Deposits)</option>
                          <option value="debit">Debit (Withdrawal)</option>
                        </select>
                      </div> */}
                      <div className="form-group">
                        <label>Expense Type:</label>
                        <select
                          value={transactionForm.expenseType}
                          onChange={(e) => setTransactionForm({ ...transactionForm, expenseType: e.target.value })}
                        >
                          <option value="">Select type...</option>
                          <option value="important-necessary">Important & Necessary</option>
                          <option value="less-important">Less Important</option>
                          <option value="avoidable-loss">Avoidable & Loss</option>
                          <option value="unnecessary">Un-necessary</option>
                          <option value="basic-necessity">Basic Necessity</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Description (Optional):</label>
                        <textarea
                          value={transactionForm.description}
                          onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                          placeholder="Additional notes..."
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="form-group checkbox-group" style={{ marginTop: '10px' }}>
                        <input
                          type="checkbox"
                          id="isCardMilestone"
                          checked={transactionForm.isMilestone}
                          onChange={(e) => setTransactionForm({ ...transactionForm, isMilestone: e.target.checked })}
                          style={{ width: 'auto' }}
                        />
                        <label htmlFor="isCardMilestone" style={{ cursor: 'pointer', fontSize: '14px' }}>
                          Mark as Milestone
                        </label>
                      </div>
                    </div>

                    {/* Paying For Dropdown */}
                    <PayingForDropdown
                      value={transactionForm.payingFor}
                      onChange={(payingFor) => {
                        const updates = { payingFor };
                        // Auto-fill amount if provided
                        if (payingFor.amount) {
                          updates.amount = payingFor.amount;
                        }
                        setTransactionForm({ ...transactionForm, ...updates });
                      }}
                      disabled={false}
                    />

                    <div className="form-actions">
                      <button type="button" onClick={() => {
                        setShowTransactionForm(false);
                        setEditingTransaction(null);
                        resetTransactionForm();
                      }}>Cancel</button>
                      <button type="submit">{editingTransaction ? 'Update' : 'Add'} Transaction</button>
                    </div>
                  </form>
                </div>
              </div>
            </ModalPortal>
          )}

          {/* Cards Table */}
          {!selectedCard ? (
            <>
              <div className="filter-dropdown" style={{ marginBottom: '20px' }}>
                <label>Card Name:</label>
                <input
                  type="text"
                  placeholder="Search by card name..."
                  value={cardNameFilter}
                  onChange={(e) => setCardNameFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', minWidth: '200px' }}
                />

                <label>Cardholder Name:</label>
                <input
                  type="text"
                  placeholder="Search by cardholder..."
                  value={cardholderNameFilter}
                  onChange={(e) => setCardholderNameFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', minWidth: '200px' }}
                />
              </div>

              <div className="records-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cardholder Name</th>
                      <th>Card Name</th>
                      <th>Type</th>
                      <th>Issuer</th>
                      <th>Card Number</th>
                      <th>Expiry</th>
                      <th>Credit Limit</th>
                      <th>Currency</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardRecords
                      .filter(card => {
                        // Filter by card name
                        if (cardNameFilter && !card.name.toLowerCase().includes(cardNameFilter.toLowerCase())) return false;
                        // Filter by cardholder name
                        if (cardholderNameFilter && !card.cardholderName.toLowerCase().includes(cardholderNameFilter.toLowerCase())) return false;
                        return true;
                      })
                      .map(card => (
                        <tr key={card._id}>
                          <td>{card.cardholderName}</td>
                          <td>
                            <span
                              onClick={() => setSelectedCard(card)}
                              style={{
                                color: '#007bff',
                                cursor: 'pointer',
                                fontWeight: '600',
                                textDecoration: 'underline'
                              }}
                            >
                              {card.name}
                            </span>
                          </td>
                          <td>
                            <span className={`record-type-badge ${card.type.split('-').join(' ')}`}>
                              {card.type.replace('-', ' ')}
                            </span>
                          </td>
                          <td>{card.issuer}</td>
                          <td>****-****-****-{card.cardNumber.slice(-4)}</td>
                          <td>{card.expiryDate}</td>
                          <td>
                            {card.creditLimit ? `${card.currency} ${card.creditLimit}` : '-'}
                          </td>
                          <td>{card.currency}</td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleEdit(card, 'card')} className="edit-btn">Edit</button>
                              <button onClick={() => handleDelete(card._id, 'cards')} className="delete-btn">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {cardRecords.filter(card => {
                  // Filter by card name
                  if (cardNameFilter && !card.name.toLowerCase().includes(cardNameFilter.toLowerCase())) return false;
                  // Filter by cardholder name
                  if (cardholderNameFilter && !card.cardholderName.toLowerCase().includes(cardholderNameFilter.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                    <div className="empty-state">
                      <p>{cardNameFilter || cardholderNameFilter ? 'No cards found matching the filters.' : 'No cards added yet. Add your first card to get started!'}</p>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div>
              <button
                onClick={() => setSelectedCard(null)}
                className="add-btn"
                style={{ marginBottom: '20px' }}
              >
                ← Back to All Cards
              </button>
              <div className="selected-card-info" style={{
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                borderRadius: '12px',
                padding: '20px',
                color: 'white',
                marginBottom: '20px'
              }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'center',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                >
                  <span>Card: {selectedCard.name}</span>
                  <span>Type: {selectedCard.type.replace('-', ' ').toUpperCase()}</span>
                  <span>Issuer: {selectedCard.issuer}</span>
                  <span>Card Number: ****-****-****-{selectedCard.cardNumber.slice(-4)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Section */}
          {selectedCard && (
            <div className="transactions-section">
              <div className="section-header">
                <h3>Transactions for {selectedCard.name}</h3>
                <div className="filter-dropdown">
                  <label>Expense Type:</label>
                  <select
                    value={cardTransactionExpenseTypeFilter}
                    onChange={(e) => setCardTransactionExpenseTypeFilter(e.target.value)}
                  >
                    <option value="all">All Expense Types</option>
                    <option value="important-necessary">Important & Necessary</option>
                    <option value="less-important">Less Important</option>
                    <option value="avoidable-loss">Avoidable & Loss</option>
                    <option value="unnecessary">Un-necessary</option>
                    <option value="basic-necessity">Basic Necessity</option>
                  </select>

                  <label>From Date:</label>
                  <input
                    type="date"
                    value={cardTransactionStartDate}
                    onChange={(e) => setCardTransactionStartDate(e.target.value)}
                    style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                  />

                  <label>To Date:</label>
                  <input
                    type="date"
                    value={cardTransactionEndDate}
                    onChange={(e) => setCardTransactionEndDate(e.target.value)}
                    style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <TransactionTable
                transactions={cardTransactions.filter(transaction => {
                  const transactionCardId = typeof transaction.cardId === 'object'
                    ? transaction.cardId._id || transaction.cardId
                    : transaction.cardId;
                  if (transactionCardId !== selectedCard._id) return false;
                  if (cardTransactionExpenseTypeFilter !== 'all' && transaction.expenseType !== cardTransactionExpenseTypeFilter) return false;
                  const transactionDate = new Date(transaction.date);
                  if (cardTransactionStartDate && transactionDate < new Date(cardTransactionStartDate)) return false;
                  if (cardTransactionEndDate) {
                    const endDate = new Date(cardTransactionEndDate);
                    endDate.setHours(23, 59, 59, 999);
                    if (transactionDate > endDate) return false;
                  }
                  return true;
                })}
                currency={selectedCard.currency || 'INR'}
                initialBalance={selectedCard.creditLimit || 0}
                onEdit={handleTransactionEdit}
                onDelete={handleTransactionDelete}
              />
            </div>
          )}

        </div>
      )}

      {/* Bank Section */}
      {activeTab === 'bank' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Bank Accounts</h2>
            <div className="header-buttons">
              <input
                type="file"
                ref={bankFileInputRef}
                onChange={handleBankExcelUpload}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
              />
              <button
                className="add-btn"
                onClick={() => {
                  resetBankForm();
                  setEditingItem(null);
                  setShowBankForm(true);
                }}
              >
                Add Bank Account
              </button>
              <button
                className="add-btn transaction-btn"
                onClick={() => {
                  resetBankTransactionForm();
                  setShowBankTransactionForm(true);
                }}
              >
                Add Bank Transaction
              </button>
              <button
                className="add-btn"
                onClick={() => bankFileInputRef.current?.click()}
                disabled={uploadingBank}
                style={{ background: uploadingBank ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                {uploadingBank ? 'Uploading...' : '📄 Upload Excel'}
              </button>
              <a
                href={BankTemplate}
                download="Bank_Template.xlsx"
                className="add-btn"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⬇️ Template
              </a>
              <button
                className="add-btn"
                onClick={() => setShowBankColumnsModal(true)}
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                ℹ️ Columns
              </button>
            </div>
          </div>

          {showBankForm && (
            <ModalPortal>
              <div className="ccb-modal">
                <div className="ccb-modal-content">
                  <h3>{editingItem ? 'Edit' : 'Add'} Bank Account</h3>
                  <form onSubmit={handleBankSubmit} autoComplete="off">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label>Account Type:</label>
                        <select
                          value={bankForm.type}
                          onChange={(e) => setBankForm({ ...bankForm, type: e.target.value })}
                        >
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="nri-account">NRI Account</option>
                          <option value="joint-account">Joint Account</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Account Name: *</label>
                        <input
                          type="text"
                          value={bankForm.name}
                          onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Bank Name: *</label>
                        <input
                          type="text"
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Account Number: *</label>
                        <input
                          type="text"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Account Holder Name: *</label>
                        <select
                          value={bankForm.accountHolderName}
                          onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                          required
                        >
                          <option value="">Select family member...</option>
                          {familyMembers.map((member, index) => (
                            <option key={index} value={member.name}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Currency:</label>
                        <select
                          value={bankForm.currency}
                          onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Balance: *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bankForm.balance}
                          onChange={(e) => setBankForm({ ...bankForm, balance: e.target.value })}
                          required
                        />
                      </div>

                      {(bankForm.type === 'fixed-deposit' || bankForm.type === 'recurring-deposit') && (
                        <>
                          <div className="form-group">
                            <label>Deposit Amount: *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={bankForm.depositAmount}
                              onChange={(e) => setBankForm({ ...bankForm, depositAmount: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Interest Rate (%): *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={bankForm.interestRate}
                              onChange={(e) => setBankForm({ ...bankForm, interestRate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Tenure (months): *</label>
                            <input
                              type="number"
                              value={bankForm.tenure}
                              onChange={(e) => setBankForm({ ...bankForm, tenure: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={bankForm.autoRenewal}
                                onChange={(e) => setBankForm({ ...bankForm, autoRenewal: e.target.checked })}
                              />
                              Auto Renewal
                            </label>
                          </div>
                        </>
                      )}

                      <div className="form-group">
                        <label>IFSC Code: *</label>
                        <input
                          type="text"
                          value={bankForm.ifscCode}
                          onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>MICR Code:</label>
                        <input
                          type="text"
                          value={bankForm.micrCode}
                          onChange={(e) => setBankForm({ ...bankForm, micrCode: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Branch Name: *</label>
                        <input
                          type="text"
                          value={bankForm.branchName}
                          onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Branch Address:</label>
                        <input
                          type="text"
                          value={bankForm.branchAddress}
                          onChange={(e) => setBankForm({ ...bankForm, branchAddress: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>City:</label>
                        <input
                          type="text"
                          value={bankForm.city}
                          onChange={(e) => setBankForm({ ...bankForm, city: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>State:</label>
                        <input
                          type="text"
                          value={bankForm.state}
                          onChange={(e) => setBankForm({ ...bankForm, state: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode: *</label>
                        <input
                          type="text"
                          value={bankForm.pincode}
                          onChange={(e) => setBankForm({ ...bankForm, pincode: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={bankForm.netBankingEnabled}
                            onChange={(e) => setBankForm({ ...bankForm, netBankingEnabled: e.target.checked })}
                          />
                          Net Banking Enabled
                        </label>
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={bankForm.mobileBankingEnabled}
                            onChange={(e) => setBankForm({ ...bankForm, mobileBankingEnabled: e.target.checked })}
                          />
                          Mobile Banking Enabled
                        </label>
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={bankForm.upiEnabled}
                            onChange={(e) => setBankForm({ ...bankForm, upiEnabled: e.target.checked })}
                          />
                          UPI Enabled
                        </label>
                      </div>

                      {bankForm.upiEnabled && (
                        <div className="form-group">
                          <label>UPI ID:</label>
                          <input
                            type="text"
                            value={bankForm.upiId}
                            onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label>Nominee Name:</label>
                        <input
                          type="text"
                          value={bankForm.nomineeName}
                          onChange={(e) => setBankForm({ ...bankForm, nomineeName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nominee Relationship:</label>
                        <input
                          type="text"
                          value={bankForm.nomineeRelationship}
                          onChange={(e) => setBankForm({ ...bankForm, nomineeRelationship: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nominee Age:</label>
                        <input
                          type="number"
                          value={bankForm.nomineeAge}
                          onChange={(e) => setBankForm({ ...bankForm, nomineeAge: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nominee Contact:</label>
                        <input
                          type="text"
                          value={bankForm.nomineeContact}
                          onChange={(e) => setBankForm({ ...bankForm, nomineeContact: e.target.value })}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Description:</label>
                        <textarea
                          value={bankForm.description}
                          onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Notes:</label>
                        <textarea
                          value={bankForm.notes}
                          onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="button" onClick={() => setShowBankForm(false)}>Cancel</button>
                      <button type="submit">{editingItem ? 'Update' : 'Save'}</button>
                    </div>
                  </form>
                </div>
              </div>
            </ModalPortal>
          )}

          {showBankTransactionForm && (
            <ModalPortal>
              <div className="ccb-modal">
                <div className="ccb-modal-content">
                  <h3>{editingBankTransaction ? 'Edit' : 'Add'} Bank Transaction</h3>
                  <form onSubmit={handleBankTransactionSubmit} autoComplete="off">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label>Select Account: *</label>
                        <select
                          value={bankTransactionForm.accountId}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, accountId: e.target.value })}
                          required
                        >
                          <option value="">Choose an account...</option>
                          {bankRecords.map(account => (
                            <option key={account._id} value={account._id}>
                              {account.name} - {account.bankName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Transaction Type: *</label>
                        <select
                          value={bankTransactionForm.type}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, type: e.target.value })}
                          required
                        >
                          <option value="credit">Credit (Deposits)</option>
                          <option value="debit">Debit (Withdrawal)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Amount: *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bankTransactionForm.amount}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Merchant/Payee: *</label>
                        <input
                          type="text"
                          value={bankTransactionForm.merchant}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, merchant: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Broader Category: *</label>
                        <select
                          value={bankTransactionForm.broaderCategory}
                          onChange={(e) => {
                            const broader = e.target.value;
                            setBankTransactionForm({
                              ...bankTransactionForm,
                              broaderCategory: broader,
                              mainCategory: '',
                              subCategory: '',
                              customSubCategory: ''
                            });
                          }}
                          required
                        >
                          <option value="">Select broader category...</option>
                          {bankTransactionForm.type === 'credit' ? (
                            // Show only Income for Credit transactions
                            <option value="Income">Income</option>
                          ) : (
                            // Show all expense categories for Debit transactions
                            <>
                              {getBroaderCategories().filter(cat => cat !== 'Income').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="Investment to Business">Investment to Business</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Main Category - shown only when Broader Category is selected */}
                      {bankTransactionForm.broaderCategory && (
                        <div className="form-group">
                          <label>Main Category: *</label>
                          <select
                            value={bankTransactionForm.mainCategory}
                            onChange={(e) => {
                              const main = e.target.value;
                              setBankTransactionForm({
                                ...bankTransactionForm,
                                mainCategory: main,
                                subCategory: '',
                                customSubCategory: ''
                              });
                            }}
                            required
                          >
                            <option value="">Select main category...</option>
                            {bankTransactionForm.broaderCategory === 'Investment to Business' ? (
                              <option value="Business">Business</option>
                            ) : (
                              getMainCategories(bankTransactionForm.broaderCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))
                            )}
                          </select>
                        </div>
                      )}

                      {/* Sub Category - shown only when Main Category is selected */}
                      {bankTransactionForm.mainCategory && (
                        <div className="form-group">
                          <label>Sub Category: *</label>
                          <select
                            value={bankTransactionForm.subCategory}
                            onChange={(e) => {
                              const sub = e.target.value;
                              setBankTransactionForm({
                                ...bankTransactionForm,
                                subCategory: sub,
                                customSubCategory: sub === 'Other' ? '' : bankTransactionForm.customSubCategory
                              });
                            }}
                            required
                          >
                            <option value="">Select sub category...</option>
                            {/* For Income -> Salary or Business, show company names */}
                            {bankTransactionForm.broaderCategory === 'Income' && (bankTransactionForm.mainCategory === 'Salary' || bankTransactionForm.mainCategory === 'Business') ? (
                              <>
                                {companyRecords.map(company => (
                                  <option key={company._id || company.id} value={company.companyName}>{company.companyName}</option>
                                ))}
                                <option value="Other">Other</option>
                              </>
                            ) : bankTransactionForm.broaderCategory === 'Investment to Business' && bankTransactionForm.mainCategory === 'Business' ? (
                              <>
                                {companyRecords.map(company => (
                                  <option key={company._id || company.id} value={company.companyName}>{company.companyName}</option>
                                ))}
                              </>
                            ) : (
                              getSubCategories(bankTransactionForm.broaderCategory, bankTransactionForm.mainCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))
                            )}
                          </select>
                        </div>
                      )}

                      {/* Custom Sub Category - shown only when "Other" is selected */}
                      {bankTransactionForm.subCategory === 'Other' && (
                        <div className="form-group">
                          <label>Custom Sub Category: *</label>
                          <input
                            type="text"
                            value={bankTransactionForm.customSubCategory}
                            onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, customSubCategory: e.target.value })}
                            placeholder="Enter custom sub category..."
                            required
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label>Date: *</label>
                        <input
                          type="date"
                          value={bankTransactionForm.date}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, date: e.target.value })}
                          required
                        />
                      </div>
                      {/* <div className="form-group">
                        <label>Type of Transaction:</label>
                        <select
                          value={bankTransactionForm.transactionType}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, transactionType: e.target.value })}
                        >
                          <option value="">Select type...</option>
                          <option value="credit">Credit (Deposits)</option>
                          <option value="debit">Debit (Withdrawal)</option>
                        </select>
                      </div> */}
                      {bankTransactionForm.type !== 'credit' && (
                        <div className="form-group">
                          <label>Expense Type:</label>
                          <select
                            value={bankTransactionForm.expenseType}
                            onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, expenseType: e.target.value })}
                          >
                            <option value="">Select type...</option>
                            <option value="important-necessary">Important & Necessary</option>
                            <option value="less-important">Less Important</option>
                            <option value="avoidable-loss">Avoidable & Loss</option>
                            <option value="unnecessary">Un-necessary</option>
                            <option value="basic-necessity">Basic Necessity</option>
                          </select>
                        </div>
                      )}
                      <div className="form-group">
                        <label>Description (Optional):</label>
                        <textarea
                          value={bankTransactionForm.description}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, description: e.target.value })}
                          placeholder="Additional notes..."
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label>Currency:</label>
                        <select
                          value={bankTransactionForm.currency}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, currency: e.target.value })}
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                        </select>
                      </div>
                      <div className="form-group checkbox-group" style={{ marginTop: '10px' }}>
                        <input
                          type="checkbox"
                          id="isMilestone"
                          checked={bankTransactionForm.isMilestone}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, isMilestone: e.target.checked })}
                          style={{ width: 'auto' }}
                        />
                        <label htmlFor="isMilestone" style={{ cursor: 'pointer', fontSize: '14px' }}>
                          Mark as Milestone
                        </label>
                      </div>

                      {/* Udhar Lena Dena Checkbox */}
                      <div className="form-group checkbox-group" style={{ marginTop: '10px' }}>
                        <input
                          type="checkbox"
                          id="createAsUdhar"
                          checked={bankTransactionForm.createAsUdhar}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, createAsUdhar: e.target.checked })}
                          style={{ width: 'auto' }}
                        />
                        <label htmlFor="createAsUdhar" style={{ cursor: 'pointer', fontSize: '14px' }}>
                          Create as Udhar Lena Dena (
                          {bankTransactionForm.type === 'credit' ? 'Udhar Lia - Borrowed' : 'Udhar Dia - Lent'}
                          )
                        </label>
                      </div>

                      {/* Conditional Udhar Fields */}
                      {bankTransactionForm.createAsUdhar && (
                        <>
                          <div className="form-group">
                            <label>Person Name: *</label>
                            <input
                              type="text"
                              value={bankTransactionForm.udharPersonName}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, udharPersonName: e.target.value })}
                              placeholder={bankTransactionForm.merchant || 'Enter person name'}
                              required={bankTransactionForm.createAsUdhar}
                            />
                          </div>
                          <div className="form-group">
                            <label>Purpose:</label>
                            <input
                              type="text"
                              value={bankTransactionForm.udharPurpose}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, udharPurpose: e.target.value })}
                              placeholder={bankTransactionForm.description || 'Enter purpose'}
                            />
                          </div>
                          <div className="form-group">
                            <label>Return Date (Optional):</label>
                            <input
                              type="date"
                              value={bankTransactionForm.udharReturnDate}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, udharReturnDate: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      {/* On Behalf Checkbox */}
                      <div className="form-group checkbox-group" style={{ marginTop: '10px' }}>
                        <input
                          type="checkbox"
                          id="createAsOnBehalf"
                          checked={bankTransactionForm.createAsOnBehalf}
                          onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, createAsOnBehalf: e.target.checked })}
                          style={{ width: 'auto' }}
                        />
                        <label htmlFor="createAsOnBehalf" style={{ cursor: 'pointer', fontSize: '14px' }}>
                          Create as On Behalf Payment
                        </label>
                      </div>

                      {/* Conditional On Behalf Fields */}
                      {bankTransactionForm.createAsOnBehalf && (
                        <>
                          <div className="form-group">
                            <label>Paid On Behalf Of: *</label>
                            <input
                              type="text"
                              value={bankTransactionForm.onBehalfPersonName}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, onBehalfPersonName: e.target.value })}
                              placeholder={bankTransactionForm.merchant || 'Enter person name'}
                              required={bankTransactionForm.createAsOnBehalf}
                            />
                          </div>
                          <div className="form-group">
                            <label>Purpose:</label>
                            <input
                              type="text"
                              value={bankTransactionForm.onBehalfPurpose}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, onBehalfPurpose: e.target.value })}
                              placeholder={bankTransactionForm.description || 'Enter purpose'}
                            />
                          </div>
                          <div className="form-group">
                            <label>Received Amount (Optional):</label>
                            <input
                              type="number"
                              value={bankTransactionForm.onBehalfReceivedAmount}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, onBehalfReceivedAmount: e.target.value })}
                              placeholder="Amount received back"
                            />
                          </div>
                          <div className="form-group">
                            <label>Receipt Date (Optional):</label>
                            <input
                              type="date"
                              value={bankTransactionForm.onBehalfReceiptDate}
                              onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, onBehalfReceiptDate: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Paying For Dropdown */}
                    <PayingForDropdown
                      value={bankTransactionForm.payingFor}
                      onChange={(payingFor) => {
                        const updates = { payingFor };
                        if (payingFor.amount) {
                          updates.amount = payingFor.amount;
                        }
                        setBankTransactionForm({ ...bankTransactionForm, ...updates });
                      }}
                      disabled={false}
                    />

                    <div className="form-actions">
                      <button type="button" onClick={() => {
                        setShowBankTransactionForm(false);
                        setEditingBankTransaction(null);
                        resetBankTransactionForm();
                      }}>Cancel</button>
                      <button type="submit">{editingBankTransaction ? 'Update' : 'Add'} Transaction</button>
                    </div>
                  </form>
                </div>
              </div>
            </ModalPortal>
          )}

          {/* Bank Transactions Section */}
          {selectedBank && (
            <div className="transactions-section">
              <div className="section-header">
                <h3>Transactions for {selectedBank.name}</h3>
                <div className="filter-dropdown">
                  <label>Expense Type:</label>
                  <select
                    value={bankTransactionExpenseTypeFilter}
                    onChange={(e) => setBankTransactionExpenseTypeFilter(e.target.value)}
                  >
                    <option value="all">All Expense Types</option>
                    <option value="important-necessary">Important & Necessary</option>
                    <option value="less-important">Less Important</option>
                    <option value="avoidable-loss">Avoidable & Loss</option>
                    <option value="unnecessary">Un-necessary</option>
                    <option value="basic-necessity">Basic Necessity</option>
                  </select>

                  <label>From Date:</label>
                  <input
                    type="date"
                    value={bankTransactionStartDate}
                    onChange={(e) => setBankTransactionStartDate(e.target.value)}
                    style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                  />

                  <label>To Date:</label>
                  <input
                    type="date"
                    value={bankTransactionEndDate}
                    onChange={(e) => setBankTransactionEndDate(e.target.value)}
                    style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <TransactionTable
                transactions={bankTransactions.filter(transaction => {
                  const transactionAccountId = typeof transaction.accountId === 'object'
                    ? transaction.accountId._id || transaction.accountId
                    : transaction.accountId;
                  if (transactionAccountId !== selectedBank._id) return false;
                  if (bankTransactionExpenseTypeFilter !== 'all' && transaction.expenseType !== bankTransactionExpenseTypeFilter) return false;
                  const transactionDate = new Date(transaction.date);
                  if (bankTransactionStartDate && transactionDate < new Date(bankTransactionStartDate)) return false;
                  if (bankTransactionEndDate) {
                    const endDate = new Date(bankTransactionEndDate);
                    endDate.setHours(23, 59, 59, 999);
                    if (transactionDate > endDate) return false;
                  }
                  return true;
                })}
                currency={selectedBank.currency || 'INR'}
                initialBalance={parseFloat(selectedBank.balance) || 0}
                onEdit={handleBankTransactionEdit}
                onDelete={handleBankTransactionDelete}
              />
            </div>
          )}

          {/* Bank Accounts Table */}
          {!selectedBank ? (
            <>
              <div className="filter-dropdown" style={{ marginBottom: '20px' }}>
                <label>Account Name:</label>
                <input
                  type="text"
                  placeholder="Search by account name..."
                  value={accountNameFilter}
                  onChange={(e) => setAccountNameFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', minWidth: '200px' }}
                />

                <label>Account Holder:</label>
                <input
                  type="text"
                  placeholder="Search by account holder..."
                  value={accountHolderFilter}
                  onChange={(e) => setAccountHolderFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', minWidth: '200px' }}
                />
              </div>

              <div className="records-table">
                <table>
                  <thead>
                    <tr>
                      <th>Account Holder</th>
                      <th>Account Name</th>
                      <th>Type</th>
                      <th>Bank Name</th>
                      <th>Account Number</th>
                      <th>Balance</th>
                      <th>IFSC Code</th>
                      <th>Branch</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankRecords
                      .filter(account => {
                        // Filter by account name
                        if (accountNameFilter && !account.name.toLowerCase().includes(accountNameFilter.toLowerCase())) return false;
                        // Filter by account holder name
                        if (accountHolderFilter && !account.accountHolderName.toLowerCase().includes(accountHolderFilter.toLowerCase())) return false;
                        return true;
                      })
                      .map(account => (
                        <tr key={account._id}>
                          <td>{account.accountHolderName}</td>
                          <td>
                            <span
                              onClick={() => setSelectedBank(account)}
                              style={{
                                color: '#007bff',
                                cursor: 'pointer',
                                fontWeight: '600',
                                textDecoration: 'underline'
                              }}
                            >
                              {account.name}
                            </span>
                          </td>
                          <td>
                            <span className={`record-type-badge ${account.type.split('-').join(' ')}`}>
                              {account.type.replace('-', ' ')}
                            </span>
                          </td>
                          <td>{account.bankName}</td>
                          <td>****-****-{account.accountNumber ? account.accountNumber.slice(-4) : '****'}</td>
                          <td className="amount">{account.currency} {calculateAccountBalance(account).toLocaleString()}</td>
                          <td>{account.ifscCode}</td>
                          <td>{account.branchName || '-'}</td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleEdit(account, 'bank')} className="edit-btn">Edit</button>
                              <button onClick={() => handleDelete(account._id, 'bank')} className="delete-btn">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {bankRecords.filter(account => {
                  // Filter by account name
                  if (accountNameFilter && !account.name.toLowerCase().includes(accountNameFilter.toLowerCase())) return false;
                  // Filter by account holder name
                  if (accountHolderFilter && !account.accountHolderName.toLowerCase().includes(accountHolderFilter.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                    <div className="empty-state">
                      <p>{accountNameFilter || accountHolderFilter ? 'No bank accounts found matching the filters.' : 'No bank accounts added yet. Add your first bank account to get started!'}</p>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div>
              <button
                onClick={() => setSelectedBank(null)}
                className="add-btn"
                style={{ marginBottom: '20px' }}
              >
                ← Back to All Banks
              </button>
              <div className="selected-card-info" style={{
                background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
                borderRadius: '12px',
                padding: '20px',
                color: 'white',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0 }}>Bank Account: {selectedBank.name}</h3>
                <p style={{ margin: '5px 0' }}>Type: {selectedBank.type.replace('-', ' ').toUpperCase()}</p>
                <p style={{ margin: '5px 0' }}>Bank: {selectedBank.bankName}</p>
                <p style={{ margin: '5px 0' }}>Account Number: ****-****-{selectedBank.accountNumber ? selectedBank.accountNumber.slice(-4) : '****'}</p>
                <p style={{ margin: '5px 0' }}>Balance: {selectedBank.currency} {calculateAccountBalance(selectedBank).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Overview Chart */}
      {showChart && (cashRecords.length > 0 || cardRecords.length > 0 || bankRecords.length > 0 || cardTransactions.length > 0 || bankTransactions.length > 0) && (
        <FinancialOverviewChart
          cashRecords={cashRecords}
          cardRecords={cardRecords}
          bankRecords={bankRecords}
          cardTransactions={cardTransactions}
          bankTransactions={bankTransactions}
        />
      )}

      {/* Card Columns Info Modal */}
      {showCardColumnsModal && (
        <ModalPortal>
          <div className="ccb-modal">
            <div className="ccb-modal-content" style={{ maxWidth: '800px' }}>
              <h3>📋 Required Excel Columns for Card Transactions</h3>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                Your Excel file should have these columns (case-sensitive):
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Column Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Required</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Card</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>John - HDFC or card name</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Transaction Type</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>purchase, payment, withdrawal</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Amount</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>1500.50</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Currency</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>INR, USD</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Merchant/Description</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Amazon, Grocery Store</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Broader Category</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Personal, Business</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Date</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>20/12/25 (DD/MM/YY)</td>
                  </tr>
                </tbody>
              </table>
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" onClick={() => setShowCardColumnsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Bank Columns Info Modal */}
      {showBankColumnsModal && (
        <ModalPortal>
          <div className="ccb-modal">
            <div className="ccb-modal-content" style={{ maxWidth: '800px' }}>
              <h3>📋 Required Excel Columns for Bank Transactions</h3>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                Your Excel file should have these columns (case-sensitive):
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Column Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Required</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Account</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Account Name OR Account Number (Use Number for unique matching)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Transaction Type</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>deposit, withdrawal, transfer</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Amount</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>5000.00</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Currency</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>INR, USD</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Merchant/Description</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Salary, Bill Payment</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Broader Category</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Personal, Business</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Date</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>✅ Yes</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>20/12/25 (DD/MM/YY)</td>
                  </tr>
                </tbody>
              </table>
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" onClick={() => setShowBankColumnsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Processing Overlay */}
      {(uploadingCard || uploadingBank) && (
        <ModalPortal>
          <div className="processing-overlay">
            <div className="processing-content">
              <div className="spinner"></div>
              <div className="processing-text">Processing Upload...</div>
              <div className="processing-subtext">Optimizing your data</div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <div className="processing-text progress-text">{uploadProgress}%</div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default CashCardsBank;
