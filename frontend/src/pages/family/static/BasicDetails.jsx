import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiUsers, FiHome, FiBriefcase, FiGlobe, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';

const BasicDetails = () => {
  const [editMode, setEditMode] = useState(false);
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
    insurancePortfolio: []
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
    goalPurpose: ''
  });

  const [newShare, setNewShare] = useState({
    dematCompany: '',
    modeOfHolding: '',
    holdingType: '',
    investorName: '',
    tradingId: '',
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
    goalPurpose: ''
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
    goalPurpose: ''
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
    percentDifference: ''
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
    percentDifference: ''
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
    nominee: ''
  });

  useEffect(() => {
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
        setFormData(response.data[0]);
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
    setFormData(prev => ({
      ...prev,
      insurancePortfolio: prev.insurancePortfolio.filter((_, i) => i !== index)
    }));
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
      setEditMode(false);
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
      <div className="static-header">
        <div className="header-content">
          <div className="header-icon">
            <FiUser />
          </div>
          <div className="header-text">
            <h1>Basic Details</h1>
            <p>Personal and family information management</p>
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
          <div className="section-header">
            <FiTrendingUp className="section-icon" />
            <h3>Mutual Funds Information</h3>
          </div>
          <div className="section-content">
            {formData.mutualFunds && formData.mutualFunds.length > 0 ? (
              <div className="records-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fund Name</th>
                      <th>Fund House</th>
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
                      {editMode && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.mutualFunds.map((fund, index) => (
                      <tr key={index}>
                        <td>{fund.mfName || '-'}</td>
                        <td>{fund.fundHouse || '-'}</td>
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
                        {editMode && (
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn-remove"
                                onClick={() => removeMutualFund(index)}
                              >
                                <FiX />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No mutual funds added yet.</p>
            )}

            {editMode && (
              <div className="add-family-member">
                <h5>Add Mutual Fund</h5>
                <div className="form-grid">
                    <div className="form-group">
                      <label>Fund House *</label>
                      <input
                        type="text"
                        value={newMutualFund.fundHouse}
                        onChange={(e) => setNewMutualFund({...newMutualFund, fundHouse: e.target.value})}
                        placeholder="e.g., HDFC, ICICI, SBI"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mode of Holding</label>
                      <select
                        value={newMutualFund.modeOfHolding}
                        onChange={(e) => setNewMutualFund({...newMutualFund, modeOfHolding: e.target.value})}
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
                        onChange={(e) => setNewMutualFund({...newMutualFund, holdingType: e.target.value})}
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
                        onChange={(e) => setNewMutualFund({...newMutualFund, investorName: e.target.value})}
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
                        onChange={(e) => setNewMutualFund({...newMutualFund, ucc: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of MF *</label>
                      <input
                        type="text"
                        value={newMutualFund.mfName}
                        onChange={(e) => setNewMutualFund({...newMutualFund, mfName: e.target.value})}
                        placeholder="e.g., HDFC Top 100 Fund"
                      />
                    </div>
                    <div className="form-group">
                      <label>Folio No.</label>
                      <input
                        type="text"
                        value={newMutualFund.folioNo}
                        onChange={(e) => setNewMutualFund({...newMutualFund, folioNo: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Mobile Number</label>
                      <input
                        type="tel"
                        value={newMutualFund.registeredMobile}
                        onChange={(e) => setNewMutualFund({...newMutualFund, registeredMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Bank</label>
                      <input
                        type="text"
                        value={newMutualFund.registeredBank}
                        onChange={(e) => setNewMutualFund({...newMutualFund, registeredBank: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Registered Address</label>
                      <textarea
                        value={newMutualFund.registeredAddress}
                        onChange={(e) => setNewMutualFund({...newMutualFund, registeredAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee</label>
                      <input
                        type="text"
                        value={newMutualFund.nominee}
                        onChange={(e) => setNewMutualFund({...newMutualFund, nominee: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Number</label>
                      <input
                        type="tel"
                        value={newMutualFund.customerCareNumber}
                        onChange={(e) => setNewMutualFund({...newMutualFund, customerCareNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Email Id</label>
                      <input
                        type="email"
                        value={newMutualFund.customerCareEmail}
                        onChange={(e) => setNewMutualFund({...newMutualFund, customerCareEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Name</label>
                      <input
                        type="text"
                        value={newMutualFund.rmName}
                        onChange={(e) => setNewMutualFund({...newMutualFund, rmName: e.target.value})}
                        placeholder="Relationship Manager Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Mobile No.</label>
                      <input
                        type="tel"
                        value={newMutualFund.rmMobile}
                        onChange={(e) => setNewMutualFund({...newMutualFund, rmMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Email Id</label>
                      <input
                        type="email"
                        value={newMutualFund.rmEmail}
                        onChange={(e) => setNewMutualFund({...newMutualFund, rmEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Branch Address</label>
                      <textarea
                        value={newMutualFund.branchAddress}
                        onChange={(e) => setNewMutualFund({...newMutualFund, branchAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newMutualFund.goalPurpose}
                        onChange={(e) => setNewMutualFund({...newMutualFund, goalPurpose: e.target.value})}
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
        </div>

        {/* Shares Information */}
        <div className="static-section">
          <div className="section-header">
            <FiTrendingUp className="section-icon" />
            <h3>Shares Information</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.shares && formData.shares.length > 0 ? (
                formData.shares.map((share, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{share.scriptName}</h5>
                        <span className="relation-badge">{share.dematCompany}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Trading ID:</strong> {share.tradingId}</p>
                          <p><strong>Mode of Holding:</strong> {share.modeOfHolding}</p>
                          <p><strong>Holding Type:</strong> {share.holdingType}</p>
                          <p><strong>Investor Name:</strong> {share.investorName}</p>
                          <p><strong>Registered Mobile:</strong> {share.registeredMobile}</p>
                          <p><strong>Registered Bank:</strong> {share.registeredBank}</p>
                          <p><strong>Nominee:</strong> {share.nominee}</p>
                          <p><strong>Customer Care:</strong> {share.customerCareNumber}</p>
                          <p><strong>Customer Care Email:</strong> {share.customerCareEmail}</p>
                          <p><strong>RM Name:</strong> {share.rmName}</p>
                          <p><strong>RM Mobile:</strong> {share.rmMobile}</p>
                          <p><strong>RM Email:</strong> {share.rmEmail}</p>
                        </div>
                        <div className="form-group full-width">
                          <p><strong>Registered Address:</strong> {share.registeredAddress}</p>
                          <p><strong>Branch Address:</strong> {share.branchAddress}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeShare(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No shares added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Share</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Demat Company *</label>
                      <input
                        type="text"
                        value={newShare.dematCompany}
                        onChange={(e) => setNewShare({...newShare, dematCompany: e.target.value})}
                        placeholder="e.g., Zerodha, Upstox, ICICI Direct"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mode of Holding</label>
                      <select
                        value={newShare.modeOfHolding}
                        onChange={(e) => setNewShare({...newShare, modeOfHolding: e.target.value})}
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
                        onChange={(e) => setNewShare({...newShare, holdingType: e.target.value})}
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
                        onChange={(e) => setNewShare({...newShare, investorName: e.target.value})}
                      >
                        <option value="">Select family member...</option>
                        {familyMembers && familyMembers.map((member, index) => (
                          <option key={index} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Trading Id</label>
                      <input
                        type="text"
                        value={newShare.tradingId}
                        onChange={(e) => setNewShare({...newShare, tradingId: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Script *</label>
                      <input
                        type="text"
                        value={newShare.scriptName}
                        onChange={(e) => setNewShare({...newShare, scriptName: e.target.value})}
                        placeholder="e.g., Reliance, TCS, Infosys"
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Mobile Number</label>
                      <input
                        type="tel"
                        value={newShare.registeredMobile}
                        onChange={(e) => setNewShare({...newShare, registeredMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Bank</label>
                      <input
                        type="text"
                        value={newShare.registeredBank}
                        onChange={(e) => setNewShare({...newShare, registeredBank: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Registered Address</label>
                      <textarea
                        value={newShare.registeredAddress}
                        onChange={(e) => setNewShare({...newShare, registeredAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee</label>
                      <input
                        type="text"
                        value={newShare.nominee}
                        onChange={(e) => setNewShare({...newShare, nominee: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Number</label>
                      <input
                        type="tel"
                        value={newShare.customerCareNumber}
                        onChange={(e) => setNewShare({...newShare, customerCareNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Email Id</label>
                      <input
                        type="email"
                        value={newShare.customerCareEmail}
                        onChange={(e) => setNewShare({...newShare, customerCareEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Name</label>
                      <input
                        type="text"
                        value={newShare.rmName}
                        onChange={(e) => setNewShare({...newShare, rmName: e.target.value})}
                        placeholder="Relationship Manager Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Mobile No.</label>
                      <input
                        type="tel"
                        value={newShare.rmMobile}
                        onChange={(e) => setNewShare({...newShare, rmMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Email Id</label>
                      <input
                        type="email"
                        value={newShare.rmEmail}
                        onChange={(e) => setNewShare({...newShare, rmEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Branch Address</label>
                      <textarea
                        value={newShare.branchAddress}
                        onChange={(e) => setNewShare({...newShare, branchAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newShare.goalPurpose}
                        onChange={(e) => setNewShare({...newShare, goalPurpose: e.target.value})}
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
        </div>

        {/* Insurance Information */}
        <div className="static-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>Insurance Information</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.insurance && formData.insurance.length > 0 ? (
                formData.insurance.map((policy, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{policy.policyName}</h5>
                        <span className="relation-badge">{policy.insuranceCompany}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Policy Number:</strong> {policy.policyNumber}</p>
                          <p><strong>Type:</strong> {policy.insuranceType}</p>
                          <p><strong>Sub Type:</strong> {policy.insuranceSubType}</p>
                          <p><strong>Purpose:</strong> {policy.policyPurpose}</p>
                          <p><strong>Insurer Name:</strong> {policy.insurerName}</p>
                          <p><strong>Registered Mobile:</strong> {policy.registeredMobile}</p>
                          <p><strong>Registered Bank:</strong> {policy.registeredBank}</p>
                          <p><strong>Nominee:</strong> {policy.nominee}</p>
                          <p><strong>Customer Care:</strong> {policy.customerCareNumber}</p>
                          <p><strong>Customer Care Email:</strong> {policy.customerCareEmail}</p>
                          <p><strong>RM Name:</strong> {policy.rmName}</p>
                          <p><strong>RM Mobile:</strong> {policy.rmMobile}</p>
                          <p><strong>RM Email:</strong> {policy.rmEmail}</p>
                        </div>
                        <div className="form-group full-width">
                          <p><strong>Registered Address:</strong> {policy.registeredAddress}</p>
                          <p><strong>Branch Address:</strong> {policy.branchAddress}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeInsurance(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No insurance policies added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Insurance Policy</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Insurance Company *</label>
                      <input
                        type="text"
                        value={newInsurance.insuranceCompany}
                        onChange={(e) => setNewInsurance({...newInsurance, insuranceCompany: e.target.value})}
                        placeholder="e.g., LIC, HDFC Life, SBI Life"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type of Insurance</label>
                      <select
                        value={newInsurance.insuranceType}
                        onChange={(e) => setNewInsurance({...newInsurance, insuranceType: e.target.value})}
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
                        onChange={(e) => setNewInsurance({...newInsurance, insuranceSubType: e.target.value})}
                        placeholder="e.g., Term, Endowment, ULIP"
                      />
                    </div>
                    <div className="form-group">
                      <label>Purpose of Policy</label>
                      <input
                        type="text"
                        value={newInsurance.policyPurpose}
                        onChange={(e) => setNewInsurance({...newInsurance, policyPurpose: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Insurer</label>
                      <input
                        type="text"
                        value={newInsurance.insurerName}
                        onChange={(e) => setNewInsurance({...newInsurance, insurerName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Policy *</label>
                      <input
                        type="text"
                        value={newInsurance.policyName}
                        onChange={(e) => setNewInsurance({...newInsurance, policyName: e.target.value})}
                        placeholder="e.g., Jeevan Anand, Max Bupa"
                      />
                    </div>
                    <div className="form-group">
                      <label>Policy Number</label>
                      <input
                        type="text"
                        value={newInsurance.policyNumber}
                        onChange={(e) => setNewInsurance({...newInsurance, policyNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Mobile Number</label>
                      <input
                        type="tel"
                        value={newInsurance.registeredMobile}
                        onChange={(e) => setNewInsurance({...newInsurance, registeredMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Bank</label>
                      <input
                        type="text"
                        value={newInsurance.registeredBank}
                        onChange={(e) => setNewInsurance({...newInsurance, registeredBank: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Registered Address</label>
                      <textarea
                        value={newInsurance.registeredAddress}
                        onChange={(e) => setNewInsurance({...newInsurance, registeredAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee</label>
                      <input
                        type="text"
                        value={newInsurance.nominee}
                        onChange={(e) => setNewInsurance({...newInsurance, nominee: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Number</label>
                      <input
                        type="tel"
                        value={newInsurance.customerCareNumber}
                        onChange={(e) => setNewInsurance({...newInsurance, customerCareNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Email Id</label>
                      <input
                        type="email"
                        value={newInsurance.customerCareEmail}
                        onChange={(e) => setNewInsurance({...newInsurance, customerCareEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Name</label>
                      <input
                        type="text"
                        value={newInsurance.rmName}
                        onChange={(e) => setNewInsurance({...newInsurance, rmName: e.target.value})}
                        placeholder="Relationship Manager Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Mobile No.</label>
                      <input
                        type="tel"
                        value={newInsurance.rmMobile}
                        onChange={(e) => setNewInsurance({...newInsurance, rmMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Email Id</label>
                      <input
                        type="email"
                        value={newInsurance.rmEmail}
                        onChange={(e) => setNewInsurance({...newInsurance, rmEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Branch Address</label>
                      <textarea
                        value={newInsurance.branchAddress}
                        onChange={(e) => setNewInsurance({...newInsurance, branchAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newInsurance.goalPurpose}
                        onChange={(e) => setNewInsurance({...newInsurance, goalPurpose: e.target.value})}
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
        </div>

        {/* Bank Information */}
        <div className="static-section">
          <div className="section-header">
            <FiBriefcase className="section-icon" />
            <h3>Bank Accounts Information</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.banks && formData.banks.length > 0 ? (
                formData.banks.map((bank, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{bank.bankName}</h5>
                        <span className="relation-badge">{bank.accountType}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Account Number:</strong> {bank.accountNumber}</p>
                          <p><strong>IFSC Code:</strong> {bank.ifscCode}</p>
                          <p><strong>Holding Type:</strong> {bank.holdingType}</p>
                          <p><strong>Account Holder:</strong> {bank.accountHolderName}</p>
                          <p><strong>Customer ID:</strong> {bank.customerId}</p>
                          <p><strong>Registered Mobile:</strong> {bank.registeredMobile}</p>
                          <p><strong>Registered Email:</strong> {bank.registeredEmail}</p>
                          <p><strong>Nominee:</strong> {bank.nominee}</p>
                          <p><strong>RM Name:</strong> {bank.rmName}</p>
                          <p><strong>RM Mobile:</strong> {bank.rmMobile}</p>
                          <p><strong>RM Email:</strong> {bank.rmEmail}</p>
                        </div>
                        <div className="form-group full-width">
                          <p><strong>Registered Address:</strong> {bank.registeredAddress}</p>
                          <p><strong>Branch Address:</strong> {bank.branchAddress}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeBank(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No bank accounts added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Bank Account</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name of Bank *</label>
                      <input
                        type="text"
                        value={newBank.bankName}
                        onChange={(e) => setNewBank({...newBank, bankName: e.target.value})}
                        placeholder="e.g., HDFC Bank, SBI, ICICI"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type of Account</label>
                      <select
                        value={newBank.accountType}
                        onChange={(e) => setNewBank({...newBank, accountType: e.target.value})}
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
                        onChange={(e) => setNewBank({...newBank, holdingType: e.target.value})}
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
                        onChange={(e) => setNewBank({...newBank, accountHolderName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer ID</label>
                      <input
                        type="text"
                        value={newBank.customerId}
                        onChange={(e) => setNewBank({...newBank, customerId: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Number *</label>
                      <input
                        type="text"
                        value={newBank.accountNumber}
                        onChange={(e) => setNewBank({...newBank, accountNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        value={newBank.ifscCode}
                        onChange={(e) => setNewBank({...newBank, ifscCode: e.target.value})}
                        placeholder="e.g., HDFC0001234"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Branch Address</label>
                      <textarea
                        value={newBank.branchAddress}
                        onChange={(e) => setNewBank({...newBank, branchAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Mobile Number</label>
                      <input
                        type="tel"
                        value={newBank.registeredMobile}
                        onChange={(e) => setNewBank({...newBank, registeredMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Registered Address</label>
                      <textarea
                        value={newBank.registeredAddress}
                        onChange={(e) => setNewBank({...newBank, registeredAddress: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee</label>
                      <input
                        type="text"
                        value={newBank.nominee}
                        onChange={(e) => setNewBank({...newBank, nominee: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Registered Email Id</label>
                      <input
                        type="email"
                        value={newBank.registeredEmail}
                        onChange={(e) => setNewBank({...newBank, registeredEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Name</label>
                      <input
                        type="text"
                        value={newBank.rmName}
                        onChange={(e) => setNewBank({...newBank, rmName: e.target.value})}
                        placeholder="Relationship Manager Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Mobile No.</label>
                      <input
                        type="tel"
                        value={newBank.rmMobile}
                        onChange={(e) => setNewBank({...newBank, rmMobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>RM Email Id</label>
                      <input
                        type="email"
                        value={newBank.rmEmail}
                        onChange={(e) => setNewBank({...newBank, rmEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newBank.goalPurpose}
                        onChange={(e) => setNewBank({...newBank, goalPurpose: e.target.value})}
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
        </div>

        {/* Mobile Bill Information */}
        <div className="static-section">
          <div className="section-header">
            <FiPhone className="section-icon" />
            <h3>Mobile Bill Information</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.mobileBills && formData.mobileBills.length > 0 ? (
                formData.mobileBills.map((bill, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{bill.mobileNumber}</h5>
                        <span className="relation-badge">{bill.usedBy}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Plan No.:</strong> {bill.planNo}</p>
                          <p><strong>Customer Number:</strong> {bill.customerNumber}</p>
                          <p><strong>Bill Generation Date:</strong> {bill.billGenerationDate}</p>
                          <p><strong>Best Bill Payment Date:</strong> {bill.bestBillPaymentDate}</p>
                          <p><strong>Final Bill Payment Date:</strong> {bill.finalBillPaymentDate}</p>
                          <p><strong>Email Id:</strong> {bill.emailId}</p>
                          <p><strong>Alternate No.:</strong> {bill.alternateNo}</p>
                        </div>
                        <div className="form-group full-width">
                          <p><strong>Address:</strong> {bill.address}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeMobileBill(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No mobile bills added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Mobile Bill</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        value={newMobileBill.mobileNumber}
                        onChange={(e) => setNewMobileBill({...newMobileBill, mobileNumber: e.target.value})}
                        placeholder="e.g., +91 98765 43210"
                      />
                    </div>
                    <div className="form-group">
                      <label>Used by</label>
                      <input
                        type="text"
                        value={newMobileBill.usedBy}
                        onChange={(e) => setNewMobileBill({...newMobileBill, usedBy: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bill Generation Date</label>
                      <input
                        type="date"
                        value={newMobileBill.billGenerationDate}
                        onChange={(e) => setNewMobileBill({...newMobileBill, billGenerationDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Best Bill Payment Date</label>
                      <input
                        type="date"
                        value={newMobileBill.bestBillPaymentDate}
                        onChange={(e) => setNewMobileBill({...newMobileBill, bestBillPaymentDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Final Bill Payment Date</label>
                      <input
                        type="date"
                        value={newMobileBill.finalBillPaymentDate}
                        onChange={(e) => setNewMobileBill({...newMobileBill, finalBillPaymentDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Id</label>
                      <input
                        type="email"
                        value={newMobileBill.emailId}
                        onChange={(e) => setNewMobileBill({...newMobileBill, emailId: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Alternate No.</label>
                      <input
                        type="tel"
                        value={newMobileBill.alternateNo}
                        onChange={(e) => setNewMobileBill({...newMobileBill, alternateNo: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Plan No.</label>
                      <input
                        type="text"
                        value={newMobileBill.planNo}
                        onChange={(e) => setNewMobileBill({...newMobileBill, planNo: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Number</label>
                      <input
                        type="text"
                        value={newMobileBill.customerNumber}
                        onChange={(e) => setNewMobileBill({...newMobileBill, customerNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        value={newMobileBill.address}
                        onChange={(e) => setNewMobileBill({...newMobileBill, address: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newMobileBill.goalPurpose}
                        onChange={(e) => setNewMobileBill({...newMobileBill, goalPurpose: e.target.value})}
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
        </div>

        {/* Card Details */}
        <div className="static-section">
          <div className="section-header">
            <FiBriefcase className="section-icon" />
            <h3>Card Details</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.cards && formData.cards.length > 0 ? (
                formData.cards.map((card, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{card.cardNumber}</h5>
                        <span className="relation-badge">{card.cardType}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Bank Name:</strong> {card.bankName}</p>
                          <p><strong>Card Holder:</strong> {card.cardHolderName}</p>
                          <p><strong>Expiry Date:</strong> {card.expiryDate}</p>
                          <p><strong>ATM Pin:</strong> {card.atmPin}</p>
                          <p><strong>CVV:</strong> {card.cvv}</p>
                          <p><strong>URL:</strong> {card.url}</p>
                          <p><strong>User ID:</strong> {card.userId}</p>
                          <p><strong>Password:</strong> {card.password}</p>
                          <p><strong>Customer Care:</strong> {card.customerCareNumber}</p>
                          <p><strong>Customer Care Email:</strong> {card.customerCareEmail}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeCard(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No cards added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Card</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Card Type *</label>
                      <select
                        value={newCard.cardType}
                        onChange={(e) => setNewCard({...newCard, cardType: e.target.value})}
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
                        onChange={(e) => setNewCard({...newCard, bankName: e.target.value})}
                        placeholder="e.g., HDFC Bank, SBI"
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Card Holder</label>
                      <input
                        type="text"
                        value={newCard.cardHolderName}
                        onChange={(e) => setNewCard({...newCard, cardHolderName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                        maxLength={19}
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="month"
                        value={newCard.expiryDate}
                        onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>ATM Pin</label>
                      <input
                        type="password"
                        value={newCard.atmPin}
                        onChange={(e) => setNewCard({...newCard, atmPin: e.target.value})}
                        maxLength={6}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                        maxLength={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>URL</label>
                      <input
                        type="url"
                        value={newCard.url}
                        onChange={(e) => setNewCard({...newCard, url: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>User Id</label>
                      <input
                        type="text"
                        value={newCard.userId}
                        onChange={(e) => setNewCard({...newCard, userId: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={newCard.password}
                        onChange={(e) => setNewCard({...newCard, password: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Number</label>
                      <input
                        type="tel"
                        value={newCard.customerCareNumber}
                        onChange={(e) => setNewCard({...newCard, customerCareNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Care Email Id</label>
                      <input
                        type="email"
                        value={newCard.customerCareEmail}
                        onChange={(e) => setNewCard({...newCard, customerCareEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newCard.goalPurpose}
                        onChange={(e) => setNewCard({...newCard, goalPurpose: e.target.value})}
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
        </div>

        {/* Payment Gateway */}
        <div className="static-section">
          <div className="section-header">
            <FiTrendingUp className="section-icon" />
            <h3>Payment Gateway</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.paymentGateways && formData.paymentGateways.length > 0 ? (
                formData.paymentGateways.map((gateway, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{gateway.companyName}</h5>
                        <span className="relation-badge">{gateway.company}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Bank Name:</strong> {gateway.bankName}</p>
                          <p><strong>Account Number:</strong> {gateway.accountNumber}</p>
                          <p><strong>URL:</strong> {gateway.url}</p>
                          <p><strong>User ID:</strong> {gateway.userId}</p>
                          <p><strong>Password:</strong> {gateway.password}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removePaymentGateway(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No payment gateways added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Payment Gateway</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Company *</label>
                      <input
                        type="text"
                        value={newPaymentGateway.company}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, company: e.target.value})}
                        placeholder="e.g., Razorpay, PayU"
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Company *</label>
                      <input
                        type="text"
                        value={newPaymentGateway.companyName}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, companyName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Bank</label>
                      <input
                        type="text"
                        value={newPaymentGateway.bankName}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, bankName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={newPaymentGateway.accountNumber}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, accountNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>URL</label>
                      <input
                        type="url"
                        value={newPaymentGateway.url}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, url: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>User Id</label>
                      <input
                        type="text"
                        value={newPaymentGateway.userId}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, userId: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={newPaymentGateway.password}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, password: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newPaymentGateway.goalPurpose}
                        onChange={(e) => setNewPaymentGateway({...newPaymentGateway, goalPurpose: e.target.value})}
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
        </div>

        {/* Portfolio Details - Mutual Funds */}
        <div className="static-section">
          <div className="section-header">
            <FiTrendingUp className="section-icon" />
            <h3>Portfolio Details - Mutual Funds</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.mutualFundsPortfolio && formData.mutualFundsPortfolio.length > 0 ? (
                formData.mutualFundsPortfolio.map((fund, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{fund.fundName}</h5>
                        <span className="relation-badge">{fund.fundHouse}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Sr. No.:</strong> {fund.srNo}</p>
                          <p><strong>Investor Name:</strong> {fund.investorName}</p>
                          <p><strong>Goal/Purpose:</strong> {fund.goalPurpose}</p>
                          <p><strong>Folio Number:</strong> {fund.folioNumber}</p>
                          <p><strong>Date of Purchase:</strong> {fund.dateOfPurchase}</p>
                          <p><strong>Purchase NAV:</strong> {fund.purchaseNAV}</p>
                          <p><strong>Number of Units:</strong> {fund.numberOfUnits}</p>
                          <p><strong>Purchase Value:</strong> {fund.purchaseValue}</p>
                          <p><strong>Current NAV:</strong> {fund.currentNAV}</p>
                          <p><strong>Current Valuation:</strong> {fund.currentValuation}</p>
                          <p><strong>Difference:</strong> {fund.difference}</p>
                          <p><strong>% Difference:</strong> {fund.percentDifference}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeMutualFundPortfolio(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No mutual fund portfolio added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Mutual Fund Portfolio</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sr. No.</label>
                      <input
                        type="text"
                        value={newMutualFundPortfolio.srNo}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, srNo: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fund House *</label>
                      <input
                        type="text"
                        value={newMutualFundPortfolio.fundHouse}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, fundHouse: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Investor</label>
                      <select
                        value={newMutualFundPortfolio.investorName}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, investorName: e.target.value})}
                      >
                        <option value="">Select family member...</option>
                        {familyMembers && familyMembers.map((member, index) => (
                          <option key={index} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Name of Fund *</label>
                      <input
                        type="text"
                        value={newMutualFundPortfolio.fundName}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, fundName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newMutualFundPortfolio.goalPurpose}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, goalPurpose: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Folio Number</label>
                      <input
                        type="text"
                        value={newMutualFundPortfolio.folioNumber}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, folioNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Purchase</label>
                      <input
                        type="date"
                        value={newMutualFundPortfolio.dateOfPurchase}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, dateOfPurchase: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Purchase NAV</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.purchaseNAV}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, purchaseNAV: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Units</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.numberOfUnits}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, numberOfUnits: e.target.value})}
                        step="0.001"
                      />
                    </div>
                    <div className="form-group">
                      <label>Purchase Value</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.purchaseValue}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, purchaseValue: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Current NAV</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.currentNAV}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, currentNAV: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Valuation</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.currentValuation}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, currentValuation: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Difference</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.difference}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, difference: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>% Difference</label>
                      <input
                        type="number"
                        value={newMutualFundPortfolio.percentDifference}
                        onChange={(e) => setNewMutualFundPortfolio({...newMutualFundPortfolio, percentDifference: e.target.value})}
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
        </div>

        {/* Portfolio Details - Shares */}
        <div className="static-section">
          <div className="section-header">
            <FiTrendingUp className="section-icon" />
            <h3>Portfolio Details - Shares</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.sharesPortfolio && formData.sharesPortfolio.length > 0 ? (
                formData.sharesPortfolio.map((share, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{share.scriptName}</h5>
                        <span className="relation-badge">{share.dematCompany}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Sr. No.:</strong> {share.srNo}</p>
                          <p><strong>Investor Name:</strong> {share.investorName}</p>
                          <p><strong>Goal/Purpose:</strong> {share.goalPurpose}</p>
                          <p><strong>Date of Purchase:</strong> {share.dateOfPurchase}</p>
                          <p><strong>Purchase NAV:</strong> {share.purchaseNAV}</p>
                          <p><strong>Number of Units:</strong> {share.numberOfUnits}</p>
                          <p><strong>Purchase Value:</strong> {share.purchaseValue}</p>
                          <p><strong>Current NAV:</strong> {share.currentNAV}</p>
                          <p><strong>Current Valuation:</strong> {share.currentValuation}</p>
                          <p><strong>Difference:</strong> {share.difference}</p>
                          <p><strong>% Difference:</strong> {share.percentDifference}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeSharePortfolio(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No share portfolio added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Share Portfolio</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sr. No.</label>
                      <input
                        type="text"
                        value={newSharePortfolio.srNo}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, srNo: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Demat Company *</label>
                      <input
                        type="text"
                        value={newSharePortfolio.dematCompany}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, dematCompany: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Investor</label>
                      <select
                        value={newSharePortfolio.investorName}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, investorName: e.target.value})}
                      >
                        <option value="">Select family member...</option>
                        {familyMembers && familyMembers.map((member, index) => (
                          <option key={index} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Name of Script *</label>
                      <input
                        type="text"
                        value={newSharePortfolio.scriptName}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, scriptName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newSharePortfolio.goalPurpose}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, goalPurpose: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Purchase</label>
                      <input
                        type="date"
                        value={newSharePortfolio.dateOfPurchase}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, dateOfPurchase: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Purchase NAV</label>
                      <input
                        type="number"
                        value={newSharePortfolio.purchaseNAV}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, purchaseNAV: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Units</label>
                      <input
                        type="number"
                        value={newSharePortfolio.numberOfUnits}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, numberOfUnits: e.target.value})}
                        step="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Purchase Value</label>
                      <input
                        type="number"
                        value={newSharePortfolio.purchaseValue}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, purchaseValue: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Current NAV</label>
                      <input
                        type="number"
                        value={newSharePortfolio.currentNAV}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, currentNAV: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Valuation</label>
                      <input
                        type="number"
                        value={newSharePortfolio.currentValuation}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, currentValuation: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Difference</label>
                      <input
                        type="number"
                        value={newSharePortfolio.difference}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, difference: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>% Difference</label>
                      <input
                        type="number"
                        value={newSharePortfolio.percentDifference}
                        onChange={(e) => setNewSharePortfolio({...newSharePortfolio, percentDifference: e.target.value})}
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
        </div>

        {/* Portfolio Details - Insurance */}
        <div className="static-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>Portfolio Details - Insurance</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.insurancePortfolio && formData.insurancePortfolio.length > 0 ? (
                formData.insurancePortfolio.map((policy, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{policy.policyName}</h5>
                        <span className="relation-badge">{policy.insuranceCompany}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Sr. No.:</strong> {policy.srNo}</p>
                          <p><strong>Insurer Name:</strong> {policy.insurerName}</p>
                          <p><strong>Type of Policy:</strong> {policy.policyType}</p>
                          <p><strong>Goal/Purpose:</strong> {policy.goalPurpose}</p>
                          <p><strong>Policy Number:</strong> {policy.policyNumber}</p>
                          <p><strong>Policy Start Date:</strong> {policy.policyStartDate}</p>
                          <p><strong>Premium Mode:</strong> {policy.premiumMode}</p>
                          <p><strong>Premium Amount:</strong> {policy.premiumAmount}</p>
                          <p><strong>Last Premium Paying Date:</strong> {policy.lastPremiumPayingDate}</p>
                          <p><strong>Maturity Date:</strong> {policy.maturityDate}</p>
                          <p><strong>Sum Assured:</strong> {policy.sumAssured}</p>
                          <p><strong>Nominee:</strong> {policy.nominee}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button className="btn-remove" onClick={() => removeInsurancePortfolio(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No insurance portfolio added yet.</p>
              )}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Insurance Portfolio</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sr. No.</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.srNo}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, srNo: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Insurance Company *</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.insuranceCompany}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, insuranceCompany: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Insurer</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.insurerName}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, insurerName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Type of Policy</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.policyType}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, policyType: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Goal / Purpose</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.goalPurpose}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, goalPurpose: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name of Policy *</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.policyName}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, policyName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Policy Number</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.policyNumber}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, policyNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Policy Start</label>
                      <input
                        type="date"
                        value={newInsurancePortfolio.policyStartDate}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, policyStartDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mode of Premium</label>
                      <select
                        value={newInsurancePortfolio.premiumMode}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, premiumMode: e.target.value})}
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
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, premiumAmount: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Premium Paying Date</label>
                      <input
                        type="date"
                        value={newInsurancePortfolio.lastPremiumPayingDate}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, lastPremiumPayingDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Maturity</label>
                      <input
                        type="date"
                        value={newInsurancePortfolio.maturityDate}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, maturityDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sum Assured</label>
                      <input
                        type="number"
                        value={newInsurancePortfolio.sumAssured}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, sumAssured: e.target.value})}
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee</label>
                      <input
                        type="text"
                        value={newInsurancePortfolio.nominee}
                        onChange={(e) => setNewInsurancePortfolio({...newInsurancePortfolio, nominee: e.target.value})}
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
        </div>
      </div> 
  );
};

export default BasicDetails;
