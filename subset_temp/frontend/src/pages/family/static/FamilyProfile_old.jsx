import { useState, useEffect } from 'react';
import { FiUser, FiUsers, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiPlus, FiBriefcase, FiBook, FiHeart, FiFileText } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';

const FamilyProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Family Overview
    familyName: '',
    familyHead: '',
    totalMembers: '',
    // Family Members
    members: [],
    // Family Address
    currentAddress: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    // Emergency Contact
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
        setFormData(response.data[0]);
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
        ...prev.currentAddress,
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
            <p>High-level summary of your family’s core information</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Lock Form' : 'Edit Form'}
          </button>
          <button className="btn-success" onClick={() => {
            resetForm();
            setEditMode(true);
          }}>
            <FiPlus /> New Entry
          </button>
        </div>
      </div>

      {editMode && (
        <div className="static-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>Profile Information</h3>
          </div>
          <div className="section-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Family Name</label>
                  <input type="text" value={formData.familyName} onChange={(e) => setFormData({ ...formData, familyName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Family Head</label>
                  <input type="text" value={formData.familyHead} onChange={(e) => setFormData({ ...formData, familyHead: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Total Members</label>
                  <input type="number" value={formData.totalMembers} onChange={(e) => setFormData({ ...formData, totalMembers: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Primary Phone</label>
                  <input type="tel" value={formData.primaryPhone} onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Primary Email</label>
                  <input type="email" value={formData.primaryEmail} onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input type="text" value={formData.emergencyName} onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input type="tel" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>

              <div className="header-actions">
                <button type="submit" className="btn-success">
                  {editingIndex !== null ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => {
                  resetForm();
                  setEditMode(false);
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="static-section">
          <div className="section-header">
            <FiUsers className="section-icon" />
            <h3>Saved Profiles</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Family</th>
                    <th>Head</th>
                    <th>Members</th>
                    <th>City</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.familyName}</td>
                      <td>{e.familyHead}</td>
                      <td>{e.totalMembers}</td>
                      <td>{e.city}</td>
                      <td>{e.primaryPhone}</td>
                      <td>{e.primaryEmail}</td>
                      <td>
                        <div className="investment-actions">
                          <button onClick={() => handleEdit(idx)} className="btn-icon"><FiEdit2 /></button>
                          <button onClick={() => handleDelete(idx)} className="btn-icon btn-danger"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyProfile;
