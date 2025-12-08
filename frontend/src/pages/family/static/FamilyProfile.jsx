import { useState, useEffect } from 'react';
import { FiUser, FiUsers, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiPlus, FiBriefcase, FiBook, FiHeart, FiFileText, FiHome } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';

const FamilyProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const [newMember, setNewMember] = useState({
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

  useEffect(() => {
    fetchFamilyProfile();
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
        {/* Family Overview */}
        <div className="static-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>Family Overview</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Family Name</label>
                <input
                  type="text"
                  value={formData.familyName}
                  onChange={(e) => handleInputChange('familyName', e.target.value)}
                  disabled={!editMode}
                  placeholder="e.g., The Sharma Family"
                />
              </div>
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
                <label>Total Members</label>
                <input
                  type="number"
                  value={formData.totalMembers}
                  onChange={(e) => handleInputChange('totalMembers', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Family Address */}
        <div className="static-section">
          <div className="section-header">
            <FiMapPin className="section-icon" />
            <h3>Family Address</h3>
          </div>
          <div className="section-content">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street</label>
                <input
                  type="text"
                  value={formData.currentAddress?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Area</label>
                <input
                  type="text"
                  value={formData.currentAddress?.area || ''}
                  onChange={(e) => handleAddressChange('area', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.currentAddress?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.currentAddress?.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={formData.currentAddress?.pincode || ''}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.currentAddress?.country || ''}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="static-section">
          <div className="section-header">
            <FiUsers className="section-icon" />
            <h3>Family Members</h3>
          </div>
          <div className="section-content">
            <div className="family-members">
              {formData.members && formData.members.length > 0 ? (
                formData.members.map((member, index) => (
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
                      </div>
                    </div>
                    {editMode && (
                      <button
                        className="btn-remove"
                        onClick={() => removeMember(index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No family members added yet.</p>
              )}

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
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation *</label>
                      <select
                        value={newMember.relation}
                        onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
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
                        value={newMember.dateOfBirth}
                        onChange={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={newMember.age}
                        onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={newMember.gender}
                        onChange={(e) => setNewMember({...newMember, gender: e.target.value})}
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
                        value={newMember.bloodGroup}
                        onChange={(e) => setNewMember({...newMember, bloodGroup: e.target.value})}
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
                        value={newMember.maritalStatus}
                        onChange={(e) => setNewMember({...newMember, maritalStatus: e.target.value})}
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    {newMember.maritalStatus === 'Married' && (
                      <div className="form-group">
                        <label>Anniversary Date</label>
                        <input
                          type="date"
                          value={newMember.anniversaryDate}
                          onChange={(e) => setNewMember({...newMember, anniversaryDate: e.target.value})}
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
                        value={newMember.mobile}
                        onChange={(e) => setNewMember({...newMember, mobile: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
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
                        value={newMember.occupation}
                        onChange={(e) => setNewMember({...newMember, occupation: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={newMember.companyName}
                        onChange={(e) => setNewMember({...newMember, companyName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Work Phone</label>
                      <input
                        type="tel"
                        value={newMember.workPhone}
                        onChange={(e) => setNewMember({...newMember, workPhone: e.target.value})}
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
                        value={newMember.education}
                        onChange={(e) => setNewMember({...newMember, education: e.target.value})}
                        placeholder="e.g., B.Tech, MBA"
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={newMember.specialization}
                        onChange={(e) => setNewMember({...newMember, specialization: e.target.value})}
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
                        value={newMember.hobbies}
                        onChange={(e) => setNewMember({...newMember, hobbies: e.target.value})}
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
                        value={newMember.healthIssues}
                        onChange={(e) => setNewMember({...newMember, healthIssues: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Medications</label>
                      <textarea
                        value={newMember.medications}
                        onChange={(e) => setNewMember({...newMember, medications: e.target.value})}
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
                        value={newMember.aadhaarNumber}
                        onChange={(e) => setNewMember({...newMember, aadhaarNumber: e.target.value})}
                        maxLength={14}
                      />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        value={newMember.panNumber}
                        onChange={(e) => setNewMember({...newMember, panNumber: e.target.value})}
                        maxLength={10}
                      />
                    </div>
                    <div className="form-group">
                      <label>Passport Number</label>
                      <input
                        type="text"
                        value={newMember.passportNumber}
                        onChange={(e) => setNewMember({...newMember, passportNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Driving License</label>
                      <input
                        type="text"
                        value={newMember.drivingLicense}
                        onChange={(e) => setNewMember({...newMember, drivingLicense: e.target.value})}
                      />
                    </div>
                  </div>

                  <button className="btn-primary" onClick={addMember}>
                    <FiPlus /> Add Member
                  </button>
                </div>
              )}
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
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), name: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input
                  type="text"
                  value={formData.emergencyContact?.relation || ''}
                  onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), relation: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={formData.emergencyContact?.mobile || ''}
                  onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), mobile: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={formData.emergencyContact?.address || ''}
                  onChange={(e) => handleInputChange('emergencyContact', {...(formData.emergencyContact || {}), address: e.target.value})}
                  disabled={!editMode}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="static-section">
          <div className="section-header">
            <FiFileText className="section-icon" />
            <h3>Additional Notes</h3>
          </div>
          <div className="section-content">
            <div className="form-group full-width">
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={!editMode}
                rows={4}
                placeholder="Add any additional notes about your family..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyProfile;
