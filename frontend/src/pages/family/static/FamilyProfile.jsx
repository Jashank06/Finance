import { useState, useEffect } from 'react';
import { FiUsers, FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';
import '../../../components/Modal.css';
import { syncMobileEmailFromFamilyProfile } from '../../../utils/mobileEmailSyncUtil';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const FamilyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [members, setMembers] = useState([]);
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
    hobbies: '',
    healthIssues: '',
    aadhaarNumber: '',
    panNumber: ''
  });

  useEffect(() => {
    trackFeatureUsage('/family/static/family-profile', 'view');
    fetchFamilyProfile();
  }, []);

  const fetchFamilyProfile = async () => {
    try {
      setLoading(true);
      const response = await staticAPI.getFamilyProfile();
      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching family profile:', error);
    } finally {
      setLoading(false);
    }
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
      hobbies: '',
      healthIssues: '',
      aadhaarNumber: '',
      panNumber: ''
    });
    setShowMemberForm(true);
  };

  const handleEditMember = (member, index) => {
    setEditingMemberIndex(index);
    setMemberFormData(member);
    setShowMemberForm(true);
  };

  const handleMemberFormChange = (field, value) => {
    setMemberFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveMemberForm = async () => {
    try {
      let updatedMembers;
      if (editingMemberIndex !== null) {
        // Update existing member
        updatedMembers = [...members];
        updatedMembers[editingMemberIndex] = memberFormData;
      } else {
        // Add new member
        updatedMembers = [...members, memberFormData];
      }

      setMembers(updatedMembers);

      // Save to backend
      const profileData = {
        members: updatedMembers,
        totalMembers: updatedMembers.length.toString()
      };

      const response = await staticAPI.getFamilyProfile();
      if (response.data && response.data.length > 0) {
        await staticAPI.updateFamilyProfile(response.data[0]._id, profileData);
      } else {
        await staticAPI.createFamilyProfile(profileData);
      }

      // Sync to Mobile & Email Details
      const syncResult = await syncMobileEmailFromFamilyProfile(memberFormData);
      if (syncResult.count > 0) {
        alert(`Synced ${syncResult.count} contact(s) to Mobile & Email Details`);
      }

      setShowMemberForm(false);
      setEditingMemberIndex(null);
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  const deleteMember = async (index) => {
    if (confirm('Are you sure you want to delete this member?')) {
      try {
        const updatedMembers = members.filter((_, i) => i !== index);
        setMembers(updatedMembers);

        // Save to backend
        const profileData = {
          members: updatedMembers,
          totalMembers: updatedMembers.length.toString()
        };

        const response = await staticAPI.getFamilyProfile();
        if (response.data && response.data.length > 0) {
          await staticAPI.updateFamilyProfile(response.data[0]._id, profileData);
        }
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const cancelMemberForm = () => {
    setShowMemberForm(false);
    setEditingMemberIndex(null);
  };



  if (loading) {
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
        {/* Family Members Table */}
        <div className="static-section">
          <div className="section-header">
            <FiUsers className="section-icon" />
            <h3>Family Members</h3>
            <button className="btn-primary" onClick={handleAddNewMember}>
              <FiPlus /> Add Member
            </button>
          </div>
          <div className="section-content">
            {members && members.length > 0 ? (
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
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Occupation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={index}>
                        <td>{member.name}</td>
                        <td>{member.relation}</td>
                        <td>{member.dateOfBirth || 'N/A'}</td>
                        <td>{member.age || 'N/A'}</td>
                        <td>{member.gender || 'N/A'}</td>
                        <td>{member.bloodGroup || 'N/A'}</td>
                        <td>{member.maritalStatus || 'N/A'}</td>
                        <td>{member.mobile || 'N/A'}</td>
                        <td>{member.email || 'N/A'}</td>
                        <td>{member.occupation || 'N/A'}</td>
                        <td>
                          <button
                            className="btn-icon"
                            onClick={() => handleEditMember(member, index)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => deleteMember(index)}
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
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingMemberIndex !== null ? 'Edit Member' : 'Add New Member'}</h2>
                <button className="btn-close" onClick={cancelMemberForm}>
                  <FiX />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={memberFormData.name}
                        onChange={(e) => handleMemberFormChange('name', e.target.value)}
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation *</label>
                      <select
                        value={memberFormData.relation}
                        onChange={(e) => handleMemberFormChange('relation', e.target.value)}
                        required
                      >
                        <option value="">Select Relation</option>
                        <option value="Self">Self</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Cousin">Cousin</option>
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
                        placeholder="Age"
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

                <div className="form-section">
                  <h4>Contact Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="tel"
                        value={memberFormData.mobile}
                        onChange={(e) => handleMemberFormChange('mobile', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={memberFormData.email}
                        onChange={(e) => handleMemberFormChange('email', e.target.value)}
                        placeholder="john.doe@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Work Phone</label>
                      <input
                        type="tel"
                        value={memberFormData.workPhone}
                        onChange={(e) => handleMemberFormChange('workPhone', e.target.value)}
                        placeholder="Office Number"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Professional & Educational Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={memberFormData.occupation}
                        onChange={(e) => handleMemberFormChange('occupation', e.target.value)}
                        placeholder="e.g., Engineer, Doctor"
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={memberFormData.companyName}
                        onChange={(e) => handleMemberFormChange('companyName', e.target.value)}
                        placeholder="Where they work"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Education</label>
                      <input
                        type="text"
                        value={memberFormData.education}
                        onChange={(e) => handleMemberFormChange('education', e.target.value)}
                        placeholder="e.g., B.Tech, MBA, 12th"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Hobbies</label>
                      <input
                        type="text"
                        value={memberFormData.hobbies}
                        onChange={(e) => handleMemberFormChange('hobbies', e.target.value)}
                        placeholder="Reading, Sports, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Health Issues</label>
                      <input
                        type="text"
                        value={memberFormData.healthIssues}
                        onChange={(e) => handleMemberFormChange('healthIssues', e.target.value)}
                        placeholder="Any known health conditions"
                      />
                    </div>
                    <div className="form-group">
                      <label>Aadhaar Number</label>
                      <input
                        type="text"
                        value={memberFormData.aadhaarNumber}
                        onChange={(e) => handleMemberFormChange('aadhaarNumber', e.target.value)}
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        value={memberFormData.panNumber}
                        onChange={(e) => handleMemberFormChange('panNumber', e.target.value)}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-success" onClick={saveMemberForm}>
                    <FiSave /> Save Member
                  </button>
                  <button className="btn-secondary" onClick={cancelMemberForm}>
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyProfile;
