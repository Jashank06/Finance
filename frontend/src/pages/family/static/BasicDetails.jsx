import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiUsers, FiHome, FiBriefcase, FiGlobe, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';

const BasicDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
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
    mobileBills: []
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
    branchAddress: ''
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
    branchAddress: ''
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
    branchAddress: ''
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
    rmEmail: ''
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
    customerNumber: ''
  });

  useEffect(() => {
    fetchBasicDetails();
  }, []);

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

  const handleSave = async () => {
    try {
      setLoading(true);
      let response;
      
      if (formData._id) {
        // Update existing record
        response = await staticAPI.updateBasicDetails(formData._id, formData);
      } else {
        // Create new record
        response = await staticAPI.createBasicDetails(formData);
      }
      
      setFormData(response.data);
      setEditMode(false);
    } catch (error) {
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
        {/* Personal Information */}
        <div className="static-section">
          <div className="section-header">
            <FiUser className="section-icon" />
            <h3>Personal Information</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={!editMode}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  disabled={!editMode}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  disabled={!editMode}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              {formData.maritalStatus === 'Married' && (
                <div className="form-group">
                  <label>Anniversary Date</label>
                  <input
                    type="date"
                    value={formData.anniversaryDate}
                    onChange={(e) => handleInputChange('anniversaryDate', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="static-section">
          <div className="section-header">
            <FiPhone className="section-icon" />
            <h3>Contact Information</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Primary Mobile</label>
                <input
                  type="tel"
                  value={formData.primaryMobile}
                  onChange={(e) => handleInputChange('primaryMobile', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Secondary Mobile</label>
                <input
                  type="tel"
                  value={formData.secondaryMobile}
                  onChange={(e) => handleInputChange('secondaryMobile', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Primary Email</label>
                <input
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Secondary Email</label>
                <input
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => handleInputChange('secondaryEmail', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="static-section">
          <div className="section-header">
            <FiMapPin className="section-icon" />
            <h3>Address Information</h3>
          </div>
          <div className="section-content">
            <div className="address-section">
              <h4>Current Address</h4>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Street</label>
                  <input
                    type="text"
                    value={formData.currentAddress.street}
                    onChange={(e) => handleAddressChange('currentAddress', 'street', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    value={formData.currentAddress.area}
                    onChange={(e) => handleAddressChange('currentAddress', 'area', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.currentAddress.city}
                    onChange={(e) => handleAddressChange('currentAddress', 'city', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.currentAddress.state}
                    onChange={(e) => handleAddressChange('currentAddress', 'state', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={formData.currentAddress.pincode}
                    onChange={(e) => handleAddressChange('currentAddress', 'pincode', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.currentAddress.country}
                    onChange={(e) => handleAddressChange('currentAddress', 'country', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>

            <div className="address-section">
              <div className="address-header">
                <h4>Permanent Address</h4>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sameAsCurrent}
                    onChange={(e) => handleSameAsCurrentChange(e.target.checked)}
                    disabled={!editMode}
                  />
                  Same as Current Address
                </label>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Street</label>
                  <input
                    type="text"
                    value={formData.permanentAddress.street}
                    onChange={(e) => handleAddressChange('permanentAddress', 'street', e.target.value)}
                    disabled={!editMode || formData.sameAsCurrent}
                  />
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    value={formData.permanentAddress.area}
                    onChange={(e) => handleAddressChange('permanentAddress', 'area', e.target.value)}
                    disabled={!editMode || formData.sameAsCurrent}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.permanentAddress.city}
                    onChange={(e) => handleAddressChange('permanentAddress', 'city', e.target.value)}
                    disabled={!editMode || formData.sameAsCurrent}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.permanentAddress.state}
                    onChange={(e) => handleAddressChange('permanentAddress', 'state', e.target.value)}
                    disabled={!editMode || formData.sameAsCurrent}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={formData.permanentAddress.pincode}
                    onChange={(e) => handleAddressChange('permanentAddress', 'pincode', e.target.value)}
                    disabled={!editMode || formData.sameAsCurrent}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.permanentAddress.country}
                    onChange={(e) => handleAddressChange('permanentAddress', 'country', e.target.value)}
                    disabled={!editMode || formData.sameAsCurrent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="static-section">
          <div className="section-header">
            <FiUsers className="section-icon" />
            <h3>Family Information</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Family Head</label>
                <input
                  type="text"
                  value={formData.familyHead}
                  onChange={(e) => handleInputChange('familyHead', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Total Family Members</label>
                <input
                  type="number"
                  value={formData.totalFamilyMembers}
                  onChange={(e) => handleInputChange('totalFamilyMembers', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Dependents</label>
                <input
                  type="number"
                  value={formData.dependents}
                  onChange={(e) => handleInputChange('dependents', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>

            <div className="family-members">
              <h4>Family Members</h4>
              {formData.familyMembers.map((member, index) => (
                <div key={index} className="family-member-card">
                  <div className="member-info">
                    <div className="member-header">
                      <h5>{member.name}</h5>
                      <span className="relation-badge">{member.relation}</span>
                    </div>
                    <div className="member-details">
                      <div className="form-grid">
                        <p><strong>Date of Birth:</strong> {member.dateOfBirth}</p>
                        <p><strong>Age:</strong> {member.age}</p>
                        <p><strong>Gender:</strong> {member.gender}</p>
                        <p><strong>Blood Group:</strong> {member.bloodGroup}</p>
                        <p><strong>Marital Status:</strong> {member.maritalStatus}</p>
                        {member.anniversaryDate && <p><strong>Anniversary:</strong> {member.anniversaryDate}</p>}
                        <p><strong>Mobile:</strong> {member.mobile || 'N/A'}</p>
                        <p><strong>Email:</strong> {member.email || 'N/A'}</p>
                        <p><strong>Occupation:</strong> {member.occupation || 'N/A'}</p>
                        <p><strong>Company:</strong> {member.companyName || 'N/A'}</p>
                        <p><strong>Work Phone:</strong> {member.workPhone || 'N/A'}</p>
                        <p><strong>Education:</strong> {member.education || 'N/A'}</p>
                        <p><strong>Specialization:</strong> {member.specialization || 'N/A'}</p>
                        <p><strong>Hobbies:</strong> {member.hobbies || 'N/A'}</p>
                        {member.healthIssues && <p><strong>Health Issues:</strong> {member.healthIssues}</p>}
                        {member.medications && <p><strong>Medications:</strong> {member.medications}</p>}
                        {member.aadhaarNumber && <p><strong>Aadhaar:</strong> {member.aadhaarNumber}</p>}
                        {member.panNumber && <p><strong>PAN:</strong> {member.panNumber}</p>}
                        {member.passportNumber && <p><strong>Passport:</strong> {member.passportNumber}</p>}
                        {member.drivingLicense && <p><strong>Driving License:</strong> {member.drivingLicense}</p>}
                      </div>
                      {member.additionalInfo && (
                        <div className="form-group full-width">
                          <p><strong>Additional Information:</strong> {member.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {editMode && (
                    <button
                      className="btn-remove"
                      onClick={() => removeFamilyMember(index)}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}

              {editMode && (
                <div className="add-family-member">
                  <h5>Add Family Member</h5>
                  
                  {/* Personal Information */}
                  <h6>Personal Information</h6>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={newFamilyMember.name}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, name: e.target.value})}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation *</label>
                      <select
                        value={newFamilyMember.relation}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, relation: e.target.value})}
                      >
                        <option value="">Select Relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={newFamilyMember.dateOfBirth}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={newFamilyMember.age}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, age: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={newFamilyMember.gender}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Blood Group</label>
                      <select
                        value={newFamilyMember.bloodGroup}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, bloodGroup: e.target.value})}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Marital Status</label>
                      <select
                        value={newFamilyMember.maritalStatus}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, maritalStatus: e.target.value})}
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    {newFamilyMember.maritalStatus === 'Married' && (
                      <div className="form-group">
                        <label>Anniversary Date</label>
                        <input
                          type="date"
                          value={newFamilyMember.anniversaryDate}
                          onChange={(e) => setNewFamilyMember({...newFamilyMember, anniversaryDate: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <h6>Contact Information</h6>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        value={newFamilyMember.mobile}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, mobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newFamilyMember.email}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, email: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <h6>Professional Information</h6>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={newFamilyMember.occupation}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, occupation: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={newFamilyMember.companyName}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, companyName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Work Phone</label>
                      <input
                        type="tel"
                        value={newFamilyMember.workPhone}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, workPhone: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Educational Information */}
                  <h6>Educational Information</h6>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Education</label>
                      <input
                        type="text"
                        value={newFamilyMember.education}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, education: e.target.value})}
                        placeholder="e.g., B.Tech, MBA"
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={newFamilyMember.specialization}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, specialization: e.target.value})}
                        placeholder="e.g., Computer Science, Finance"
                      />
                    </div>
                  </div>

                  {/* Personal Details */}
                  <h6>Personal Details</h6>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Hobbies</label>
                      <input
                        type="text"
                        value={newFamilyMember.hobbies}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, hobbies: e.target.value})}
                        placeholder="e.g., Reading, Sports, Music"
                      />
                    </div>
                  </div>

                  {/* Health Information */}
                  <h6>Health Information</h6>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Health Issues (if any)</label>
                      <textarea
                        value={newFamilyMember.healthIssues}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, healthIssues: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Medications</label>
                      <textarea
                        value={newFamilyMember.medications}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, medications: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Documents */}
                  <h6>Documents</h6>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Aadhaar Number</label>
                      <input
                        type="text"
                        value={newFamilyMember.aadhaarNumber}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, aadhaarNumber: e.target.value})}
                        maxLength={14}
                      />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        value={newFamilyMember.panNumber}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, panNumber: e.target.value})}
                        maxLength={10}
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Number</label>
                      <input
                        type="text"
                        value={newFamilyMember.passportNumber}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, passportNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Driving License</label>
                      <input
                        type="text"
                        value={newFamilyMember.drivingLicense}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, drivingLicense: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <h6>Additional Information</h6>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Additional Information / Notes</label>
                      <textarea
                        value={newFamilyMember.additionalInfo}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, additionalInfo: e.target.value})}
                        rows={3}
                        placeholder="Add any additional information or notes..."
                      />
                    </div>
                  </div>

                  <button className="btn-primary" onClick={addFamilyMember}>
                    <FiPlus /> Add Member
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="static-section">
          <div className="section-header">
            <FiBriefcase className="section-icon" />
            <h3>Professional Information</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => handleInputChange('workEmail', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Work Phone</label>
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange('workPhone', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>

            <div className="office-address">
              <h4>Office Address</h4>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Street</label>
                  <input
                    type="text"
                    value={formData.officeAddress.street}
                    onChange={(e) => handleAddressChange('officeAddress', 'street', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    value={formData.officeAddress.area}
                    onChange={(e) => handleAddressChange('officeAddress', 'area', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.officeAddress.city}
                    onChange={(e) => handleAddressChange('officeAddress', 'city', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.officeAddress.state}
                    onChange={(e) => handleAddressChange('officeAddress', 'state', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={formData.officeAddress.pincode}
                    onChange={(e) => handleAddressChange('officeAddress', 'pincode', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="static-section">
          <div className="section-header">
            <FiGlobe className="section-icon" />
            <h3>Additional Information</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Religion</label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) => handleInputChange('religion', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Caste</label>
                <input
                  type="text"
                  value={formData.caste}
                  onChange={(e) => handleInputChange('caste', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Mother Tongue</label>
                <input
                  type="text"
                  value={formData.motherTongue}
                  onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>

            <div className="languages-section">
              <h4>Languages Known</h4>
              <div className="languages-grid">
                {['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi', 'Urdu', 'Other'].map(language => (
                  <label key={language} className="language-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.languagesKnown.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                      disabled={!editMode}
                    />
                    <span>{language}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  disabled={!editMode}
                  maxLength={14}
                />
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  disabled={!editMode}
                  maxLength={10}
                />
              </div>
              <div className="form-group">
                <label>Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Voter ID</label>
                <input
                  type="text"
                  value={formData.voterId}
                  onChange={(e) => handleInputChange('voterId', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="static-section">
          <div className="section-header">
            <FiPhone className="section-icon" />
            <h3>Emergency Contact</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact', {...formData.emergencyContact, name: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relation}
                  onChange={(e) => handleInputChange('emergencyContact', {...formData.emergencyContact, relation: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={formData.emergencyContact.mobile}
                  onChange={(e) => handleInputChange('emergencyContact', {...formData.emergencyContact, mobile: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={formData.emergencyContact.address}
                  onChange={(e) => handleInputChange('emergencyContact', {...formData.emergencyContact, address: e.target.value})}
                  disabled={!editMode}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mutual Funds Information */}
        <div className="static-section">
          <div className="section-header">
            <FiTrendingUp className="section-icon" />
            <h3>Mutual Funds Information</h3>
          </div>
          <div className="section-content">
            <div className="mutual-funds-list">
              {formData.mutualFunds && formData.mutualFunds.length > 0 ? (
                formData.mutualFunds.map((fund, index) => (
                  <div key={index} className="family-member-card">
                    <div className="member-info">
                      <div className="member-header">
                        <h5>{fund.mfName}</h5>
                        <span className="relation-badge">{fund.fundHouse}</span>
                      </div>
                      <div className="member-details">
                        <div className="form-grid">
                          <p><strong>Folio No:</strong> {fund.folioNo}</p>
                          <p><strong>Mode of Holding:</strong> {fund.modeOfHolding}</p>
                          <p><strong>Holding Type:</strong> {fund.holdingType}</p>
                          <p><strong>Investor Name:</strong> {fund.investorName}</p>
                          <p><strong>UCC:</strong> {fund.ucc}</p>
                          <p><strong>Registered Mobile:</strong> {fund.registeredMobile}</p>
                          <p><strong>Registered Bank:</strong> {fund.registeredBank}</p>
                          <p><strong>Nominee:</strong> {fund.nominee}</p>
                          <p><strong>Customer Care:</strong> {fund.customerCareNumber}</p>
                          <p><strong>Customer Care Email:</strong> {fund.customerCareEmail}</p>
                          <p><strong>RM Name:</strong> {fund.rmName}</p>
                          <p><strong>RM Mobile:</strong> {fund.rmMobile}</p>
                          <p><strong>RM Email:</strong> {fund.rmEmail}</p>
                        </div>
                        <div className="form-group full-width">
                          <p><strong>Registered Address:</strong> {fund.registeredAddress}</p>
                          <p><strong>Branch Address:</strong> {fund.branchAddress}</p>
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button
                        className="btn-remove"
                        onClick={() => removeMutualFund(index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
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
                      <input
                        type="text"
                        value={newMutualFund.investorName}
                        onChange={(e) => setNewMutualFund({...newMutualFund, investorName: e.target.value})}
                      />
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
                      <input
                        type="text"
                        value={newShare.investorName}
                        onChange={(e) => setNewShare({...newShare, investorName: e.target.value})}
                      />
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
                  </div>
                  <button className="btn-primary" onClick={addMobileBill}>
                    <FiPlus /> Add Mobile Bill
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
