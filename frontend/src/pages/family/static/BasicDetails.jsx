import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiUsers, FiHome, FiBriefcase, FiGlobe, FiPlus } from 'react-icons/fi';
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
    }
  });

  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    relation: '',
    age: '',
    gender: '',
    occupation: '',
    mobile: '',
    email: ''
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
        age: '',
        gender: '',
        occupation: '',
        mobile: '',
        email: ''
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
                      <p><strong>Age:</strong> {member.age} | <strong>Gender:</strong> {member.gender}</p>
                      <p><strong>Occupation:</strong> {member.occupation}</p>
                      <p><strong>Mobile:</strong> {member.mobile || 'N/A'}</p>
                      <p><strong>Email:</strong> {member.email || 'N/A'}</p>
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
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={newFamilyMember.name}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation</label>
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
                        <option value="Other">Other</option>
                      </select>
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
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={newFamilyMember.occupation}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, occupation: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="tel"
                        value={newFamilyMember.mobile}
                        onChange={(e) => setNewFamilyMember({...newFamilyMember, mobile: e.target.value})}
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
      </div>
    </div>
  );
};

export default BasicDetails;
