import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiUsers, FiHome, FiBriefcase, FiGlobe, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import './Static.css';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const BasicDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // Track which section is being edited
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    anniversaryDate: '',
    // Contact Information
    primaryMobile: '',
    secondaryMobile: '',
    primaryEmail: '',
    secondaryEmail: '',
    whatsappNumber: '',
    // Address Information
    currentAddress: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    permanentAddress: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    sameAsCurrent: true,
    // Family Information
    familyHead: '',
    familyMembers: [],
    totalFamilyMembers: '',
    dependents: '',
    // Professional Information
    occupation: '',
    companyName: '',
    designation: '',
    workEmail: '',
    workPhone: '',
    officeAddress: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    },
    // Additional Information
    nationality: 'Indian',
    religion: '',
    caste: '',
    motherTongue: '',
    languagesKnown: [],
    aadhaarNumber: '',
    panNumber: '',
    passportNumber: '',
    voterId: '',
    emergencyContact: {
      name: '',
      relation: '',
      mobile: '',
      address: ''
    },
    // Mutual Funds Information
    mutualFunds: [],
    // Shares Information
    shares: [],
    // Insurance Information
    insurance: [],
    // Bank Information
    banks: [],
    // Mobile Bill Information
    mobileBills: [],
    // Card Details
    cards: [],
    // Payment Gateway
    paymentGateways: [],
    // Portfolio Details
    mutualFundsPortfolio: [],
    sharesPortfolio: [],
    insurancePortfolio: [],
    // Sub Broker Information
    subBrokers: []
  });

  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    relation: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    anniversaryDate: '',
    mobile: '',
    email: '',
    occupation: '',
    companyName: '',
    workPhone: '',
    education: '',
    specialization: '',
    hobbies: '',
    healthIssues: '',
    medications: '',
    aadhaarNumber: '',
    panNumber: '',
    passportNumber: '',
    drivingLicense: '',
    additionalInfo: ''
  });

  const [newMutualFund, setNewMutualFund] = useState({
    fundHouse: '',
    modeOfHolding: '',
    holdingType: '',
    investorName: '',
    ucc: '',
    mfName: '',
    folioNo: '',
    registeredMobile: '',
    registeredBank: '',
    registeredAddress: '',
    nominee: '',
    customerCareNumber: '',
    customerCareEmail: '',
    rmName: '',
    rmMobile: '',
    rmEmail: '',
    branchAddress: '',
    goalPurpose: '',
    subBrokerName: ''
  });

  const [newShare, setNewShare] = useState({
    dematCompany: '',
    modeOfHolding: '',
    holdingType: '',
    investorName: '',
    tradingId: '',
    dpId: '',
    scriptName: '',
    registeredMobile: '',
    registeredBank: '',
    registeredAddress: '',
    nominee: '',
    customerCareNumber: '',
    customerCareEmail: '',
    rmName: '',
    rmMobile: '',
    rmEmail: '',
    branchAddress: '',
    goalPurpose: '',
    subBrokerName: ''
  });

  const [newInsurance, setNewInsurance] = useState({
    insuranceCompany: '',
    insuranceType: '',
    insuranceSubType: '',
    policyPurpose: '',
    insurerName: '',
    policyName: '',
    policyNumber: '',
    registeredMobile: '',
    registeredBank: '',
    registeredAddress: '',
    nominee: '',
    customerCareNumber: '',
    customerCareEmail: '',
    rmName: '',
    rmMobile: '',
    rmEmail: '',
    branchAddress: '',
    goalPurpose: '',
    subBrokerName: ''
  });

  const [newBank, setNewBank] = useState({
    bankName: '',
    accountType: '',
    holdingType: '',
    accountHolderName: '',
    customerId: '',
    accountNumber: '',
    ifscCode: '',
    branchAddress: '',
    registeredMobile: '',
    registeredAddress: '',
    nominee: '',
    registeredEmail: '',
    rmName: '',
    rmMobile: '',
    rmEmail: '',
    goalPurpose: ''
  });

  const [newMobileBill, setNewMobileBill] = useState({
    mobileNumber: '',
    usedBy: '',
    billGenerationDate: '',
    bestBillPaymentDate: '',
    finalBillPaymentDate: '',
    emailId: '',
    alternateNo: '',
    address: '',
    planNo: '',
    customerNumber: '',
    goalPurpose: ''
  });

  const [newCard, setNewCard] = useState({
    bankName: '',
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    atmPin: '',
    cvv: '',
    url: '',
    userId: '',
    password: '',
    customerCareNumber: '',
    customerCareEmail: '',
    cardType: '',
    goalPurpose: ''
  });

  const [newPaymentGateway, setNewPaymentGateway] = useState({
    company: '',
    companyName: '',
    bankName: '',
    accountNumber: '',
    url: '',
    userId: '',
    password: '',
    goalPurpose: ''
  });

  const [newMutualFundPortfolio, setNewMutualFundPortfolio] = useState({
    srNo: '',
    fundHouse: '',
    investorName: '',
    fundName: '',
    goalPurpose: '',
    folioNumber: '',
    dateOfPurchase: '',
    purchaseNAV: '',
    numberOfUnits: '',
    purchaseValue: '',
    currentNAV: '',
    currentValuation: '',
    difference: '',
    percentDifference: '',
    subBrokerName: ''
  });

  const [newSharePortfolio, setNewSharePortfolio] = useState({
    srNo: '',
    dematCompany: '',
    investorName: '',
    scriptName: '',
    goalPurpose: '',
    dateOfPurchase: '',
    purchaseNAV: '',
    numberOfUnits: '',
    purchaseValue: '',
    currentNAV: '',
    currentValuation: '',
    difference: '',
    percentDifference: '',
    subBrokerName: ''
  });

  const [newInsurancePortfolio, setNewInsurancePortfolio] = useState({
    srNo: '',
    insuranceCompany: '',
    insurerName: '',
    policyType: '',
    goalPurpose: '',
    policyName: '',
    policyNumber: '',
    policyStartDate: '',
    premiumMode: '',
    premiumAmount: '',
    lastPremiumPayingDate: '',
    maturityDate: '',
    sumAssured: '',
    nominee: '',
    subBrokerName: ''
  });

  const [newLoanPortfolio, setNewLoanPortfolio] = useState({
    srNo: '',
    borrowerName: '',
    loanType: '',
    goalPurpose: '',
    principalAmount: '',
    interestRate: '',
    dateGiven: '',
    tenure: '',
    outstandingAmount: '',
    status: '',
    remarks: ''
  });

  const [newSubBroker, setNewSubBroker] = useState({
    nameOfCompany: '',
    website: '',
    contactNumber: '',
    emailId: '',
    typeOfInvestment: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    customerCareNumber: '',
    customerCareEmailId: ''
  });

  useEffect(() => {
    trackFeatureUsage('/family/static/basic-details', 'view');
    fetchBasicDetails();
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await staticAPI.getFamilyProfile();
      if (response.data && response.data.length > 0) {
        setFamilyMembers(response.data[0].members || []);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const fetchBasicDetails = async () => {
    try {
      setLoading(true);
      const response = await staticAPI.getBasicDetails();
      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setFormData(prev => ({
          ...prev,
          ...data,
          subBrokers: data.subBrokers || [],
          mutualFundsPortfolio: data.mutualFundsPortfolio || [],
          sharesPortfolio: data.sharesPortfolio || [],
          insurancePortfolio: data.insurancePortfolio || [],
          loansPortfolio: data.loansPortfolio || []
        }));
      } else {
        // Set demo data if no records exist
        setFormData({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-15',
          gender: 'Male',
          bloodGroup: 'B+',
          maritalStatus: 'Married',
          anniversaryDate: '2018-11-20',
          primaryMobile: '+91 98765 43210',
          secondaryMobile: '+91 87654 32109',
          primaryEmail: 'john.doe@email.com',
          secondaryEmail: 'john.doe.work@email.com',
          whatsappNumber: '+91 98765 43210',
          currentAddress: {
            street: '123 Main Street',
            area: 'Andheri',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
            country: 'India'
          },
          permanentAddress: {
            street: '123 Main Street',
            area: 'Andheri',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053',
            country: 'India'
          },
          sameAsCurrent: true,
          familyHead: 'John Doe',
          familyMembers: [
            { name: 'John Doe', relation: 'Self', age: '35', gender: 'Male', occupation: 'Software Engineer', mobile: '+91 98765 43210', email: 'john.doe@email.com' },
            { name: 'Jane Doe', relation: 'Spouse', age: '32', gender: 'Female', occupation: 'Teacher', mobile: '+91 87654 32109', email: 'jane.doe@email.com' },
            { name: 'Johnny Doe', relation: 'Son', age: '8', gender: 'Male', occupation: 'Student', mobile: '', email: '' }
          ],
          totalFamilyMembers: '3',
          dependents: '2',
          occupation: 'Software Engineer',
          companyName: 'Tech Solutions Pvt Ltd',
          designation: 'Senior Developer',
          workEmail: 'john.doe@techsolutions.com',
          workPhone: '+91 22 1234 5678',
          officeAddress: {
            street: '456 Business Park',
            area: 'Andheri',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400053'
          },
          nationality: 'Indian',
          religion: 'Hindu',
          caste: 'General',
          motherTongue: 'Hindi',
          languagesKnown: ['Hindi', 'English', 'Marathi'],
          aadhaarNumber: '1234 5678 9012',
          panNumber: 'ABCDE1234F',
          passportNumber: 'P1234567',
          voterId: 'ABC1234567',
          emergencyContact: {
            name: 'Robert Doe',
            relation: 'Brother',
            mobile: '+91 98765 43212',
            address: '789 Brother Street, Delhi, India'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching basic details:', error);
      // Set demo data if API fails
      setFormData({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
        bloodGroup: 'B+',
        maritalStatus: 'Married',
        anniversaryDate: '2018-11-20',
        primaryMobile: '+91 98765 43210',
        secondaryMobile: '+91 87654 32109',
        primaryEmail: 'john.doe@email.com',
        secondaryEmail: 'john.doe.work@email.com',
        whatsappNumber: '+91 98765 43210',
        currentAddress: {
          street: '123 Main Street',
          area: 'Andheri',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053',
          country: 'India'
        },
        permanentAddress: {
          street: '123 Main Street',
          area: 'Andheri',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053',
          country: 'India'
        },
        sameAsCurrent: true,
        familyHead: 'John Doe',
        familyMembers: [
          { name: 'John Doe', relation: 'Self', age: '35', gender: 'Male', occupation: 'Software Engineer', mobile: '+91 98765 43210', email: 'john.doe@email.com' },
          { name: 'Jane Doe', relation: 'Spouse', age: '32', gender: 'Female', occupation: 'Teacher', mobile: '+91 87654 32109', email: 'jane.doe@email.com' },
          { name: 'Johnny Doe', relation: 'Son', age: '8', gender: 'Male', occupation: 'Student', mobile: '', email: '' }
        ],
        totalFamilyMembers: '3',
        dependents: '2',
        occupation: 'Software Engineer',
        companyName: 'Tech Solutions Pvt Ltd',
        designation: 'Senior Developer',
        workEmail: 'john.doe@techsolutions.com',
        workPhone: '+91 22 1234 5678',
        officeAddress: {
          street: '456 Business Park',
          area: 'Andheri',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053'
        },
        nationality: 'Indian',
        religion: 'Hindu',
        caste: 'General',
        motherTongue: 'Hindi',
        languagesKnown: ['Hindi', 'English', 'Marathi'],
        aadhaarNumber: '1234 5678 9012',
        panNumber: 'ABCDE1234F',
        passportNumber: 'P1234567',
        voterId: 'ABC1234567',
        emergencyContact: {
          name: 'Robert Doe',
          relation: 'Brother',
          mobile: '+91 98765 43212',
          address: '789 Brother Street, Delhi, India'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const handleSameAsCurrentChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsCurrent: checked,
      permanentAddress: checked ? prev.currentAddress : prev.permanentAddress
    }));
  };

  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relation) {
      setFormData(prev => ({
        ...prev,
        familyMembers: [...prev.familyMembers, { ...newFamilyMember }],
        totalFamilyMembers: (parseInt(prev.totalFamilyMembers) + 1).toString()
      }));
      setNewFamilyMember({
        name: '',
        relation: '',
        dateOfBirth: '',
        age: '',
        gender: '',
        bloodGroup: '',
        maritalStatus: '',
        anniversaryDate: '',
        mobile: '',
        email: '',
        occupation: '',
        companyName: '',
        workPhone: '',
        education: '',
        specialization: '',
        hobbies: '',
        healthIssues: '',
        medications: '',
        aadhaarNumber: '',
        panNumber: '',
        passportNumber: '',
        drivingLicense: '',
        additionalInfo: ''
      });
    }
  };

  const removeFamilyMember = (index) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
      totalFamilyMembers: (parseInt(prev.totalFamilyMembers) - 1).toString()
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languagesKnown: prev.languagesKnown.includes(language)
        ? prev.languagesKnown.filter(lang => lang !== language)
        : [...prev.languagesKnown, language]
    }));
  };

  const addMutualFund = () => {
    if (newMutualFund.fundHouse && newMutualFund.mfName) {
      setFormData(prev => ({
        ...prev,
        mutualFunds: [...prev.mutualFunds, { ...newMutualFund }]
      }));
      setNewMutualFund({
        fundHouse: '',
        modeOfHolding: '',
        holdingType: '',
        investorName: '',
        ucc: '',
        mfName: '',
        folioNo: '',
        registeredMobile: '',
        registeredBank: '',
        registeredAddress: '',
        nominee: '',
        customerCareNumber: '',
        customerCareEmail: '',
        rmName: '',
        rmMobile: '',
        rmEmail: '',
        branchAddress: ''
      });
    }
  };

  const removeMutualFund = (index) => {
    setEditingSection('mutualFunds');
    setFormData(prev => ({
      ...prev,
      mutualFunds: prev.mutualFunds.filter((_, i) => i !== index)
    }));
  };

  const editMutualFund = (index) => {
    setEditingSection('mutualFunds');
    const item = formData.mutualFunds[index];
    setNewMutualFund(item);
    setFormData(prev => ({
      ...prev,
      mutualFunds: prev.mutualFunds.filter((_, i) => i !== index)
    }));
  };

  const addShare = () => {
    if (newShare.dematCompany && newShare.scriptName) {
      setFormData(prev => ({
        ...prev,
        shares: [...prev.shares, { ...newShare }]
      }));
      setNewShare({
        dematCompany: '',
        modeOfHolding: '',
        holdingType: '',
        investorName: '',
        tradingId: '',
        dpId: '',
        scriptName: '',
        registeredMobile: '',
        registeredBank: '',
        registeredAddress: '',
        nominee: '',
        customerCareNumber: '',
        customerCareEmail: '',
        rmName: '',
        rmMobile: '',
        rmEmail: '',
        branchAddress: ''
      });
    }
  };

  const removeShare = (index) => {
    setEditingSection('shares');
    setFormData(prev => ({
      ...prev,
      shares: prev.shares.filter((_, i) => i !== index)
    }));
  };

  const editShare = (index) => {
    setEditingSection('shares');
    const item = formData.shares[index];
    setNewShare(item);
    setFormData(prev => ({
      ...prev,
      shares: prev.shares.filter((_, i) => i !== index)
    }));
  };

  const addInsurance = () => {
    if (newInsurance.insuranceCompany && newInsurance.policyName) {
      setFormData(prev => ({
        ...prev,
        insurance: [...prev.insurance, { ...newInsurance }]
      }));
      setNewInsurance({
        insuranceCompany: '',
        insuranceType: '',
        insuranceSubType: '',
        policyPurpose: '',
        insurerName: '',
        policyName: '',
        policyNumber: '',
        registeredMobile: '',
        registeredBank: '',
        registeredAddress: '',
        nominee: '',
        customerCareNumber: '',
        customerCareEmail: '',
        rmName: '',
        rmMobile: '',
        rmEmail: '',
        branchAddress: ''
      });
    }
  };

  const removeInsurance = (index) => {
    setEditingSection('insurance');
    setFormData(prev => ({
      ...prev,
      insurance: prev.insurance.filter((_, i) => i !== index)
    }));
  };

  const editInsurance = (index) => {
    setEditingSection('insurance');
    const item = formData.insurance[index];
    setNewInsurance(item);
    setFormData(prev => ({
      ...prev,
      insurance: prev.insurance.filter((_, i) => i !== index)
    }));
  };

  const addBank = () => {
    if (newBank.bankName && newBank.accountNumber) {
      setFormData(prev => ({
        ...prev,
        banks: [...prev.banks, { ...newBank }]
      }));
      setNewBank({
        bankName: '',
        accountType: '',
        holdingType: '',
        accountHolderName: '',
        customerId: '',
        accountNumber: '',
        ifscCode: '',
        branchAddress: '',
        registeredMobile: '',
        registeredAddress: '',
        nominee: '',
        registeredEmail: '',
        rmName: '',
        rmMobile: '',
        rmEmail: ''
      });
    }
  };

  const removeBank = (index) => {
    setEditingSection('banks');
    setFormData(prev => ({
      ...prev,
      banks: prev.banks.filter((_, i) => i !== index)
    }));
  };

  const editBank = (index) => {
    setEditingSection('banks');
    const item = formData.banks[index];
    setNewBank(item);
    setFormData(prev => ({
      ...prev,
      banks: prev.banks.filter((_, i) => i !== index)
    }));
  };

  const addMobileBill = () => {
    if (newMobileBill.mobileNumber) {
      setFormData(prev => ({
        ...prev,
        mobileBills: [...prev.mobileBills, { ...newMobileBill }]
      }));
      setNewMobileBill({
        mobileNumber: '',
        usedBy: '',
        billGenerationDate: '',
        bestBillPaymentDate: '',
        finalBillPaymentDate: '',
        emailId: '',
        alternateNo: '',
        address: '',
        planNo: '',
        customerNumber: ''
      });
    }
  };

  const removeMobileBill = (index) => {
    setEditingSection('mobileBills');
    setFormData(prev => ({
      ...prev,
      mobileBills: prev.mobileBills.filter((_, i) => i !== index)
    }));
  };

  const editMobileBill = (index) => {
    setEditingSection('mobileBills');
    const item = formData.mobileBills[index];
    setNewMobileBill(item);
    setFormData(prev => ({
      ...prev,
      mobileBills: prev.mobileBills.filter((_, i) => i !== index)
    }));
  };

  const addCard = () => {
    if (newCard.bankName && newCard.cardNumber) {
      setFormData(prev => ({
        ...prev,
        cards: [...prev.cards, { ...newCard }]
      }));
      setNewCard({
        bankName: '',
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        atmPin: '',
        cvv: '',
        url: '',
        userId: '',
        password: '',
        customerCareNumber: '',
        customerCareEmail: '',
        cardType: ''
      });
    }
  };

  const removeCard = (index) => {
    setEditingSection('cards');
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }));
  };

  const editCard = (index) => {
    setEditingSection('cards');
    const item = formData.cards[index];
    setNewCard(item);
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }));
  };

  const addPaymentGateway = () => {
    if (newPaymentGateway.company && newPaymentGateway.companyName) {
      setFormData(prev => ({
        ...prev,
        paymentGateways: [...prev.paymentGateways, { ...newPaymentGateway }]
      }));
      setNewPaymentGateway({
        company: '',
        companyName: '',
        bankName: '',
        accountNumber: '',
        url: '',
        userId: '',
        password: ''
      });
    }
  };

  const removePaymentGateway = (index) => {
    setEditingSection('paymentGateways');
    setFormData(prev => ({
      ...prev,
      paymentGateways: prev.paymentGateways.filter((_, i) => i !== index)
    }));
  };

  const editPaymentGateway = (index) => {
    setEditingSection('paymentGateways');
    const item = formData.paymentGateways[index];
    setNewPaymentGateway(item);
    setFormData(prev => ({
      ...prev,
      paymentGateways: prev.paymentGateways.filter((_, i) => i !== index)
    }));
  };

  const addMutualFundPortfolio = () => {
    if (newMutualFundPortfolio.fundHouse && newMutualFundPortfolio.fundName) {
      setFormData(prev => ({
        ...prev,
        mutualFundsPortfolio: [...prev.mutualFundsPortfolio, { ...newMutualFundPortfolio }]
      }));
      setNewMutualFundPortfolio({
        srNo: '',
        fundHouse: '',
        investorName: '',
        fundName: '',
        goalPurpose: '',
        folioNumber: '',
        dateOfPurchase: '',
        purchaseNAV: '',
        numberOfUnits: '',
        purchaseValue: '',
        currentNAV: '',
        currentValuation: '',
        difference: '',
        percentDifference: ''
      });
    }
  };

  const removeMutualFundPortfolio = (index) => {
    setEditingSection('mutualFundsPortfolio');
    setFormData(prev => ({
      ...prev,
      mutualFundsPortfolio: prev.mutualFundsPortfolio.filter((_, i) => i !== index)
    }));
  };

  const editMutualFundPortfolio = (index) => {
    setEditingSection('mutualFundsPortfolio');
    const item = formData.mutualFundsPortfolio[index];
    setNewMutualFundPortfolio(item);
    setFormData(prev => ({
      ...prev,
      mutualFundsPortfolio: prev.mutualFundsPortfolio.filter((_, i) => i !== index)
    }));
  };

  const addSharePortfolio = () => {
    if (newSharePortfolio.dematCompany && newSharePortfolio.scriptName) {
      setFormData(prev => ({
        ...prev,
        sharesPortfolio: [...prev.sharesPortfolio, { ...newSharePortfolio }]
      }));
      setNewSharePortfolio({
        srNo: '',
        dematCompany: '',
        investorName: '',
        scriptName: '',
        goalPurpose: '',
        dateOfPurchase: '',
        purchaseNAV: '',
        numberOfUnits: '',
        purchaseValue: '',
        currentNAV: '',
        currentValuation: '',
        difference: '',
        percentDifference: ''
      });
    }
  };

  const removeSharePortfolio = (index) => {
    setEditingSection('sharesPortfolio');
    setFormData(prev => ({
      ...prev,
      sharesPortfolio: prev.sharesPortfolio.filter((_, i) => i !== index)
    }));
  };

  const editSharePortfolio = (index) => {
    setEditingSection('sharesPortfolio');
    const item = formData.sharesPortfolio[index];
    setNewSharePortfolio(item);
    setFormData(prev => ({
      ...prev,
      sharesPortfolio: prev.sharesPortfolio.filter((_, i) => i !== index)
    }));
  };

  const addInsurancePortfolio = () => {
    if (newInsurancePortfolio.insuranceCompany && newInsurancePortfolio.policyName) {
      setFormData(prev => ({
        ...prev,
        insurancePortfolio: [...prev.insurancePortfolio, { ...newInsurancePortfolio }]
      }));
      setNewInsurancePortfolio({
        srNo: '',
        insuranceCompany: '',
        insurerName: '',
        policyType: '',
        goalPurpose: '',
        policyName: '',
        policyNumber: '',
        policyStartDate: '',
        premiumMode: '',
        premiumAmount: '',
        lastPremiumPayingDate: '',
        maturityDate: '',
        sumAssured: '',
        nominee: ''
      });
    }
  };

  const removeInsurancePortfolio = (index) => {
    setEditingSection('insurancePortfolio');
    setFormData(prev => ({
      ...prev,
      insurancePortfolio: prev.insurancePortfolio.filter((_, i) => i !== index)
    }));
  };

  const editInsurancePortfolio = (index) => {
    setEditingSection('insurancePortfolio');
    const item = formData.insurancePortfolio[index];
    setNewInsurancePortfolio(item);
    setFormData(prev => ({
      ...prev,
      insurancePortfolio: prev.insurancePortfolio.filter((_, i) => i !== index)
    }));
  };

  const addSubBroker = () => {
    console.log('Attempting to add Sub Broker:', newSubBroker);
    if (newSubBroker.nameOfCompany && newSubBroker.contactNumber) {
      console.log('Validation passed. Adding to list.');
      setFormData(prev => {
        const updated = {
          ...prev,
          subBrokers: [...(prev.subBrokers || []), { ...newSubBroker }]
        };
        console.log('Updated formData:', updated);
        return updated;
      });
      setNewSubBroker({
        nameOfCompany: '',
        website: '',
        contactNumber: '',
        emailId: '',
        typeOfInvestment: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        customerCareNumber: '',
        customerCareEmailId: ''
      });
    } else {
      console.warn('Validation failed: Name of Company and Contact Number are required.');
      alert('Please fill Name of Company and Contact Number');
    }
  };

  const removeSubBroker = (index) => {
    setEditingSection('subBrokers');
    setFormData(prev => ({
      ...prev,
      subBrokers: prev.subBrokers.filter((_, i) => i !== index)
    }));
  };

  const editSubBroker = (index) => {
    setEditingSection('subBrokers');
    const item = formData.subBrokers[index];
    setNewSubBroker(item);
    setFormData(prev => ({
      ...prev,
      subBrokers: prev.subBrokers.filter((_, i) => i !== index)
    }));
  };

  // Section-specific edit handlers
  const toggleSectionEdit = (sectionName) => {
    if (editingSection === sectionName) {
      setEditingSection(null);
    } else {
      setEditingSection(sectionName);
    }
  };

  const isSectionEditing = (sectionName) => {
    return editMode || editingSection === sectionName;
  };

  const handleSectionSave = async (sectionName) => {
    try {
      setLoading(true);
      let response;

      if (formData._id) {
        response = await staticAPI.updateBasicDetails(formData._id, formData);
      } else {
        response = await staticAPI.createBasicDetails(formData);
      }

      const data = response.data;
      setFormData(prev => ({
        ...prev,
        ...data,
        subBrokers: data.subBrokers || prev.subBrokers || [],
        mutualFundsPortfolio: data.mutualFundsPortfolio || prev.mutualFundsPortfolio || [],
        sharesPortfolio: data.sharesPortfolio || prev.sharesPortfolio || [],
        insurancePortfolio: data.insurancePortfolio || prev.insurancePortfolio || []
      }));

      // Trigger sync if subBrokers section was saved
      if (sectionName === 'subBrokers') {
        // Sync contacts
        await syncContactsFromForm(data, 'BasicDetails');
        // Sync customer support
        await syncCustomerSupportFromForm(data, 'BasicDetails');
      }

      setEditingSection(null);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionCancel = (sectionName) => {
    setEditingSection(null);
    fetchBasicDetails();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('=== SAVING BASIC DETAILS ===');
      console.log('Form data:', formData);
      console.log('Has _id:', !!formData._id);

      let response;

      if (formData._id) {
        // Update existing record
        console.log('Updating existing record with ID:', formData._id);
        response = await staticAPI.updateBasicDetails(formData._id, formData);
      } else {
        // Create new record
        console.log('Creating new record');
        response = await staticAPI.createBasicDetails(formData);
      }

      console.log('Save response:', response);
      setFormData(response.data);

      // Trigger sync for all sections
      await syncContactsFromForm(response.data, 'BasicDetails');
      await syncCustomerSupportFromForm(response.data, 'BasicDetails');

      setEditMode(false);
      setEditingSection(null);
      console.log('=== SAVE SUCCESSFUL ===');
    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error saving basic details:', error);
      alert('Failed to save basic details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditingSection(null);
    fetchBasicDetails(); // Reset to original data
  };

  if (loading && !formData.firstName) {
    return (
      <div className="static-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading basic details...</p>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="header-content">
          <div className="header-icon">
            <FiUser />
          </div>
          <div className="header-text">
            <h1 style={{ color: '#0A0A0A' }}>Basic Details</h1>
            <p style={{ color: '#4A5568' }}>Personal and family information management</p>
          </div>
        </div>
        <div className="header-actions">
          {!editMode ? (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              <FiEdit2 /> Edit Details
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-success" onClick={handleSave}>
                <FiSave /> Save
              </button>
              <button className="btn-secondary" onClick={handleCancel}>
                <FiX /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="static-content">
        {/* Sections Removed: Personal Information, Contact Information, Address Information, Family Information, Professional Information, Additional Information, Emergency Contact */}

        {/* Mutual Funds Information */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp className="section-icon" />
              <h3>Mutual Funds Information</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('mutualFunds') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('mutualFunds')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('mutualFunds')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('mutualFunds')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            {formData.mutualFunds && formData.mutualFunds.length > 0 ? (
              <div className="records-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fund Name</th>
                      <th>Fund House</th>
                      <th>Sub Broker Name</th>
                      <th>Folio No.</th>
                      <th>Mode of Holding</th>
                      <th>Holding Type</th>
                      <th>Investor Name</th>
                      <th>UCC</th>
                      <th>Registered Mobile</th>
                      <th>Registered Bank</th>
                      <th>Nominee</th>
                      <th>Customer Care</th>
                      <th>Customer Care Email</th>
                      <th>RM Name</th>
                      <th>RM Mobile</th>
                      <th>RM Email</th>
                      <th>Registered Address</th>
                      <th>Branch Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.mutualFunds.map((fund, index) => (
                      <tr key={index}>
                        <td>{fund.mfName || '-'}</td>
                        <td>{fund.fundHouse || '-'}</td>
                        <td>{fund.subBrokerName || '-'}</td>
                        <td>{fund.folioNo || '-'}</td>
                        <td>{fund.modeOfHolding || '-'}</td>
                        <td>{fund.holdingType || '-'}</td>
                        <td>{fund.investorName || '-'}</td>
                        <td>{fund.ucc || '-'}</td>
                        <td>{fund.registeredMobile || '-'}</td>
                        <td>{fund.registeredBank || '-'}</td>
                        <td>{fund.nominee || '-'}</td>
                        <td>{fund.customerCareNumber || '-'}</td>
                        <td>{fund.customerCareEmail || '-'}</td>
                        <td>{fund.rmName || '-'}</td>
                        <td>{fund.rmMobile || '-'}</td>
                        <td>{fund.rmEmail || '-'}</td>
                        <td>{fund.registeredAddress || '-'}</td>
                        <td>{fund.branchAddress || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editMutualFund(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeMutualFund(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No mutual funds added yet.</p>
            )}

            {isSectionEditing('mutualFunds') && (
              <div className="add-family-member">
                <h5>Add Mutual Fund</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Fund House *</label>
                    <input
                      type="text"
                      value={newMutualFund.fundHouse}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, fundHouse: e.target.value })}
                      placeholder="e.g., HDFC, ICICI, SBI"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mode of Holding</label>
                    <select
                      value={newMutualFund.modeOfHolding}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, modeOfHolding: e.target.value })}
                    >
                      <option value="">Select Mode</option>
                      <option value="Physical">Physical</option>
                      <option value="Demat">Demat</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Joint / Single Holding</label>
                    <select
                      value={newMutualFund.holdingType}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, holdingType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Single">Single</option>
                      <option value="Joint">Joint</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of Investor</label>
                    <select
                      value={newMutualFund.investorName}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, investorName: e.target.value })}
                    >
                      <option value="">Select family member...</option>
                      {familyMembers && familyMembers.map((member, index) => (
                        <option key={index} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>UCC (Unique Client Code)</label>
                    <input
                      type="text"
                      value={newMutualFund.ucc}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, ucc: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newMutualFund.subBrokerName}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of MF *</label>
                    <input
                      type="text"
                      value={newMutualFund.mfName}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, mfName: e.target.value })}
                      placeholder="e.g., HDFC Top 100 Fund"
                    />
                  </div>
                  <div className="form-group">
                    <label>Folio No.</label>
                    <input
                      type="text"
                      value={newMutualFund.folioNo}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, folioNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Mobile Number</label>
                    <input
                      type="tel"
                      value={newMutualFund.registeredMobile}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, registeredMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Bank</label>
                    <input
                      type="text"
                      value={newMutualFund.registeredBank}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, registeredBank: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Registered Address</label>
                    <textarea
                      value={newMutualFund.registeredAddress}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, registeredAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nominee</label>
                    <input
                      type="text"
                      value={newMutualFund.nominee}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, nominee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Number</label>
                    <input
                      type="tel"
                      value={newMutualFund.customerCareNumber}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, customerCareNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Email Id</label>
                    <input
                      type="email"
                      value={newMutualFund.customerCareEmail}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, customerCareEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Name</label>
                    <input
                      type="text"
                      value={newMutualFund.rmName}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, rmName: e.target.value })}
                      placeholder="Relationship Manager Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Mobile No.</label>
                    <input
                      type="tel"
                      value={newMutualFund.rmMobile}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, rmMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Email Id</label>
                    <input
                      type="email"
                      value={newMutualFund.rmEmail}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, rmEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Branch Address</label>
                    <textarea
                      value={newMutualFund.branchAddress}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, branchAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newMutualFund.goalPurpose}
                      onChange={(e) => setNewMutualFund({ ...newMutualFund, goalPurpose: e.target.value })}
                      placeholder="e.g., Retirement, Children's Education, Wealth Creation"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addMutualFund}>
                  <FiPlus /> Add Mutual Fund
                </button>
              </div>
            )}
          </div>
        </div>




        {/* Shares Information */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp className="section-icon" />
              <h3>Shares Information</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('shares') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('shares')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('shares')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('shares')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.shares && formData.shares.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Script Name</th>
                      <th>Demat Company</th>
                      <th>Sub Broker Name</th>
                      <th>Trading ID</th>
                      <th>DP ID</th>
                      <th>Mode of Holding</th>
                      <th>Holding Type</th>
                      <th>Investor Name</th>
                      <th>Registered Mobile</th>
                      <th>Registered Bank</th>
                      <th>Nominee</th>
                      <th>Customer Care</th>
                      <th>Customer Care Email</th>
                      <th>RM Name</th>
                      <th>RM Mobile</th>
                      <th>RM Email</th>
                      <th>Registered Address</th>
                      <th>Branch Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.shares.map((share, index) => (
                      <tr key={index}>
                        <td>{share.scriptName || '-'}</td>
                        <td>{share.dematCompany || '-'}</td>
                        <td>{share.subBrokerName || '-'}</td>
                        <td>{share.tradingId || '-'}</td>
                        <td>{share.dpId || '-'}</td>
                        <td>{share.modeOfHolding || '-'}</td>
                        <td>{share.holdingType || '-'}</td>
                        <td>{share.investorName || '-'}</td>
                        <td>{share.registeredMobile || '-'}</td>
                        <td>{share.registeredBank || '-'}</td>
                        <td>{share.nominee || '-'}</td>
                        <td>{share.customerCareNumber || '-'}</td>
                        <td>{share.customerCareEmail || '-'}</td>
                        <td>{share.rmName || '-'}</td>
                        <td>{share.rmMobile || '-'}</td>
                        <td>{share.rmEmail || '-'}</td>
                        <td>{share.registeredAddress || '-'}</td>
                        <td>{share.branchAddress || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editShare(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeShare(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No shares added yet.</p>
              )}
            </div>

            {isSectionEditing('shares') && (
              <div className="add-family-member">
                <h5>Add Share</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Demat Company *</label>
                    <input
                      type="text"
                      value={newShare.dematCompany}
                      onChange={(e) => setNewShare({ ...newShare, dematCompany: e.target.value })}
                      placeholder="e.g., Zerodha, Upstox, ICICI Direct"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mode of Holding</label>
                    <select
                      value={newShare.modeOfHolding}
                      onChange={(e) => setNewShare({ ...newShare, modeOfHolding: e.target.value })}
                    >
                      <option value="">Select Mode</option>
                      <option value="Physical">Physical</option>
                      <option value="Demat">Demat</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Joint / Single Holding</label>
                    <select
                      value={newShare.holdingType}
                      onChange={(e) => setNewShare({ ...newShare, holdingType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Single">Single</option>
                      <option value="Joint">Joint</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of Investor</label>
                    <select
                      value={newShare.investorName}
                      onChange={(e) => setNewShare({ ...newShare, investorName: e.target.value })}
                    >
                      <option value="">Select family member...</option>
                      {familyMembers && familyMembers.map((member, index) => (
                        <option key={index} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newShare.subBrokerName}
                      onChange={(e) => setNewShare({ ...newShare, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trading Id</label>
                    <input
                      type="text"
                      value={newShare.tradingId}
                      onChange={(e) => setNewShare({ ...newShare, tradingId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>DP ID</label>
                    <input
                      type="text"
                      value={newShare.dpId}
                      onChange={(e) => setNewShare({ ...newShare, dpId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Script *</label>
                    <input
                      type="text"
                      value={newShare.scriptName}
                      onChange={(e) => setNewShare({ ...newShare, scriptName: e.target.value })}
                      placeholder="e.g., Reliance, TCS, Infosys"
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Mobile Number</label>
                    <input
                      type="tel"
                      value={newShare.registeredMobile}
                      onChange={(e) => setNewShare({ ...newShare, registeredMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Bank</label>
                    <input
                      type="text"
                      value={newShare.registeredBank}
                      onChange={(e) => setNewShare({ ...newShare, registeredBank: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Registered Address</label>
                    <textarea
                      value={newShare.registeredAddress}
                      onChange={(e) => setNewShare({ ...newShare, registeredAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nominee</label>
                    <input
                      type="text"
                      value={newShare.nominee}
                      onChange={(e) => setNewShare({ ...newShare, nominee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Number</label>
                    <input
                      type="tel"
                      value={newShare.customerCareNumber}
                      onChange={(e) => setNewShare({ ...newShare, customerCareNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Email Id</label>
                    <input
                      type="email"
                      value={newShare.customerCareEmail}
                      onChange={(e) => setNewShare({ ...newShare, customerCareEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Name</label>
                    <input
                      type="text"
                      value={newShare.rmName}
                      onChange={(e) => setNewShare({ ...newShare, rmName: e.target.value })}
                      placeholder="Relationship Manager Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Mobile No.</label>
                    <input
                      type="tel"
                      value={newShare.rmMobile}
                      onChange={(e) => setNewShare({ ...newShare, rmMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Email Id</label>
                    <input
                      type="email"
                      value={newShare.rmEmail}
                      onChange={(e) => setNewShare({ ...newShare, rmEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Branch Address</label>
                    <textarea
                      value={newShare.branchAddress}
                      onChange={(e) => setNewShare({ ...newShare, branchAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newShare.goalPurpose}
                      onChange={(e) => setNewShare({ ...newShare, goalPurpose: e.target.value })}
                      placeholder="e.g., Long-term Investment, Trading, Dividend Income"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addShare}>
                  <FiPlus /> Add Share
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Insurance Information */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiHome className="section-icon" />
              <h3>Insurance Information</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('insurance') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('insurance')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('insurance')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('insurance')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.insurance && formData.insurance.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Policy Name</th>
                      <th>Insurance Company</th>
                      <th>Sub Broker Name</th>
                      <th>Policy Number</th>
                      <th>Type</th>
                      <th>Sub Type</th>
                      <th>Purpose</th>
                      <th>Insurer Name</th>
                      <th>Registered Mobile</th>
                      <th>Registered Bank</th>
                      <th>Nominee</th>
                      <th>Customer Care</th>
                      <th>Customer Care Email</th>
                      <th>RM Name</th>
                      <th>RM Mobile</th>
                      <th>RM Email</th>
                      <th>Registered Address</th>
                      <th>Branch Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.insurance.map((policy, index) => (
                      <tr key={index}>
                        <td>{policy.policyName || '-'}</td>
                        <td>{policy.insuranceCompany || '-'}</td>
                        <td>{policy.subBrokerName || '-'}</td>
                        <td>{policy.policyNumber || '-'}</td>
                        <td>{policy.insuranceType || '-'}</td>
                        <td>{policy.insuranceSubType || '-'}</td>
                        <td>{policy.policyPurpose || '-'}</td>
                        <td>{policy.insurerName || '-'}</td>
                        <td>{policy.registeredMobile || '-'}</td>
                        <td>{policy.registeredBank || '-'}</td>
                        <td>{policy.nominee || '-'}</td>
                        <td>{policy.customerCareNumber || '-'}</td>
                        <td>{policy.customerCareEmail || '-'}</td>
                        <td>{policy.rmName || '-'}</td>
                        <td>{policy.rmMobile || '-'}</td>
                        <td>{policy.rmEmail || '-'}</td>
                        <td>{policy.registeredAddress || '-'}</td>
                        <td>{policy.branchAddress || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editInsurance(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeInsurance(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No insurance policies added yet.</p>
              )}
            </div>

            {isSectionEditing('insurance') && (
              <div className="add-family-member">
                <h5>Add Insurance Policy</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Insurance Company *</label>
                    <input
                      type="text"
                      value={newInsurance.insuranceCompany}
                      onChange={(e) => setNewInsurance({ ...newInsurance, insuranceCompany: e.target.value })}
                      placeholder="e.g., LIC, HDFC Life, SBI Life"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type of Insurance</label>
                    <select
                      value={newInsurance.insuranceType}
                      onChange={(e) => setNewInsurance({ ...newInsurance, insuranceType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Life">Life</option>
                      <option value="Health">Health</option>
                      <option value="Motor">Motor</option>
                      <option value="Property">Property</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sub Type of Insurance</label>
                    <input
                      type="text"
                      value={newInsurance.insuranceSubType}
                      onChange={(e) => setNewInsurance({ ...newInsurance, insuranceSubType: e.target.value })}
                      placeholder="e.g., Term, Endowment, ULIP"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newInsurance.subBrokerName}
                      onChange={(e) => setNewInsurance({ ...newInsurance, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Purpose of Policy</label>
                    <input
                      type="text"
                      value={newInsurance.policyPurpose}
                      onChange={(e) => setNewInsurance({ ...newInsurance, policyPurpose: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Insurer</label>
                    <input
                      type="text"
                      value={newInsurance.insurerName}
                      onChange={(e) => setNewInsurance({ ...newInsurance, insurerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Policy *</label>
                    <input
                      type="text"
                      value={newInsurance.policyName}
                      onChange={(e) => setNewInsurance({ ...newInsurance, policyName: e.target.value })}
                      placeholder="e.g., Jeevan Anand, Max Bupa"
                    />
                  </div>
                  <div className="form-group">
                    <label>Policy Number</label>
                    <input
                      type="text"
                      value={newInsurance.policyNumber}
                      onChange={(e) => setNewInsurance({ ...newInsurance, policyNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Mobile Number</label>
                    <input
                      type="tel"
                      value={newInsurance.registeredMobile}
                      onChange={(e) => setNewInsurance({ ...newInsurance, registeredMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Bank</label>
                    <input
                      type="text"
                      value={newInsurance.registeredBank}
                      onChange={(e) => setNewInsurance({ ...newInsurance, registeredBank: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Registered Address</label>
                    <textarea
                      value={newInsurance.registeredAddress}
                      onChange={(e) => setNewInsurance({ ...newInsurance, registeredAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nominee</label>
                    <input
                      type="text"
                      value={newInsurance.nominee}
                      onChange={(e) => setNewInsurance({ ...newInsurance, nominee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Number</label>
                    <input
                      type="tel"
                      value={newInsurance.customerCareNumber}
                      onChange={(e) => setNewInsurance({ ...newInsurance, customerCareNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Email Id</label>
                    <input
                      type="email"
                      value={newInsurance.customerCareEmail}
                      onChange={(e) => setNewInsurance({ ...newInsurance, customerCareEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Name</label>
                    <input
                      type="text"
                      value={newInsurance.rmName}
                      onChange={(e) => setNewInsurance({ ...newInsurance, rmName: e.target.value })}
                      placeholder="Relationship Manager Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Mobile No.</label>
                    <input
                      type="tel"
                      value={newInsurance.rmMobile}
                      onChange={(e) => setNewInsurance({ ...newInsurance, rmMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Email Id</label>
                    <input
                      type="email"
                      value={newInsurance.rmEmail}
                      onChange={(e) => setNewInsurance({ ...newInsurance, rmEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Branch Address</label>
                    <textarea
                      value={newInsurance.branchAddress}
                      onChange={(e) => setNewInsurance({ ...newInsurance, branchAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newInsurance.goalPurpose}
                      onChange={(e) => setNewInsurance({ ...newInsurance, goalPurpose: e.target.value })}
                      placeholder="e.g., Life Coverage, Health Protection, Investment, Tax Saving"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addInsurance}>
                  <FiPlus /> Add Insurance Policy
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Bank Information */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiBriefcase className="section-icon" />
              <h3>Bank Accounts Information</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('banks') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('banks')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('banks')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('banks')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.banks && formData.banks.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Bank Name</th>
                      <th>Account Number</th>
                      <th>Account Type</th>
                      <th>IFSC Code</th>
                      <th>Holding Type</th>
                      <th>Account Holder</th>
                      <th>Customer ID</th>
                      <th>Registered Mobile</th>
                      <th>Registered Email</th>
                      <th>Nominee</th>
                      <th>RM Name</th>
                      <th>RM Mobile</th>
                      <th>RM Email</th>
                      <th>Registered Address</th>
                      <th>Branch Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.banks.map((bank, index) => (
                      <tr key={index}>
                        <td>{bank.bankName || '-'}</td>
                        <td>{bank.accountNumber || '-'}</td>
                        <td>{bank.accountType || '-'}</td>
                        <td>{bank.ifscCode || '-'}</td>
                        <td>{bank.holdingType || '-'}</td>
                        <td>{bank.accountHolderName || '-'}</td>
                        <td>{bank.customerId || '-'}</td>
                        <td>{bank.registeredMobile || '-'}</td>
                        <td>{bank.registeredEmail || '-'}</td>
                        <td>{bank.nominee || '-'}</td>
                        <td>{bank.rmName || '-'}</td>
                        <td>{bank.rmMobile || '-'}</td>
                        <td>{bank.rmEmail || '-'}</td>
                        <td>{bank.registeredAddress || '-'}</td>
                        <td>{bank.branchAddress || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editBank(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeBank(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No bank accounts added yet.</p>
              )}
            </div>

            {isSectionEditing('banks') && (
              <div className="add-family-member">
                <h5>Add Bank Account</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name of Bank *</label>
                    <input
                      type="text"
                      value={newBank.bankName}
                      onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                      placeholder="e.g., HDFC Bank, SBI, ICICI"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type of Account</label>
                    <select
                      value={newBank.accountType}
                      onChange={(e) => setNewBank({ ...newBank, accountType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                      <option value="Recurring Deposit">Recurring Deposit</option>
                      <option value="NRI">NRI</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Joint / Single Holding</label>
                    <select
                      value={newBank.holdingType}
                      onChange={(e) => setNewBank({ ...newBank, holdingType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Single">Single</option>
                      <option value="Joint">Joint</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of Account Holder</label>
                    <input
                      type="text"
                      value={newBank.accountHolderName}
                      onChange={(e) => setNewBank({ ...newBank, accountHolderName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer ID</label>
                    <input
                      type="text"
                      value={newBank.customerId}
                      onChange={(e) => setNewBank({ ...newBank, customerId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number *</label>
                    <input
                      type="text"
                      value={newBank.accountNumber}
                      onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      value={newBank.ifscCode}
                      onChange={(e) => setNewBank({ ...newBank, ifscCode: e.target.value })}
                      placeholder="e.g., HDFC0001234"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Branch Address</label>
                    <textarea
                      value={newBank.branchAddress}
                      onChange={(e) => setNewBank({ ...newBank, branchAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Mobile Number</label>
                    <input
                      type="tel"
                      value={newBank.registeredMobile}
                      onChange={(e) => setNewBank({ ...newBank, registeredMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Registered Address</label>
                    <textarea
                      value={newBank.registeredAddress}
                      onChange={(e) => setNewBank({ ...newBank, registeredAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nominee</label>
                    <input
                      type="text"
                      value={newBank.nominee}
                      onChange={(e) => setNewBank({ ...newBank, nominee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Registered Email Id</label>
                    <input
                      type="email"
                      value={newBank.registeredEmail}
                      onChange={(e) => setNewBank({ ...newBank, registeredEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Name</label>
                    <input
                      type="text"
                      value={newBank.rmName}
                      onChange={(e) => setNewBank({ ...newBank, rmName: e.target.value })}
                      placeholder="Relationship Manager Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Mobile No.</label>
                    <input
                      type="tel"
                      value={newBank.rmMobile}
                      onChange={(e) => setNewBank({ ...newBank, rmMobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>RM Email Id</label>
                    <input
                      type="email"
                      value={newBank.rmEmail}
                      onChange={(e) => setNewBank({ ...newBank, rmEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newBank.goalPurpose}
                      onChange={(e) => setNewBank({ ...newBank, goalPurpose: e.target.value })}
                      placeholder="e.g., Salary Account, Savings Account, Investment Account"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addBank}>
                  <FiPlus /> Add Bank Account
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Mobile Bill Information */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiPhone className="section-icon" />
              <h3>Mobile Bill Information</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('mobileBills') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('mobileBills')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('mobileBills')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('mobileBills')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.mobileBills && formData.mobileBills.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Mobile Number</th>
                      <th>Used By</th>
                      <th>Plan No.</th>
                      <th>Customer Number</th>
                      <th>Bill Generation Date</th>
                      <th>Best Payment Date</th>
                      <th>Final Payment Date</th>
                      <th>Email Id</th>
                      <th>Alternate No.</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.mobileBills.map((bill, index) => (
                      <tr key={index}>
                        <td>{bill.mobileNumber || '-'}</td>
                        <td>{bill.usedBy || '-'}</td>
                        <td>{bill.planNo || '-'}</td>
                        <td>{bill.customerNumber || '-'}</td>
                        <td>{bill.billGenerationDate || '-'}</td>
                        <td>{bill.bestBillPaymentDate || '-'}</td>
                        <td>{bill.finalBillPaymentDate || '-'}</td>
                        <td>{bill.emailId || '-'}</td>
                        <td>{bill.alternateNo || '-'}</td>
                        <td>{bill.address || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editMobileBill(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeMobileBill(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No mobile bills added yet.</p>
              )}
            </div>

            {isSectionEditing('mobileBills') && (
              <div className="add-family-member">
                <h5>Add Mobile Bill</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      value={newMobileBill.mobileNumber}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, mobileNumber: e.target.value })}
                      placeholder="e.g., +91 98765 43210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Used by</label>
                    <input
                      type="text"
                      value={newMobileBill.usedBy}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, usedBy: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bill Generation Date</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Day (1-31)"
                      value={newMobileBill.billGenerationDate ? new Date(newMobileBill.billGenerationDate).getDate() : ''}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        if (day >= 1 && day <= 31) {
                          const today = new Date();
                          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          setNewMobileBill({ ...newMobileBill, billGenerationDate: dateStr });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Best Bill Payment Date</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Day (1-31)"
                      value={newMobileBill.bestBillPaymentDate ? new Date(newMobileBill.bestBillPaymentDate).getDate() : ''}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        if (day >= 1 && day <= 31) {
                          const today = new Date();
                          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          setNewMobileBill({ ...newMobileBill, bestBillPaymentDate: dateStr });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Final Bill Payment Date</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Day (1-31)"
                      value={newMobileBill.finalBillPaymentDate ? new Date(newMobileBill.finalBillPaymentDate).getDate() : ''}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        if (day >= 1 && day <= 31) {
                          const today = new Date();
                          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          setNewMobileBill({ ...newMobileBill, finalBillPaymentDate: dateStr });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Id</label>
                    <input
                      type="email"
                      value={newMobileBill.emailId}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, emailId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Alternate No.</label>
                    <input
                      type="tel"
                      value={newMobileBill.alternateNo}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, alternateNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Plan No.</label>
                    <input
                      type="text"
                      value={newMobileBill.planNo}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, planNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Number</label>
                    <input
                      type="text"
                      value={newMobileBill.customerNumber}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, customerNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      value={newMobileBill.address}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newMobileBill.goalPurpose}
                      onChange={(e) => setNewMobileBill({ ...newMobileBill, goalPurpose: e.target.value })}
                      placeholder="e.g., Personal Use, Business Use, Family Connection"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addMobileBill}>
                  <FiPlus /> Add Mobile Bill
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Card Details */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiBriefcase className="section-icon" />
              <h3>Card Details</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('cards') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('cards')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('cards')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('cards')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.cards && formData.cards.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Card Number</th>
                      <th>Card Type</th>
                      <th>Bank Name</th>
                      <th>Card Holder</th>
                      <th>Expiry Date</th>
                      <th>ATM Pin</th>
                      <th>CVV</th>
                      <th>URL</th>
                      <th>User ID</th>
                      <th>Password</th>
                      <th>Customer Care</th>
                      <th>Customer Care Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.cards.map((card, index) => (
                      <tr key={index}>
                        <td>{card.cardNumber || '-'}</td>
                        <td>{card.cardType || '-'}</td>
                        <td>{card.bankName || '-'}</td>
                        <td>{card.cardHolderName || '-'}</td>
                        <td>{card.expiryDate || '-'}</td>
                        <td>{card.atmPin ? '****' : '-'}</td>
                        <td>{card.cvv ? '***' : '-'}</td>
                        <td>{card.url || '-'}</td>
                        <td>{card.userId || '-'}</td>
                        <td>{card.password ? '****' : '-'}</td>
                        <td>{card.customerCareNumber || '-'}</td>
                        <td>{card.customerCareEmail || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editCard(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeCard(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No cards added yet.</p>
              )}
            </div>

            {isSectionEditing('cards') && (
              <div className="add-family-member">
                <h5>Add Card</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Card Type *</label>
                    <select
                      value={newCard.cardType}
                      onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of Bank *</label>
                    <input
                      type="text"
                      value={newCard.bankName}
                      onChange={(e) => setNewCard({ ...newCard, bankName: e.target.value })}
                      placeholder="e.g., HDFC Bank, SBI"
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Card Holder</label>
                    <input
                      type="text"
                      value={newCard.cardHolderName}
                      onChange={(e) => setNewCard({ ...newCard, cardHolderName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                      maxLength={19}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="month"
                      value={newCard.expiryDate}
                      onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>ATM Pin</label>
                    <input
                      type="password"
                      value={newCard.atmPin}
                      onChange={(e) => setNewCard({ ...newCard, atmPin: e.target.value })}
                      maxLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={newCard.url}
                      onChange={(e) => setNewCard({ ...newCard, url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>User Id</label>
                    <input
                      type="text"
                      value={newCard.userId}
                      onChange={(e) => setNewCard({ ...newCard, userId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newCard.password}
                      onChange={(e) => setNewCard({ ...newCard, password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Number</label>
                    <input
                      type="tel"
                      value={newCard.customerCareNumber}
                      onChange={(e) => setNewCard({ ...newCard, customerCareNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Email Id</label>
                    <input
                      type="email"
                      value={newCard.customerCareEmail}
                      onChange={(e) => setNewCard({ ...newCard, customerCareEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newCard.goalPurpose}
                      onChange={(e) => setNewCard({ ...newCard, goalPurpose: e.target.value })}
                      placeholder="e.g., Online Shopping, Travel Booking, Daily Expenses"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addCard}>
                  <FiPlus /> Add Card
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Payment Gateway */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp className="section-icon" />
              <h3>Payment Gateway</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('paymentGateways') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('paymentGateways')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('paymentGateways')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('paymentGateways')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.paymentGateways && formData.paymentGateways.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Name of Company</th>
                      <th>Bank Name</th>
                      <th>Account Number</th>
                      <th>URL</th>
                      <th>User ID</th>
                      <th>Password</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.paymentGateways.map((gateway, index) => (
                      <tr key={index}>
                        <td>{gateway.company || '-'}</td>
                        <td>{gateway.companyName || '-'}</td>
                        <td>{gateway.bankName || '-'}</td>
                        <td>{gateway.accountNumber || '-'}</td>
                        <td>{gateway.url || '-'}</td>
                        <td>{gateway.userId || '-'}</td>
                        <td>{gateway.password ? '****' : '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editPaymentGateway(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removePaymentGateway(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No payment gateways added yet.</p>
              )}
            </div>

            {isSectionEditing('paymentGateways') && (
              <div className="add-family-member">
                <h5>Add Payment Gateway</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      type="text"
                      value={newPaymentGateway.company}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, company: e.target.value })}
                      placeholder="e.g., Razorpay, PayU"
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Company *</label>
                    <input
                      type="text"
                      value={newPaymentGateway.companyName}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Bank</label>
                    <input
                      type="text"
                      value={newPaymentGateway.bankName}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, bankName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      value={newPaymentGateway.accountNumber}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={newPaymentGateway.url}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>User Id</label>
                    <input
                      type="text"
                      value={newPaymentGateway.userId}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, userId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newPaymentGateway.password}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, password: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newPaymentGateway.goalPurpose}
                      onChange={(e) => setNewPaymentGateway({ ...newPaymentGateway, goalPurpose: e.target.value })}
                      placeholder="e.g., Business Transactions, Online Payments, E-commerce"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addPaymentGateway}>
                  <FiPlus /> Add Payment Gateway
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Portfolio Details - Mutual Funds */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp className="section-icon" />
              <h3>Portfolio Details - Mutual Funds</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('mutualFundsPortfolio') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('mutualFundsPortfolio')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('mutualFundsPortfolio')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('mutualFundsPortfolio')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.mutualFundsPortfolio && formData.mutualFundsPortfolio.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Fund Name</th>
                      <th>Fund House</th>
                      <th>Sub Broker Name</th>
                      <th>Folio Number</th>
                      <th>Purchase Date</th>
                      <th>NAV</th>
                      <th>Units</th>
                      <th>Purchase Value</th>
                      <th>Current Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.mutualFundsPortfolio.map((fund, index) => (
                      <tr key={index}>
                        <td>{fund.srNo || '-'}</td>
                        <td>{fund.fundName || '-'}</td>
                        <td>{fund.fundHouse || '-'}</td>
                        <td>{fund.subBrokerName || '-'}</td>
                        <td>{fund.folioNumber || '-'}</td>
                        <td>{fund.dateOfPurchase || '-'}</td>
                        <td>{fund.purchaseNAV || '-'}</td>
                        <td>{fund.numberOfUnits || '-'}</td>
                        <td>{fund.purchaseValue || '-'}</td>
                        <td>{fund.currentValuation || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editMutualFundPortfolio(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeMutualFundPortfolio(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No mutual fund portfolios added yet.</p>
              )}
            </div>

            {isSectionEditing('mutualFundsPortfolio') && (
              <div className="add-family-member">
                <h5>Add Mutual Fund Portfolio</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Sr. No.</label>
                    <input
                      type="text"
                      value={newMutualFundPortfolio.srNo}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, srNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fund House *</label>
                    <input
                      type="text"
                      value={newMutualFundPortfolio.fundHouse}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, fundHouse: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Investor</label>
                    <select
                      value={newMutualFundPortfolio.investorName}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, investorName: e.target.value })}
                    >
                      <option value="">Select family member...</option>
                      {familyMembers && familyMembers.map((member, index) => (
                        <option key={index} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newMutualFundPortfolio.subBrokerName}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newMutualFundPortfolio.subBrokerName}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of Fund *</label>
                    <input
                      type="text"
                      value={newMutualFundPortfolio.fundName}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, fundName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newMutualFundPortfolio.goalPurpose}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, goalPurpose: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Folio Number</label>
                    <input
                      type="text"
                      value={newMutualFundPortfolio.folioNumber}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, folioNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Purchase</label>
                    <input
                      type="date"
                      value={newMutualFundPortfolio.dateOfPurchase}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, dateOfPurchase: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Purchase NAV</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.purchaseNAV}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, purchaseNAV: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Units</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.numberOfUnits}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, numberOfUnits: e.target.value })}
                      step="0.001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Purchase Value</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.purchaseValue}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, purchaseValue: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current NAV</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.currentNAV}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, currentNAV: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Valuation</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.currentValuation}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, currentValuation: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Difference</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.difference}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, difference: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>% Difference</label>
                    <input
                      type="number"
                      value={newMutualFundPortfolio.percentDifference}
                      onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, percentDifference: e.target.value })}
                      step="0.01"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addMutualFundPortfolio}>
                  <FiPlus /> Add Mutual Fund Portfolio
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Portfolio Details - Shares */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp className="section-icon" />
              <h3>Portfolio Details - Shares</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('sharesPortfolio') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('sharesPortfolio')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('sharesPortfolio')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('sharesPortfolio')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.sharesPortfolio && formData.sharesPortfolio.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Script Name</th>
                      <th>Demat Company</th>
                      <th>Sub Broker Name</th>
                      <th>Date of Purchase</th>
                      <th>Purchase NAV</th>
                      <th>Purchase Value</th>
                      <th>Units</th>
                      <th>Market Value</th>
                      <th>Current Value</th>
                      <th>Diff</th>
                      <th>% Diff</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sharesPortfolio.map((share, index) => (
                      <tr key={index}>
                        <td>{share.srNo || '-'}</td>
                        <td>{share.scriptName || '-'}</td>
                        <td>{share.dematCompany || '-'}</td>
                        <td>{share.subBrokerName || '-'}</td>
                        <td>{share.dateOfPurchase || '-'}</td>
                        <td>{share.purchaseNAV || '-'}</td>
                        <td>{share.purchaseValue || '-'}</td>
                        <td>{share.numberOfUnits || '-'}</td>
                        <td>{share.marketValue || '-'}</td>
                        <td>{share.currentValuation || '-'}</td>
                        <td>{share.difference || '-'}</td>
                        <td>{share.percentDifference || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editSharePortfolio(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeSharePortfolio(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No share portfolio added yet.</p>
              )}
            </div>

            {isSectionEditing('sharesPortfolio') && (
              <div className="add-family-member">
                <h5>Add Share Portfolio</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Sr. No.</label>
                    <input
                      type="text"
                      value={newSharePortfolio.srNo}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, srNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Demat Company *</label>
                    <input
                      type="text"
                      value={newSharePortfolio.dematCompany}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, dematCompany: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Investor</label>
                    <select
                      value={newSharePortfolio.investorName}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, investorName: e.target.value })}
                    >
                      <option value="">Select family member...</option>
                      {familyMembers && familyMembers.map((member, index) => (
                        <option key={index} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newSharePortfolio.subBrokerName}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name of Script *</label>
                    <input
                      type="text"
                      value={newSharePortfolio.scriptName}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, scriptName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newSharePortfolio.goalPurpose}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, goalPurpose: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Purchase</label>
                    <input
                      type="date"
                      value={newSharePortfolio.dateOfPurchase}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, dateOfPurchase: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Purchase NAV</label>
                    <input
                      type="number"
                      value={newSharePortfolio.purchaseNAV}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, purchaseNAV: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Units</label>
                    <input
                      type="number"
                      value={newSharePortfolio.numberOfUnits}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, numberOfUnits: e.target.value })}
                      step="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Purchase Value</label>
                    <input
                      type="number"
                      value={newSharePortfolio.purchaseValue}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, purchaseValue: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current NAV</label>
                    <input
                      type="number"
                      value={newSharePortfolio.currentNAV}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, currentNAV: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Valuation</label>
                    <input
                      type="number"
                      value={newSharePortfolio.currentValuation}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, currentValuation: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Difference</label>
                    <input
                      type="number"
                      value={newSharePortfolio.difference}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, difference: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>% Difference</label>
                    <input
                      type="number"
                      value={newSharePortfolio.percentDifference}
                      onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, percentDifference: e.target.value })}
                      step="0.01"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addSharePortfolio}>
                  <FiPlus /> Add Share Portfolio
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Portfolio Details - Insurance */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiHome className="section-icon" />
              <h3>Portfolio Details - Insurance</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('insurancePortfolio') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('insurancePortfolio')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('insurancePortfolio')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('insurancePortfolio')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.insurancePortfolio && formData.insurancePortfolio.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Insurance Company</th>
                      <th>Sub Broker Name</th>
                      <th>Insurer Name</th>
                      <th>Type of Policy</th>
                      <th>Goal/Purpose</th>
                      <th>Policy Number</th>
                      <th>Policy Start Date</th>
                      <th>Premium Mode</th>
                      <th>Premium Amount</th>
                      <th>Last Premium Date</th>
                      <th>Maturity Date</th>
                      <th>Sum Assured</th>
                      <th>Nominee</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.insurancePortfolio.map((policy, index) => (
                      <tr key={index}>
                        <td>{policy.srNo || '-'}</td>
                        <td>{policy.insuranceCompany || '-'}</td>
                        <td>{policy.subBrokerName || '-'}</td>
                        <td>{policy.insurerName || '-'}</td>
                        <td>{policy.policyType || '-'}</td>
                        <td>{policy.goalPurpose || '-'}</td>
                        <td>{policy.policyNumber || '-'}</td>
                        <td>{policy.policyStartDate || '-'}</td>
                        <td>{policy.premiumMode || '-'}</td>
                        <td>{policy.premiumAmount || '-'}</td>
                        <td>{policy.lastPremiumPayingDate || '-'}</td>
                        <td>{policy.maturityDate || '-'}</td>
                        <td>{policy.sumAssured || '-'}</td>
                        <td>{policy.nominee || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editInsurancePortfolio(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeInsurancePortfolio(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No insurance portfolio added yet.</p>
              )}
            </div>

            {isSectionEditing('insurancePortfolio') && (
              <div className="add-family-member">
                <h5>Add Insurance Portfolio</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Sr. No.</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.srNo}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, srNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Insurance Company *</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.insuranceCompany}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, insuranceCompany: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Insurer</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.insurerName}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, insurerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sub Broker Name</label>
                    <select
                      value={newInsurancePortfolio.subBrokerName}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, subBrokerName: e.target.value })}
                    >
                      <option value="">Select Sub Broker</option>
                      {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                        <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type of Policy</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.policyType}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyType: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Goal / Purpose</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.goalPurpose}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, goalPurpose: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name of Policy *</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.policyName}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Policy Number</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.policyNumber}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Policy Start</label>
                    <input
                      type="date"
                      value={newInsurancePortfolio.policyStartDate}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyStartDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mode of Premium</label>
                    <select
                      value={newInsurancePortfolio.premiumMode}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, premiumMode: e.target.value })}
                    >
                      <option value="">Select Mode</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Single Premium">Single Premium</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Premium Amount</label>
                    <input
                      type="number"
                      value={newInsurancePortfolio.premiumAmount}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, premiumAmount: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Premium Paying Date</label>
                    <input
                      type="date"
                      value={newInsurancePortfolio.lastPremiumPayingDate}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, lastPremiumPayingDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Maturity</label>
                    <input
                      type="date"
                      value={newInsurancePortfolio.maturityDate}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, maturityDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sum Assured</label>
                    <input
                      type="number"
                      value={newInsurancePortfolio.sumAssured}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, sumAssured: e.target.value })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nominee</label>
                    <input
                      type="text"
                      value={newInsurancePortfolio.nominee}
                      onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, nominee: e.target.value })}
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addInsurancePortfolio}>
                  <FiPlus /> Add Insurance Portfolio
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub Broker Information */}
        <div className="static-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiBriefcase className="section-icon" />
              <h3>Sub Broker Information</h3>
            </div>
            <div className="section-actions">
              {!isSectionEditing('subBrokers') ? (
                <button className="btn-section-edit" onClick={() => toggleSectionEdit('subBrokers')} title="Edit this section">
                  <FiEdit2 /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-section-save" onClick={() => handleSectionSave('subBrokers')}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-section-cancel" onClick={() => handleSectionCancel('subBrokers')}>
                    <FiX /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="section-content">
            <div className="records-table">
              {formData.subBrokers && formData.subBrokers.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name of Company</th>
                      <th>Website</th>
                      <th>Contact Number</th>
                      <th>Email Id</th>
                      {/* <th>Type of Investment</th> */}
                      <th>Address</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Pin Code</th>
                      <th>Customer Care Number</th>
                      <th>Customer Care Email Id</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.subBrokers.map((broker, index) => (
                      <tr key={index}>
                        <td>{broker.nameOfCompany || '-'}</td>
                        <td>{broker.website || '-'}</td>
                        <td>{broker.contactNumber || '-'}</td>
                        <td>{broker.emailId || '-'}</td>
                        {/* <td>{broker.typeOfInvestment || '-'}</td> */}
                        <td>{broker.address || '-'}</td>
                        <td>{broker.city || '-'}</td>
                        <td>{broker.state || '-'}</td>
                        <td>{broker.pinCode || '-'}</td>
                        <td>{broker.customerCareNumber || '-'}</td>
                        <td>{broker.customerCareEmailId || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => editSubBroker(index)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => removeSubBroker(index)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No sub brokers added yet.</p>
              )}
            </div>

            {isSectionEditing('subBrokers') && (
              <div className="add-family-member">
                <h5>Add Sub Broker</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name of Company *</label>
                    <input
                      type="text"
                      value={newSubBroker.nameOfCompany}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, nameOfCompany: e.target.value })}
                      placeholder="e.g., ABC Financial Services"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={newSubBroker.website}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, website: e.target.value })}
                      placeholder="e.g., https://www.example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      value={newSubBroker.contactNumber}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, contactNumber: e.target.value })}
                      placeholder="e.g., +91 98765 43210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Id</label>
                    <input
                      type="email"
                      value={newSubBroker.emailId}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, emailId: e.target.value })}
                      placeholder="e.g., info@example.com"
                    />
                  </div>
                  {/* <div className="form-group">
                  <label>Type of Investment</label>
                  <select
                    value={newSubBroker.typeOfInvestment}
                    onChange={(e) => setNewSubBroker({ ...newSubBroker, typeOfInvestment: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Mutual Funds">Mutual Funds</option>
                    <option value="Shares">Shares</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Fixed Deposits">Fixed Deposits</option>
                    <option value="Others">Others</option>
                  </select>
                </div> */}
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      value={newSubBroker.address}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, address: e.target.value })}
                      rows={2}
                      placeholder="e.g., 123, Main Street, Area Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={newSubBroker.city}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, city: e.target.value })}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={newSubBroker.state}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, state: e.target.value })}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pin Code</label>
                    <input
                      type="text"
                      value={newSubBroker.pinCode}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, pinCode: e.target.value })}
                      placeholder="e.g., 400001"
                      maxLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Number</label>
                    <input
                      type="tel"
                      value={newSubBroker.customerCareNumber}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, customerCareNumber: e.target.value })}
                      placeholder="e.g., 1800-123-4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Care Email Id</label>
                    <input
                      type="email"
                      value={newSubBroker.customerCareEmailId}
                      onChange={(e) => setNewSubBroker({ ...newSubBroker, customerCareEmailId: e.target.value })}
                      placeholder="e.g., support@example.com"
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addSubBroker}>
                  <FiPlus /> Add Sub Broker
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
