import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiUsers, FiHome, FiBriefcase, FiGlobe, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import { syncBillScheduleFromForm } from '../../../utils/billScheduleSyncUtil';
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
    // Sub Broker Information
    subBrokers: [],
    // Loans Portfolio
    loansPortfolio: []
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

        // Filter out demo family members if they exist
        const demoNames = ['John Doe', 'Jane Doe', 'Johnny Doe'];
        const cleanFamilyMembers = (data.familyMembers || []).filter(
          member => !demoNames.includes(member.name)
        );

        // Filter out demo emergency contact
        const cleanEmergencyContact = data.emergencyContact && data.emergencyContact.name === 'Robert Doe'
          ? { name: '', relation: '', mobile: '', address: '' }
          : (data.emergencyContact || { name: '', relation: '', mobile: '', address: '' });

        setFormData(prev => ({
          ...prev,
          ...data,
          familyMembers: cleanFamilyMembers,
          emergencyContact: cleanEmergencyContact,
          subBrokers: data.subBrokers || [],
          mutualFundsPortfolio: data.mutualFundsPortfolio || [],
          sharesPortfolio: data.sharesPortfolio || [],
          insurancePortfolio: data.insurancePortfolio || [],
          loansPortfolio: data.loansPortfolio || []
        }));
      } else {
        // Set empty data if no records exist
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          bloodGroup: '',
          maritalStatus: '',
          anniversaryDate: '',
          primaryMobile: '',
          secondaryMobile: '',
          primaryEmail: '',
          secondaryEmail: '',
          whatsappNumber: '',
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
          familyHead: '',
          familyMembers: [],
          totalFamilyMembers: '0',
          dependents: '0',
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
          mutualFunds: [],
          shares: [],
          insurance: [],
          banks: [],
          mobileBills: [],
          cards: [],
          paymentGateways: [],
          mutualFundsPortfolio: [],
          sharesPortfolio: [],
          insurancePortfolio: [],
          subBrokers: []
        });
      }
    } catch (error) {
      console.error('Error fetching basic details:', error);
      // Set empty data if API fails
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        maritalStatus: '',
        anniversaryDate: '',
        primaryMobile: '',
        secondaryMobile: '',
        primaryEmail: '',
        secondaryEmail: '',
        whatsappNumber: '',
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
        familyHead: '',
        familyMembers: [],
        totalFamilyMembers: '0',
        dependents: '0',
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

  const addMutualFund = async () => {
    if (newMutualFund.fundHouse && newMutualFund.mfName) {
      const updatedData = {
        ...formData,
        mutualFunds: [...formData.mutualFunds, { ...newMutualFund }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Mutual Fund added successfully!');
      } catch (error) {
        console.error('Error adding mutual fund:', error);
        alert('Failed to add mutual fund');
      } finally {
        setLoading(false);
      }
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

  const addShare = async () => {
    if (newShare.dematCompany && newShare.scriptName) {
      const updatedData = {
        ...formData,
        shares: [...formData.shares, { ...newShare }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Share added successfully!');
      } catch (error) {
        console.error('Error adding share:', error);
        alert('Failed to add share');
      } finally {
        setLoading(false);
      }
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

  const addInsurance = async () => {
    if (newInsurance.insuranceCompany && newInsurance.policyName) {
      const updatedData = {
        ...formData,
        insurance: [...formData.insurance, { ...newInsurance }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Insurance added successfully!');
      } catch (error) {
        console.error('Error adding insurance:', error);
        alert('Failed to add insurance');
      } finally {
        setLoading(false);
      }
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

  const addBank = async () => {
    if (newBank.bankName && newBank.accountNumber) {
      const updatedData = {
        ...formData,
        banks: [...formData.banks, { ...newBank }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Bank account added successfully!');
      } catch (error) {
        console.error('Error adding bank:', error);
        alert('Failed to add bank account');
      } finally {
        setLoading(false);
      }
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

  const addMobileBill = async () => {
    if (newMobileBill.mobileNumber) {
      const updatedData = {
        ...formData,
        mobileBills: [...formData.mobileBills, { ...newMobileBill }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Mobile bill added successfully!');
      } catch (error) {
        console.error('Error adding mobile bill:', error);
        alert('Failed to add mobile bill');
      } finally {
        setLoading(false);
      }
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

  const addCard = async () => {
    if (newCard.bankName && newCard.cardNumber) {
      const updatedData = {
        ...formData,
        cards: [...formData.cards, { ...newCard }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Card added successfully!');
      } catch (error) {
        console.error('Error adding card:', error);
        alert('Failed to add card');
      } finally {
        setLoading(false);
      }
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

  const addPaymentGateway = async () => {
    if (newPaymentGateway.company && newPaymentGateway.companyName) {
      const updatedData = {
        ...formData,
        paymentGateways: [...formData.paymentGateways, { ...newPaymentGateway }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
        setNewPaymentGateway({
          company: '',
          companyName: '',
          bankName: '',
          accountNumber: '',
          url: '',
          userId: '',
          password: ''
        });
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Payment gateway added successfully!');
      } catch (error) {
        console.error('Error adding payment gateway:', error);
        alert('Failed to add payment gateway');
      } finally {
        setLoading(false);
      }
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

  const addSubBroker = async () => {
    console.log('Attempting to add Sub Broker:', newSubBroker);
    if (newSubBroker.nameOfCompany && newSubBroker.contactNumber) {
      console.log('Validation passed. Adding to list.');
      const updatedData = {
        ...formData,
        subBrokers: [...(formData.subBrokers || []), { ...newSubBroker }]
      };

      try {
        setLoading(true);
        await staticAPI.updateBasicDetails(formData._id, updatedData);
        setFormData(updatedData);
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
        setEditingSection(null);

        // Sync contacts and customer support
        try {
          await syncContactsFromForm(updatedData, 'BasicDetails');
          await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
        } catch (syncError) {
          console.error('Error syncing contacts/support:', syncError);
        }

        alert('Sub Broker added successfully!');
      } catch (error) {
        console.error('Error adding sub broker:', error);
        alert('Failed to add sub broker');
      } finally {
        setLoading(false);
      }
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

      // Filter out demo data
      const demoNames = ['John Doe', 'Jane Doe', 'Johnny Doe'];
      const cleanFamilyMembers = (data.familyMembers || []).filter(
        member => !demoNames.includes(member.name)
      );
      const cleanEmergencyContact = data.emergencyContact && data.emergencyContact.name === 'Robert Doe'
        ? { name: '', relation: '', mobile: '', address: '' }
        : (data.emergencyContact || { name: '', relation: '', mobile: '', address: '' });

      setFormData(prev => ({
        ...data,
        familyMembers: cleanFamilyMembers,
        emergencyContact: cleanEmergencyContact,
        subBrokers: data.subBrokers || [],
        mutualFundsPortfolio: data.mutualFundsPortfolio || [],
        sharesPortfolio: data.sharesPortfolio || [],
        insurancePortfolio: data.insurancePortfolio || [],
        loansPortfolio: data.loansPortfolio || []
      }));

      // Trigger sync for relevant sections
      const sectionsToSync = [
        'mutualFunds', 'shares', 'insurance', 'banks',
        'mobileBills', 'cards', 'subBrokers'
      ];

      if (sectionsToSync.includes(sectionName)) {
        // Sync contacts
        await syncContactsFromForm(data, 'BasicDetails');
        // Sync customer support
        await syncCustomerSupportFromForm(data, 'BasicDetails');
        // Sync bill schedule (Mobile Bill Info)
        await syncBillScheduleFromForm(data, 'BasicDetails');
      }

      setEditingSection(null);
      setEditMode(false);
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
      const data = response.data;

      // Filter out demo data
      const demoNames = ['John Doe', 'Jane Doe', 'Johnny Doe'];
      const cleanFamilyMembers = (data.familyMembers || []).filter(
        member => !demoNames.includes(member.name)
      );
      const cleanEmergencyContact = data.emergencyContact && data.emergencyContact.name === 'Robert Doe'
        ? { name: '', relation: '', mobile: '', address: '' }
        : (data.emergencyContact || { name: '', relation: '', mobile: '', address: '' });

      setFormData({
        ...data,
        familyMembers: cleanFamilyMembers,
        emergencyContact: cleanEmergencyContact,
        subBrokers: data.subBrokers || [],
        mutualFundsPortfolio: data.mutualFundsPortfolio || [],
        sharesPortfolio: data.sharesPortfolio || [],
        insurancePortfolio: data.insurancePortfolio || [],
        loansPortfolio: data.loansPortfolio || []
      });

      // Trigger sync for all sections
      await syncContactsFromForm(data, 'BasicDetails');
      await syncCustomerSupportFromForm(response.data, 'BasicDetails');
      await syncBillScheduleFromForm(data, 'BasicDetails');

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
              <button
                className={editingSection === 'mutualFunds' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('mutualFunds')}
                title={editingSection === 'mutualFunds' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'mutualFunds' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addMutualFund}>
                    <FiPlus /> Add Mutual Fund
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('mutualFunds')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'shares' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('shares')}
                title={editingSection === 'shares' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'shares' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addShare}>
                    <FiPlus /> Add Share
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('shares')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'insurance' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('insurance')}
                title={editingSection === 'insurance' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'insurance' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addInsurance}>
                    <FiPlus /> Add Insurance Policy
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('insurance')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'banks' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('banks')}
                title={editingSection === 'banks' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'banks' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addBank}>
                    <FiPlus /> Add Bank Account
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('banks')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'mobileBills' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('mobileBills')}
                title={editingSection === 'mobileBills' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'mobileBills' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addMobileBill}>
                    <FiPlus /> Add Mobile Bill
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('mobileBills')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'cards' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('cards')}
                title={editingSection === 'cards' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'cards' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addCard}>
                    <FiPlus /> Add Card
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('cards')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'paymentGateways' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('paymentGateways')}
                title={editingSection === 'paymentGateways' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'paymentGateways' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addPaymentGateway}>
                    <FiPlus /> Add Payment Gateway
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('paymentGateways')}>
                    <FiX /> Cancel
                  </button>
                </div>
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
              <button
                className={editingSection === 'subBrokers' ? "btn-section-cancel" : "btn-section-edit"}
                onClick={() => toggleSectionEdit('subBrokers')}
                title={editingSection === 'subBrokers' ? "Cancel" : "Add new entry"}
              >
                {editingSection === 'subBrokers' ? <><FiX /> Cancel</> : <><FiPlus /> New</>}
              </button>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={addSubBroker}>
                    <FiPlus /> Add Sub Broker
                  </button>
                  <button className="btn-secondary" onClick={() => toggleSectionEdit('subBrokers')}>
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
