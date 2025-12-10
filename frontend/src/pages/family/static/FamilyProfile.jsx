import { useState, useEffect } from 'react';
import { FiUser, FiUsers, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiPlus, FiBriefcase, FiBook, FiHeart, FiFileText, FiHome, FiGlobe, FiTrash2 } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';
import '../../../components/Modal.css';

const FamilyProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBasicForm, setShowBasicForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMemberView, setShowMemberView] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
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
    familyName: '',
    familyHead: '',
    totalMembers: '',
    members: [],
    currentAddress: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    emergencyContact: {
      name: '',
      relation: '',
      mobile: '',
      address: ''
    },
    notes: ''
  });


  // Company Records State
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyFormData, setCompanyFormData] = useState({
    // Basic Company Information
    companyName: '',
    companyType: '',
    industry: '',
    registrationNumber: '',
    incorporationDate: '',
    panNumber: '',
    tanNumber: '',
    gstNumber: '',
    cinNumber: '',
    
    // Contact Information
    registeredOffice: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phone: '',
      email: '',
      website: ''
    },
    corporateOffice: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phone: '',
      email: ''
    },
    sameAsRegistered: true,
    
    // Management Information
    directors: [],
    shareholders: [],
    authorizedSignatories: [],
    
    // Business Information
    businessActivities: [],
    turnover: '',
    employeeCount: '',
    branches: [],
    
    // Bank Information
    bankAccounts: [],
    
    // Compliance Information
    complianceStatus: '',
    lastAuditDate: '',
    nextAuditDue: '',
    taxStatus: '',
    
    // Documents
    documents: {
      incorporationCertificate: '',
      moa: '',
      aoa: '',
      panCard: '',
      gstCertificate: '',
      tanCertificate: '',
      boardResolution: ''
    }
  });

  const companyTypes = ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship', 'One Person Company'];
  const industries = ['IT Services', 'Manufacturing', 'Trading', 'Consulting', 'Healthcare', 'Education', 'Real Estate', 'Finance', 'Other'];

  useEffect(() => {
    fetchFamilyProfile();
    fetchCompanyRecords();
  }, []);

  const fetchFamilyProfile = async () => {
    try {
      setLoading(true);
      const response = await staticAPI.getFamilyProfile();
      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setFormData({
          familyName: data.familyName || '',
          familyHead: data.familyHead || '',
          totalMembers: data.totalMembers || '',
          members: data.members || [],
          currentAddress: {
            street: data.currentAddress?.street || '',
            area: data.currentAddress?.area || '',
            city: data.currentAddress?.city || '',
            state: data.currentAddress?.state || '',
            pincode: data.currentAddress?.pincode || '',
            country: data.currentAddress?.country || 'India'
          },
          emergencyContact: {
            name: data.emergencyContact?.name || '',
            relation: data.emergencyContact?.relation || '',
            mobile: data.emergencyContact?.mobile || '',
            address: data.emergencyContact?.address || ''
          },
          notes: data.notes || '',
          _id: data._id
        });
      }
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
        ...(prev.currentAddress || {}),
        [field]: value
      }
    }));
  };

  const addMember = () => {
    if (newMember.name && newMember.relation) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { ...newMember }],
        totalMembers: (parseInt(prev.totalMembers || 0) + 1).toString()
      }));
      setNewMember({
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
        drivingLicense: ''
      });
    }
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
      totalMembers: (parseInt(prev.totalMembers || 0) - 1).toString()
    }));
  };

  // Member form handlers
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
    setShowMemberView(true);
  };

  const handleEditMember = () => {
    setShowMemberView(false);
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

  const saveMemberForm = () => {
    if (editingMemberIndex !== null) {
      // Update existing member
      const updatedMembers = [...formData.members];
      updatedMembers[editingMemberIndex] = memberFormData;
      setFormData(prev => ({
        ...prev,
        members: updatedMembers
      }));
    } else {
      // Add new member
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, memberFormData],
        totalMembers: (parseInt(prev.totalMembers || 0) + 1).toString()
      }));
    }
    setShowMemberForm(false);
    setEditingMemberIndex(null);
  };

  const cancelMemberForm = () => {
    setShowMemberForm(false);
    setShowMemberView(false);
    setEditingMemberIndex(null);
  };

  const closeMemberView = () => {
    setShowMemberView(false);
    setEditingMemberIndex(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let response;
      
      if (formData._id) {
        response = await staticAPI.updateFamilyProfile(formData._id, formData);
      } else {
        response = await staticAPI.createFamilyProfile(formData);
      }
      
      setFormData(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving family profile:', error);
      alert('Failed to save family profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchFamilyProfile();
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
        <div className="header-actions">
          {!editMode ? (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              <FiEdit2 /> Edit Profile
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
                  <tbody>
                    <tr><td><strong>Family Name</strong></td><td>{formData.familyName || 'N/A'}</td></tr>
                    <tr><td><strong>Family Head</strong></td><td>{formData.familyHead || 'N/A'}</td></tr>
                    <tr><td><strong>Total Members</strong></td><td>{formData.totalMembers || 'N/A'}</td></tr>
                    <tr><td><strong>Address</strong></td><td>{formData.currentAddress?.street}, {formData.currentAddress?.area}, {formData.currentAddress?.city}</td></tr>
                    <tr><td><strong>State, Pincode</strong></td><td>{formData.currentAddress?.state}, {formData.currentAddress?.pincode}</td></tr>
                    <tr><td><strong>Emergency Contact</strong></td><td>{formData.emergencyContact?.name} ({formData.emergencyContact?.relation}) - {formData.emergencyContact?.mobile}</td></tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="basic-info-form">
                {/* All form sections go here when editing */}
                <div className="form-section">
                  <h4>Family Overview</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Family Name</label>
                      <input
                        type="text"
                        value={formData.familyName}
                        onChange={(e) => handleInputChange('familyName', e.target.value)}
                        placeholder="e.g., The Sharma Family"
                      />
                    </div>
                    <div className="form-group">
                      <label>Family Head</label>
                      <input
                        type="text"
                        value={formData.familyHead}
                        onChange={(e) => handleInputChange('familyHead', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Members</label>
                      <input
                        type="number"
                        value={formData.totalMembers}
                        onChange={(e) => handleInputChange('totalMembers', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Family Address</h4>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Street</label>
                      <input
                        type="text"
                        value={formData.currentAddress?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Area</label>
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
                  </div>
                </div>

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
            {formData.members && formData.members.length > 0 ? (
              <div className="table-container">
                <table className="family-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relation</th>
                      <th>Age</th>
                      <th>Mobile</th>
                      <th>Occupation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.members.map((member, index) => (
                      <tr key={index}>
                        <td>
                          <span 
                            className="clickable-name" 
                            onClick={() => handleMemberClick(member, index)}
                          >
                            {member.name}
                          </span>
                        </td>
                        <td>{member.relation}</td>
                        <td>{member.age}</td>
                        <td>{member.mobile || 'N/A'}</td>
                        <td>{member.occupation || 'N/A'}</td>
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


        {/* Member View Modal */}
        {showMemberView && (
          <div className="modal-overlay">
            <div className="modal-content member-view-modal">
              <div className="modal-header">
                <h2>{memberFormData.name}'s Profile</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={handleEditMember}>
                    <FiEdit2 /> Edit Basic Info
                  </button>
                  <button className="btn-close" onClick={closeMemberView}>
                    <FiX />
                  </button>
                </div>
              </div>
              
              <div className="modal-body">
                {/* Table 1: Personal & Professional Information */}
                <h3 style={{ marginBottom: '16px', color: '#1e293b', fontSize: '18px' }}>Personal & Professional Details</h3>
                <div className="table-container" style={{ marginBottom: '32px' }}>
                  <table className="family-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Personal Information */}
                      <tr>
                        <td rowSpan="8" style={{ verticalAlign: 'top', fontWeight: '700', background: '#f8fafc' }}>Personal Information</td>
                        <td><strong>First Name</strong></td>
                        <td>{memberFormData.name?.split(' ')[0] || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Last Name</strong></td>
                        <td>{memberFormData.name?.split(' ').slice(1).join(' ') || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Date of Birth</strong></td>
                        <td>{memberFormData.dateOfBirth || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Gender</strong></td>
                        <td>{memberFormData.gender || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Blood Group</strong></td>
                        <td>{memberFormData.bloodGroup || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Marital Status</strong></td>
                        <td>{memberFormData.maritalStatus || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Primary Mobile</strong></td>
                        <td>{memberFormData.mobile || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Primary Email</strong></td>
                        <td>{memberFormData.email || 'N/A'}</td>
                      </tr>

                      {/* Professional Information */}
                      <tr>
                        <td rowSpan="5" style={{ verticalAlign: 'top', fontWeight: '700', background: '#f8fafc' }}>Professional Information</td>
                        <td><strong>Occupation</strong></td>
                        <td>{memberFormData.occupation || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Company Name</strong></td>
                        <td>{memberFormData.companyName || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Designation</strong></td>
                        <td>{memberFormData.designation || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Work Email</strong></td>
                        <td>{memberFormData.workEmail || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Work Phone</strong></td>
                        <td>{memberFormData.workPhone || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table 2: Additional Information & Emergency Contact */}
                <h3 style={{ marginBottom: '16px', color: '#1e293b', fontSize: '18px' }}>Additional Information & Emergency Contact</h3>
                <div className="table-container">
                  <table className="family-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Additional Information */}
                      <tr>
                        <td rowSpan="9" style={{ verticalAlign: 'top', fontWeight: '700', background: '#f8fafc' }}>Additional Information</td>
                        <td><strong>Nationality</strong></td>
                        <td>{memberFormData.additionalInfo?.nationality || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Religion</strong></td>
                        <td>{memberFormData.additionalInfo?.religion || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Caste</strong></td>
                        <td>{memberFormData.additionalInfo?.caste || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Mother Tongue</strong></td>
                        <td>{memberFormData.additionalInfo?.motherTongue || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Languages Known</strong></td>
                        <td>{(memberFormData.additionalInfo?.languagesKnown || []).join(', ') || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Aadhaar Number</strong></td>
                        <td>{memberFormData.aadhaarNumber || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>PAN Number</strong></td>
                        <td>{memberFormData.panNumber || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Passport Number</strong></td>
                        <td>{memberFormData.passportNumber || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Voter ID</strong></td>
                        <td>{memberFormData.additionalInfo?.voterID || 'N/A'}</td>
                      </tr>

                      {/* Emergency Contact */}
                      <tr>
                        <td rowSpan="4" style={{ verticalAlign: 'top', fontWeight: '700', background: '#f8fafc' }}>Emergency Contact</td>
                        <td><strong>Contact Name</strong></td>
                        <td>{memberFormData.additionalInfo?.emergencyContactName || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Relation</strong></td>
                        <td>{memberFormData.additionalInfo?.emergencyContactRelation || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Mobile Number</strong></td>
                        <td>{memberFormData.additionalInfo?.emergencyContactMobile || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Address</strong></td>
                        <td>{memberFormData.additionalInfo?.emergencyContactAddress || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-primary" onClick={handleEditMember}>
                  <FiEdit2 /> Edit Basic Info
                </button>
                <button className="btn-secondary" onClick={closeMemberView}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member Form Modal */}
        {showMemberForm && (
          <div className="modal-overlay">
            <div className="modal-content member-form-modal">
              <div className="modal-header">
                <h2>{editingMemberIndex !== null ? 'Edit' : 'Add'} Family Member</h2>
                <button className="btn-close" onClick={cancelMemberForm}>
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
                    {memberFormData.maritalStatus === 'Married' && (
                      <div className="form-group">
                        <label>Anniversary Date</label>
                        <input
                          type="date"
                          value={memberFormData.anniversaryDate}
                          onChange={(e) => handleMemberFormChange('anniversaryDate', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                  <h4>Contact Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mobile Number</label>
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
                      <label>Alternate Phone</label>
                      <input
                        type="tel"
                        value={memberFormData.additionalInfo?.alternatePhone || ''}
                        onChange={(e) => handleAdditionalInfoChange('alternatePhone', e.target.value)}
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
                      <label>Work Phone</label>
                      <input
                        type="tel"
                        value={memberFormData.workPhone}
                        onChange={(e) => handleMemberFormChange('workPhone', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Work Address</label>
                      <textarea
                        value={memberFormData.additionalInfo?.workAddress || ''}
                        onChange={(e) => handleAdditionalInfoChange('workAddress', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Educational Information */}
                <div className="form-section">
                  <h4>Educational Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Education</label>
                      <input
                        type="text"
                        value={memberFormData.education}
                        onChange={(e) => handleMemberFormChange('education', e.target.value)}
                        placeholder="e.g., B.Tech, MBA"
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={memberFormData.specialization}
                        onChange={(e) => handleMemberFormChange('specialization', e.target.value)}
                        placeholder="e.g., Computer Science, Finance"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nickname</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.nickname || ''}
                        onChange={(e) => handleAdditionalInfoChange('nickname', e.target.value)}
                      />
                    </div>
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
                      <div className="checkbox-grid">
                        {['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi', 'Urdu', 'Other'].map(language => (
                          <label key={language} className="checkbox-label">
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
                    <div className="form-group">
                      <label>Hobbies</label>
                      <input
                        type="text"
                        value={memberFormData.hobbies}
                        onChange={(e) => handleMemberFormChange('hobbies', e.target.value)}
                        placeholder="e.g., Reading, Sports, Music"
                      />
                    </div>
                    <div className="form-group">
                      <label>Social Media Profiles</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.socialMediaProfiles || ''}
                        onChange={(e) => handleAdditionalInfoChange('socialMediaProfiles', e.target.value)}
                        placeholder="LinkedIn, Instagram, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Insurance Details</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.insuranceDetails || ''}
                        onChange={(e) => handleAdditionalInfoChange('insuranceDetails', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Account Info</label>
                      <input
                        type="text"
                        value={memberFormData.additionalInfo?.bankAccountInfo || ''}
                        onChange={(e) => handleAdditionalInfoChange('bankAccountInfo', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Special Notes</label>
                      <textarea
                        value={memberFormData.additionalInfo?.specialNotes || ''}
                        onChange={(e) => handleAdditionalInfoChange('specialNotes', e.target.value)}
                        rows={3}
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

                {/* Health Information */}
                <div className="form-section">
                  <h4>Health Information</h4>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Health Issues (if any)</label>
                      <textarea
                        value={memberFormData.healthIssues}
                        onChange={(e) => handleMemberFormChange('healthIssues', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Medications</label>
                      <textarea
                        value={memberFormData.medications}
                        onChange={(e) => handleMemberFormChange('medications', e.target.value)}
                        rows={2}
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
                        maxLength={14}
                      />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        value={memberFormData.panNumber}
                        onChange={(e) => handleMemberFormChange('panNumber', e.target.value)}
                        maxLength={10}
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
              </div>

              <div className="modal-footer">
                <button className="btn-success" onClick={saveMemberForm}>
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
