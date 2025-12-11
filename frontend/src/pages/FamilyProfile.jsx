import { useState, useEffect } from 'react';
import { FiUsers, FiHome, FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { staticAPI } from '../utils/staticAPI';
import './family/static/Static.css';
import './ProfessionalTables.css';
import './FamilyProfile.css';

const FamilyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [showBasicForm, setShowBasicForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const languageOptions = [
    'Hindi',
    'English',
    'Marathi',
    'Gujarati',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Punjabi',
    'Bengali',
    'Urdu',
    'Odia',
    'Assamese',
    'Rajasthani',
    'Konkani',
    'Sindhi',
    'Others'
  ];
  
  const [memberFormData, setMemberFormData] = useState({
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
    // Additional Information fields
    additionalInfo: {
      nickname: '',
      nationality: 'Indian',
      religion: '',
      caste: '',
      motherTongue: '',
      languagesKnown: [],
      voterID: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactMobile: '',
      emergencyContactAddress: '',
      alternatePhone: '',
      workAddress: '',
      socialMediaProfiles: '',
      insuranceDetails: '',
      bankAccountInfo: '',
      specialNotes: ''
    }
  });

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
    totalFamilyMembers: '',
    dependents: '',
    familyMembers: [],
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
    }
  });

  useEffect(() => {
    fetchFamilyProfile();
  }, []);

  const fetchFamilyProfile = async () => {
    try {
      setLoading(true);
      // Demo data
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
        currentAddress: {
          street: '123 Main Street',
          area: 'Central Area',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        familyHead: 'John Doe',
        totalFamilyMembers: '3',
        dependents: '2',
        occupation: 'Software Engineer',
        companyName: 'Tech Solutions Pvt Ltd',
        designation: 'Senior Developer',
        workEmail: 'john.doe@techsolutions.com',
        workPhone: '+91 22 1234 5678',
        officeAddress: {
          street: '456 Business Park',
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
        },
        familyMembers: [
          {
            name: 'Jane Doe',
            relation: 'Spouse',
            dateOfBirth: '',
            age: '32',
            gender: 'Female',
            bloodGroup: '',
            maritalStatus: '',
            anniversaryDate: '',
            mobile: '+91 87654 32109',
            email: 'jane.doe@email.com',
            occupation: 'Teacher',
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
            additionalInfo: {
              nickname: '',
              nationality: 'Indian',
              religion: 'Hindu',
              caste: 'General',
              motherTongue: 'Hindi',
              languagesKnown: ['Hindi', 'English'],
              voterID: '',
              emergencyContactName: '',
              emergencyContactRelation: '',
              emergencyContactMobile: '',
              emergencyContactAddress: '',
              alternatePhone: '',
              workAddress: '',
              socialMediaProfiles: '',
              insuranceDetails: '',
              bankAccountInfo: '',
              specialNotes: ''
            }
          },
          {
            name: 'Johnny Doe',
            relation: 'Son',
            dateOfBirth: '',
            age: '8',
            gender: 'Male',
            bloodGroup: '',
            maritalStatus: '',
            anniversaryDate: '',
            mobile: '',
            email: '',
            occupation: 'Student',
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
            additionalInfo: {
              nickname: '',
              nationality: 'Indian',
              religion: 'Hindu',
              caste: 'General',
              motherTongue: 'Hindi',
              languagesKnown: ['Hindi', 'English'],
              voterID: '',
              emergencyContactName: '',
              emergencyContactRelation: '',
              emergencyContactMobile: '',
              emergencyContactAddress: '',
              alternatePhone: '',
              workAddress: '',
              socialMediaProfiles: '',
              insuranceDetails: '',
              bankAccountInfo: '',
              specialNotes: ''
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching family profile:', error);
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

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        [field]: value
      }
    }));
  };

  const handlePermanentAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      permanentAddress: {
        ...prev.permanentAddress,
        [field]: value
      }
    }));
  };

  const handleSameAsCurrentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      sameAsCurrent: value,
      permanentAddress: value ? { ...prev.currentAddress } : prev.permanentAddress
    }));
  };

  const handleTopLanguageToggle = (language) => {
    const currentLanguages = formData.languagesKnown || [];
    const updatedLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter((lang) => lang !== language)
      : [...currentLanguages, language];
    handleInputChange('languagesKnown', updatedLanguages);
  };

  const handleMemberFormChange = (field, value) => {
    setMemberFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalInfoChange = (field, value) => {
    setMemberFormData(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [field]: value
      }
    }));
  };

  const handleLanguageToggle = (language) => {
    const currentLanguages = memberFormData.additionalInfo?.languagesKnown || [];
    const updatedLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(lang => lang !== language)
      : [...currentLanguages, language];
    
    handleAdditionalInfoChange('languagesKnown', updatedLanguages);
  };

  const handleMemberClick = (member, index) => {
    setEditingMemberIndex(index);
    setMemberFormData({
      ...member,
      additionalInfo: member.additionalInfo || {
        nickname: '',
        nationality: 'Indian',
        religion: '',
        caste: '',
        motherTongue: '',
        languagesKnown: [],
        voterID: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactMobile: '',
        emergencyContactAddress: '',
        alternatePhone: '',
        workAddress: '',
        socialMediaProfiles: '',
        insuranceDetails: '',
        bankAccountInfo: '',
        specialNotes: ''
      }
    });
    setShowMemberForm(true);
  };

  const handleAddNewMember = () => {
    setEditingMemberIndex(null);
    setMemberFormData({
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
      additionalInfo: {
        nickname: '',
        nationality: 'Indian',
        religion: '',
        caste: '',
        motherTongue: '',
        languagesKnown: [],
        voterID: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactMobile: '',
        emergencyContactAddress: '',
        alternatePhone: '',
        workAddress: '',
        socialMediaProfiles: '',
        insuranceDetails: '',
        bankAccountInfo: '',
        specialNotes: ''
      }
    });
    setShowMemberForm(true);
  };

  const saveMemberForm = () => {
    if (editingMemberIndex !== null) {
      const updatedMembers = [...formData.familyMembers];
      updatedMembers[editingMemberIndex] = memberFormData;
      setFormData(prev => ({
        ...prev,
        familyMembers: updatedMembers
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        familyMembers: [...prev.familyMembers, memberFormData],
        totalFamilyMembers: (parseInt(prev.totalFamilyMembers || 0) + 1).toString()
      }));
    }
    setShowMemberForm(false);
    setEditingMemberIndex(null);
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
      totalFamilyMembers: (parseInt(prev.totalFamilyMembers || 0) - 1).toString()
    }));
  };

  const cancelMemberForm = () => {
    setShowMemberForm(false);
    setEditingMemberIndex(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // API call would go here
      setShowBasicForm(false);
    } catch (error) {
      console.error('Error saving family profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.familyName) {
    return (
      <div className="static-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading family profile...</p>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header">
        <div className="header-content">
          <div className="header-icon">
            <FiUsers />
          </div>
          <div className="header-text">
            <h1>Family Profile</h1>
            <p>Comprehensive family members information management</p>
          </div>
        </div>
      </div>

      <div className="static-content">
        {/* Basic Information */}
        <div className="static-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>Basic Information</h3>
            <button className="btn-primary" onClick={() => setShowBasicForm(!showBasicForm)}>
              <FiEdit2 /> {showBasicForm ? 'Cancel' : 'Edit Basic Info'}
            </button>
          </div>
          <div className="section-content">
            {!showBasicForm ? (
              <div className="table-container">
                <table className="family-table">
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Date of Birth</th>
                      <th>Gender</th>
                      <th>Blood Group</th>
                      <th>Marital Status</th>
                      <th>Primary Mobile</th>
                      <th>Primary Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{formData.firstName || 'N/A'}</td>
                      <td>{formData.lastName || 'N/A'}</td>
                      <td>{formData.dateOfBirth || 'N/A'}</td>
                      <td>{formData.gender || 'N/A'}</td>
                      <td>{formData.bloodGroup || 'N/A'}</td>
                      <td>{formData.maritalStatus || 'N/A'}</td>
                      <td>{formData.primaryMobile || 'N/A'}</td>
                      <td>{formData.primaryEmail || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="basic-info-form">
                {/* Personal Information */}
                <div className="form-section">
                  <h4>Personal Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
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
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Primary Mobile</label>
                      <input
                        type="tel"
                        value={formData.primaryMobile}
                        onChange={(e) => handleInputChange('primaryMobile', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Primary Email</label>
                      <input
                        type="email"
                        value={formData.primaryEmail}
                        onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="form-section">
                  <h4>Address Information</h4>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Current Address - Street</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Current Address - Area / Locality</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.area || ''}
                        onChange={(e) => handleAddressChange('area', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.state || ''}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.pincode || ''}
                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.country || ''}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>
                        <input
                          type="checkbox"
                          checked={!!formData.sameAsCurrent}
                          onChange={(e) => handleSameAsCurrentChange(e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Permanent address same as current address
                      </label>
                    </div>
                    {!formData.sameAsCurrent && (
                      <>
                        <div className="form-group full-width">
                          <label>Permanent Address - Street</label>
                          <input
                            type="text"
                            value={formData.permanentAddress?.street || ''}
                            onChange={(e) => handlePermanentAddressChange('street', e.target.value)}
                          />
                        </div>
                        <div className="form-group full-width">
                          <label>Permanent Address - Area / Locality</label>
                          <input
                            type="text"
                            value={formData.permanentAddress?.area || ''}
                            onChange={(e) => handlePermanentAddressChange('area', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            value={formData.permanentAddress?.city || ''}
                            onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>State</label>
                          <input
                            type="text"
                            value={formData.permanentAddress?.state || ''}
                            onChange={(e) => handlePermanentAddressChange('state', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Pincode</label>
                          <input
                            type="text"
                            value={formData.permanentAddress?.pincode || ''}
                            onChange={(e) => handlePermanentAddressChange('pincode', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Country</label>
                          <input
                            type="text"
                            value={formData.permanentAddress?.country || ''}
                            onChange={(e) => handlePermanentAddressChange('country', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="form-section">
                  <h4>Professional Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Work Email</label>
                      <input
                        type="email"
                        value={formData.workEmail}
                        onChange={(e) => handleInputChange('workEmail', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Work Phone</label>
                      <input
                        type="tel"
                        value={formData.workPhone}
                        onChange={(e) => handleInputChange('workPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nationality</label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Religion</label>
                      <input
                        type="text"
                        value={formData.religion}
                        onChange={(e) => handleInputChange('religion', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Caste</label>
                      <select
                        value={formData.caste}
                        onChange={(e) => handleInputChange('caste', e.target.value)}
                      >
                        <option value="">Select Caste</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mother Tongue</label>
                      <input
                        type="text"
                        value={formData.motherTongue}
                        onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Languages Known</label>
                      <div className="language-checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {languageOptions.map((lang) => (
                          <label key={lang} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="checkbox"
                              checked={formData.languagesKnown?.includes(lang) || false}
                              onChange={() => handleTopLanguageToggle(lang)}
                            />
                            <span>{lang}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Aadhaar Number</label>
                      <input
                        type="text"
                        value={formData.aadhaarNumber}
                        onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Number</label>
                      <input
                        type="text"
                        value={formData.passportNumber}
                        onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Voter ID</label>
                      <input
                        type="text"
                        value={formData.voterId}
                        onChange={(e) => handleInputChange('voterId', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="form-section">
                  <h4>Emergency Contact</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContact?.name || ''}
                        onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation</label>
                      <input
                        type="text"
                        value={formData.emergencyContact?.relation || ''}
                        onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), relation: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        value={formData.emergencyContact?.mobile || ''}
                        onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), mobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <textarea
                        value={formData.emergencyContact?.address || ''}
                        onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), address: e.target.value})}
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-success" onClick={handleSave}>
                    <FiSave /> Save Basic Information
                  </button>
                  <button className="btn-secondary" onClick={() => setShowBasicForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Family Information */}
        <div className="static-section">
          <div className="section-header">
            <FiUsers className="section-icon" />
            <h3>Family Information</h3>
            <button className="btn-primary" onClick={handleAddNewMember}>
              <FiPlus /> Add Member
            </button>
          </div>
          <div className="section-content">
            {formData.familyMembers && formData.familyMembers.length > 0 ? (
              <div className="table-container">
                <table className="family-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relation</th>
                      <th>Date of Birth</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Blood Group</th>
                      <th>Marital Status</th>
                      <th>Anniversary Date</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Occupation</th>
                      <th>Company</th>
                      <th>Work Phone</th>
                      <th>Education</th>
                      <th>Specialization</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.familyMembers.map((member, index) => (
                      <tr key={index}>
                        <td>
                          <span 
                            className="clickable-name" 
                            onClick={() => handleMemberClick(member, index)}
                            style={{ cursor: 'pointer', color: '#2563EB', textDecoration: 'underline' }}
                          >
                            {member.name}
                          </span>
                        </td>
                        <td>{member.relation}</td>
                        <td>{member.dateOfBirth || 'N/A'}</td>
                        <td>{member.age}</td>
                        <td>{member.gender || 'N/A'}</td>
                        <td>{member.bloodGroup || 'N/A'}</td>
                        <td>{member.maritalStatus || 'N/A'}</td>
                        <td>{member.anniversaryDate || 'N/A'}</td>
                        <td>{member.mobile || 'N/A'}</td>
                        <td>{member.email || 'N/A'}</td>
                        <td>{member.occupation || 'N/A'}</td>
                        <td>{member.companyName || 'N/A'}</td>
                        <td>{member.workPhone || 'N/A'}</td>
                        <td>{member.education || 'N/A'}</td>
                        <td>{member.specialization || 'N/A'}</td>
                        <td>
                          <button
                            className="btn-icon"
                            onClick={() => handleMemberClick(member, index)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => removeMember(index)}
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No family members added yet.</p>
                <button className="btn-primary" onClick={handleAddNewMember}>
                  <FiPlus /> Add First Member
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Member Form Modal */}
        {showMemberForm && (
          <div className="modal-overlay" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="modal-content" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div className="modal-header">
                <h2>{editingMemberIndex !== null ? 'Edit' : 'Add'} Family Member</h2>
                <button className="btn-close" onClick={cancelMemberForm} style={{ float: 'right' }}>
                  <FiX />
                </button>
              </div>
              
              <div className="modal-body">
                {/* Personal Information */}
                <div className="form-section">
                  <h4>Personal Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={memberFormData.name}
                        onChange={(e) => handleMemberFormChange('name', e.target.value)}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation *</label>
                      <select
                        value={memberFormData.relation}
                        onChange={(e) => handleMemberFormChange('relation', e.target.value)}
                      >
                        <option value="">Select Relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Self">Self</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={memberFormData.dateOfBirth}
                        onChange={(e) => handleMemberFormChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={memberFormData.age}
                        onChange={(e) => handleMemberFormChange('age', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={memberFormData.gender}
                        onChange={(e) => handleMemberFormChange('gender', e.target.value)}
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
                        value={memberFormData.bloodGroup}
                        onChange={(e) => handleMemberFormChange('bloodGroup', e.target.value)}
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
                        value={memberFormData.maritalStatus}
                        onChange={(e) => handleMemberFormChange('maritalStatus', e.target.value)}
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Anniversary Date</label>
                      <input
                        type="date"
                        value={memberFormData.anniversaryDate}
                        onChange={(e) => handleMemberFormChange('anniversaryDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                  <h4>Contact Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="tel"
                        value={memberFormData.mobile}
                        onChange={(e) => handleMemberFormChange('mobile', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={memberFormData.email}
                        onChange={(e) => handleMemberFormChange('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Work Phone</label>
                      <input
                        type="tel"
                        value={memberFormData.workPhone}
                        onChange={(e) => handleMemberFormChange('workPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="form-section">
                  <h4>Professional Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={memberFormData.occupation}
                        onChange={(e) => handleMemberFormChange('occupation', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={memberFormData.companyName}
                        onChange={(e) => handleMemberFormChange('companyName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Education</label>
                      <input
                        type="text"
                        value={memberFormData.education}
                        onChange={(e) => handleMemberFormChange('education', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={memberFormData.specialization}
                        onChange={(e) => handleMemberFormChange('specialization', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="form-section">
                  <h4>Personal Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Hobbies</label>
                      <input
                        type="text"
                        value={memberFormData.hobbies}
                        onChange={(e) => handleMemberFormChange('hobbies', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Health Issues</label>
                      <input
                        type="text"
                        value={memberFormData.healthIssues}
                        onChange={(e) => handleMemberFormChange('healthIssues', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Medications</label>
                      <input
                        type="text"
                        value={memberFormData.medications}
                        onChange={(e) => handleMemberFormChange('medications', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="form-section">
                  <h4>Documents</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Aadhaar Number</label>
                      <input
                        type="text"
                        value={memberFormData.aadhaarNumber}
                        onChange={(e) => handleMemberFormChange('aadhaarNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        value={memberFormData.panNumber}
                        onChange={(e) => handleMemberFormChange('panNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Number</label>
                      <input
                        type="text"
                        value={memberFormData.passportNumber}
                        onChange={(e) => handleMemberFormChange('passportNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Driving License</label>
                      <input
                        type="text"
                        value={memberFormData.drivingLicense}
                        onChange={(e) => handleMemberFormChange('drivingLicense', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nationality</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.nationality || ''}
                        onChange={(e) => handleAdditionalInfoChange('nationality', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Religion</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.religion || ''}
                        onChange={(e) => handleAdditionalInfoChange('religion', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Caste</label>
                      <select
                        value={memberFormData.additionalInfo?.caste || ''}
                        onChange={(e) => handleAdditionalInfoChange('caste', e.target.value)}
                      >
                        <option value="">Select Caste</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mother Tongue</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.motherTongue || ''}
                        onChange={(e) => handleAdditionalInfoChange('motherTongue', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Voter ID</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.voterID || ''}
                        onChange={(e) => handleAdditionalInfoChange('voterID', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Languages Known</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi', 'Urdu', 'Other'].map(language => (
                          <label key={language} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                              type="checkbox"
                              checked={(memberFormData.additionalInfo?.languagesKnown || []).includes(language)}
                              onChange={() => handleLanguageToggle(language)}
                            />
                            <span>{language}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="form-section">
                  <h4>Emergency Contact</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.emergencyContactName || ''}
                        onChange={(e) => handleAdditionalInfoChange('emergencyContactName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.emergencyContactRelation || ''}
                        onChange={(e) => handleAdditionalInfoChange('emergencyContactRelation', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        value={memberFormData.additionalInfo?.emergencyContactMobile || ''}
                        onChange={(e) => handleAdditionalInfoChange('emergencyContactMobile', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        value={memberFormData.additionalInfo?.emergencyContactAddress || ''}
                        onChange={(e) => handleAdditionalInfoChange('emergencyContactAddress', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn-success" onClick={saveMemberForm} style={{ marginRight: '10px' }}>
                  <FiSave /> {editingMemberIndex !== null ? 'Update' : 'Add'} Member
                </button>
                <button className="btn-secondary" onClick={cancelMemberForm}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyProfile;