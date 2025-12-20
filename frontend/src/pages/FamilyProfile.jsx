import { useState, useEffect } from 'react';
import { FiUsers, FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { staticAPI } from '../utils/staticAPI';
import { syncMobileEmailFromFamilyProfile } from '../utils/mobileEmailSyncUtil';
import './family/static/Static.css';
import '../components/Modal.css';

const FamilyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [members, setMembers] = useState([]);
  const languageOptions = [
    'Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu',
    'Kannada', 'Malayalam', 'Punjabi', 'Bengali', 'Urdu', 'Odia',
    'Assamese', 'Rajasthani', 'Konkani', 'Sindhi', 'Others'
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
    additionalInfo: {
      nickname: '',
      nationality: 'Indian',
      religion: '',
      caste: '',
      motherTongue: '',
      languagesKnown: [],
      voterID: '',
      residentialAddress: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactMobile: '',
      emergencyContactAddress: '',
      alternatePhone: '',
      workAddress: '',
      socialMediaProfile1: '',
      socialMediaProfile2: '',
      socialMediaProfile3: '',
      socialMediaProfile4: '',
      specialNotes: ''
    }
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
        residentialAddress: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactMobile: '',
        emergencyContactAddress: '',
        alternatePhone: '',
        workAddress: '',
        socialMediaProfile1: '',
        socialMediaProfile2: '',
        socialMediaProfile3: '',
        socialMediaProfile4: '',
        insuranceDetails: '',
        bankAccountInfo: '',
        specialNotes: ''
      }
    });
    setShowMemberForm(true);
  };

  const handleEditMember = (member, index) => {
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
        residentialAddress: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactMobile: '',
        emergencyContactAddress: '',
        alternatePhone: '',
        workAddress: '',
        socialMediaProfile1: '',
        socialMediaProfile2: '',
        socialMediaProfile3: '',
        socialMediaProfile4: '',
        insuranceDetails: '',
        bankAccountInfo: '',
        specialNotes: ''
      }
    });
    setShowMemberForm(true);
  };

  const calculateAgeFromDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? age.toString() : '';
  };

  const handleMemberFormChange = (field, value) => {
    setMemberFormData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };
      
      // Auto-calculate age when dateOfBirth changes
      if (field === 'dateOfBirth') {
        updatedData.age = calculateAgeFromDateOfBirth(value);
      }
      
      return updatedData;
    });
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

      // Auto-sync mobile and email to Mobile & Email Details
      await syncMobileEmailFromFamilyProfile(memberFormData);

      setShowMemberForm(false);
      setEditingMemberIndex(null);
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  const deleteMember = async (index) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
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
                      <th>Number</th>
                      <th>Date of Birth</th>
                      <th>Anniversary</th>
                      <th>Blood Group</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={index}>
                        <td>{member.name}</td>
                        <td>{member.mobile || 'N/A'}</td>
                        <td>{member.dateOfBirth || 'N/A'}</td>
                        <td>{member.anniversaryDate || 'N/A'}</td>
                        <td>{member.bloodGroup || 'N/A'}</td>
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
            <div className="modal-content large">
              <div className="modal-header">
                <h2>{editingMemberIndex !== null ? 'Edit Member' : 'Add New Member'}</h2>
                <button className="btn-close" onClick={cancelMemberForm}>
                  <FiX />
                </button>
              </div>

              <div className="modal-form">
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
                        readOnly
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
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
                      <div className="form-group">
                        <label>Specialization</label>
                        <input
                          type="text"
                          value={memberFormData.specialization}
                          onChange={(e) => handleMemberFormChange('specialization', e.target.value)}
                          placeholder="e.g., Computer Science, Cardiology"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Health & Documents</h4>
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
                        <label>Medications</label>
                        <input
                          type="text"
                          value={memberFormData.medications}
                          onChange={(e) => handleMemberFormChange('medications', e.target.value)}
                          placeholder="Regular medications"
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
                      <div className="form-group">
                        <label>Passport Number</label>
                        <input
                          type="text"
                          value={memberFormData.passportNumber}
                          onChange={(e) => handleMemberFormChange('passportNumber', e.target.value)}
                          placeholder="P1234567"
                        />
                      </div>
                      <div className="form-group">
                        <label>Driving License</label>
                        <input
                          type="text"
                          value={memberFormData.drivingLicense}
                          onChange={(e) => handleMemberFormChange('drivingLicense', e.target.value)}
                          placeholder="DL Number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Cultural & Personal Details</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nickname</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.nickname || ''}
                          onChange={(e) => handleAdditionalInfoChange('nickname', e.target.value)}
                          placeholder="Nickname"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nationality</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.nationality || 'Indian'}
                          onChange={(e) => handleAdditionalInfoChange('nationality', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Religion</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.religion || ''}
                          onChange={(e) => handleAdditionalInfoChange('religion', e.target.value)}
                          placeholder="Religion"
                        />
                      </div>
                      <div className="form-group">
                        <label>Caste</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.caste || ''}
                          onChange={(e) => handleAdditionalInfoChange('caste', e.target.value)}
                          placeholder="Caste"
                        />
                      </div>
                      <div className="form-group">
                        <label>Mother Tongue</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.motherTongue || ''}
                          onChange={(e) => handleAdditionalInfoChange('motherTongue', e.target.value)}
                          placeholder="Mother Tongue"
                        />
                      </div>
                      <div className="form-group">
                        <label>Voter ID</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.voterID || ''}
                          onChange={(e) => handleAdditionalInfoChange('voterID', e.target.value)}
                          placeholder="Voter ID Number"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Languages Known</label>
                        <div className="language-checkboxes">
                          {languageOptions.map(lang => (
                            <label key={lang} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={(memberFormData.additionalInfo?.languagesKnown || []).includes(lang)}
                                onChange={() => handleLanguageToggle(lang)}
                              />
                              {lang}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Address Information</h4>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Residential Address</label>
                        <textarea
                          value={memberFormData.additionalInfo?.residentialAddress || ''}
                          onChange={(e) => handleAdditionalInfoChange('residentialAddress', e.target.value)}
                          placeholder="Home/Residential Address"
                          rows="3"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Work Address</label>
                        <textarea
                          value={memberFormData.additionalInfo?.workAddress || ''}
                          onChange={(e) => handleAdditionalInfoChange('workAddress', e.target.value)}
                          placeholder="Office Address"
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Emergency Contact & Other Details</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Emergency Contact Name</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.emergencyContactName || ''}
                          onChange={(e) => handleAdditionalInfoChange('emergencyContactName', e.target.value)}
                          placeholder="Contact Person Name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Emergency Contact Relation</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.emergencyContactRelation || ''}
                          onChange={(e) => handleAdditionalInfoChange('emergencyContactRelation', e.target.value)}
                          placeholder="Relation"
                        />
                      </div>
                      <div className="form-group">
                        <label>Emergency Contact Mobile</label>
                        <input
                          type="tel"
                          value={memberFormData.additionalInfo?.emergencyContactMobile || ''}
                          onChange={(e) => handleAdditionalInfoChange('emergencyContactMobile', e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="form-group">
                        <label>Alternate Phone</label>
                        <input
                          type="tel"
                          value={memberFormData.additionalInfo?.alternatePhone || ''}
                          onChange={(e) => handleAdditionalInfoChange('alternatePhone', e.target.value)}
                          placeholder="Alternate Number"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Emergency Contact Address</label>
                        <textarea
                          value={memberFormData.additionalInfo?.emergencyContactAddress || ''}
                          onChange={(e) => handleAdditionalInfoChange('emergencyContactAddress', e.target.value)}
                          placeholder="Full Address"
                          rows="2"
                        />
                      </div>
                      <div className="form-group">
                        <label>Social Media Profile 1</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.socialMediaProfile1 || ''}
                          onChange={(e) => handleAdditionalInfoChange('socialMediaProfile1', e.target.value)}
                          placeholder="Social media profile 1"
                        />
                      </div>
                      <div className="form-group">
                        <label>Social Media Profile 2</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.socialMediaProfile2 || ''}
                          onChange={(e) => handleAdditionalInfoChange('socialMediaProfile2', e.target.value)}
                          placeholder="Social media profile 2"
                        />
                      </div>
                      <div className="form-group">
                        <label>Social Media Profile 3</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.socialMediaProfile3 || ''}
                          onChange={(e) => handleAdditionalInfoChange('socialMediaProfile3', e.target.value)}
                          placeholder="Social media profile 3"
                        />
                      </div>
                      <div className="form-group">
                        <label>Social Media Profile 4</label>
                        <input
                          type="text"
                          value={memberFormData.additionalInfo?.socialMediaProfile4 || ''}
                          onChange={(e) => handleAdditionalInfoChange('socialMediaProfile4', e.target.value)}
                          placeholder="Social media profile 4"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Special Notes</label>
                        <textarea
                          value={memberFormData.additionalInfo?.specialNotes || ''}
                          onChange={(e) => handleAdditionalInfoChange('specialNotes', e.target.value)}
                          placeholder="Any other important information"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={cancelMemberForm}>
                      <FiX /> Cancel
                    </button>
                    <button className="save-btn" onClick={saveMemberForm}>
                      <FiSave /> Save Member
                    </button>
                  </div>
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