import { useState, useEffect } from 'react';
import { FiUser, FiUsers, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiSave, FiX, FiPlus, FiBriefcase, FiBook, FiHeart, FiFileText, FiHome, FiGlobe } from 'react-icons/fi';
import { staticAPI } from '../utils/staticAPI';
import './family/static/Static.css';

// Add custom styles for info table
const infoTableStyles = `
  * {
    box-sizing: border-box;
  }
  body {
    overflow-x: hidden !important;
  }
  .static-page {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
    position: relative;
  }
  .static-content {
    overflow-x: hidden !important;
    max-width: 100% !important;
    width: 100% !important;
  }
  .static-section {
    overflow-x: hidden !important;
    max-width: 100% !important;
  }
  .section-content {
    overflow-x: hidden !important;
    max-width: 100% !important;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .info-section {
    margin-bottom: 30px;
  }
  .info-section h4 {
    color: #2c3e50;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid #667eea;
    letter-spacing: 0.5px;
  }
  .table-container {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #e1e8ed;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04);
    max-width: 100% !important;
    width: 100% !important;
    transition: all 0.3s ease;
  }
  .table-container:hover {
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12), 0 6px 15px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
  .table-wrapper {
    overflow-x: hidden !important;
    overflow-y: hidden !important;
    max-width: 100% !important;
    width: 100% !important;
  }
  .companies-table {
    width: 100%;
    min-width: auto;
    max-width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .companies-table thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  .companies-table th {
    padding: 16px 12px;
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 2px solid #2980b9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }
  .companies-table th::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  .companies-table tbody tr {
    transition: all 0.2s ease;
    border-bottom: 1px solid #ecf0f1;
    background: white;
  }
  .companies-table tbody tr:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.1);
  }
  .companies-table tbody tr:last-child {
    border-bottom: none;
  }
  .companies-table td {
    padding: 14px 12px;
    font-size: 14px;
    color: #2c3e50;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    line-height: 1.4;
  }
  .companies-table td:nth-child(1),
  .companies-table td:nth-child(2) {
    color: #667eea;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .companies-table td:nth-child(1):hover,
  .companies-table td:nth-child(2):hover {
    color: #2980b9;
    text-decoration: underline;
  }
  .companies-table td:nth-child(12),
  .companies-table td:nth-child(13) {
    white-space: normal;
    font-size: 13px;
    line-height: 1.5;
  }
  .companies-table td:nth-child(even) {
    background: rgba(248, 249, 250, 0.5);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = infoTableStyles;
  document.head.appendChild(styleSheet);
}

const FamilyProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBasicForm, setShowBasicForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
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
    drivingLicense: '',
    additionalInfo: ''
  });

  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchFamilyProfile();
  }, []);

  const fetchFamilyProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching family profile...');
      const response = await staticAPI.getBasicDetails();
      console.log('Fetch response:', response);
      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setFormData({
          // Personal Information
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          maritalStatus: data.maritalStatus || '',
          anniversaryDate: data.anniversaryDate || '',
          // Contact Information
          primaryMobile: data.primaryMobile || '',
          secondaryMobile: data.secondaryMobile || '',
          primaryEmail: data.primaryEmail || '',
          secondaryEmail: data.secondaryEmail || '',
          whatsappNumber: data.whatsappNumber || '',
          // Address Information
          currentAddress: {
            street: data.currentAddress?.street || '',
            area: data.currentAddress?.area || '',
            city: data.currentAddress?.city || '',
            state: data.currentAddress?.state || '',
            pincode: data.currentAddress?.pincode || '',
            country: data.currentAddress?.country || 'India'
          },
          permanentAddress: {
            street: data.permanentAddress?.street || '',
            area: data.permanentAddress?.area || '',
            city: data.permanentAddress?.city || '',
            state: data.permanentAddress?.state || '',
            pincode: data.permanentAddress?.pincode || '',
            country: data.permanentAddress?.country || 'India'
          },
          sameAsCurrent: data.sameAsCurrent !== undefined ? data.sameAsCurrent : true,
          // Family Information
          familyHead: data.familyHead || '',
          totalFamilyMembers: data.totalFamilyMembers || '',
          dependents: data.dependents || '',
          familyMembers: data.familyMembers || [],
          // Professional Information
          occupation: data.occupation || '',
          companyName: data.companyName || '',
          designation: data.designation || '',
          workEmail: data.workEmail || '',
          workPhone: data.workPhone || '',
          officeAddress: {
            street: data.officeAddress?.street || '',
            area: data.officeAddress?.area || '',
            city: data.officeAddress?.city || '',
            state: data.officeAddress?.state || '',
            pincode: data.officeAddress?.pincode || ''
          },
          // Additional Information
          nationality: data.nationality || 'Indian',
          religion: data.religion || '',
          caste: data.caste || '',
          motherTongue: data.motherTongue || '',
          languagesKnown: data.languagesKnown || [],
          aadhaarNumber: data.aadhaarNumber || '',
          panNumber: data.panNumber || '',
          passportNumber: data.passportNumber || '',
          voterId: data.voterId || '',
          emergencyContact: {
            name: data.emergencyContact?.name || '',
            relation: data.emergencyContact?.relation || '',
            mobile: data.emergencyContact?.mobile || '',
            address: data.emergencyContact?.address || ''
          },
          _id: data._id
        });
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
          totalFamilyMembers: '3',
          dependents: '2',
          familyMembers: [
            { 
              name: 'Jane Doe', 
              relation: 'Spouse', 
              dateOfBirth: '1992-05-20',
              age: '32', 
              gender: 'Female', 
              bloodGroup: 'A+',
              maritalStatus: 'Married',
              anniversaryDate: '2018-11-20',
              mobile: '+91 87654 32109', 
              email: 'jane.doe@email.com',
              occupation: 'Teacher',
              companyName: 'ABC School',
              workPhone: '+91 22 1234 5678',
              education: 'B.Ed',
              specialization: 'English',
              hobbies: 'Reading, Music'
            },
            { 
              name: 'Johnny Doe', 
              relation: 'Son', 
              dateOfBirth: '2016-03-10',
              age: '8', 
              gender: 'Male', 
              bloodGroup: 'B+',
              maritalStatus: 'Single',
              mobile: '', 
              email: '',
              occupation: 'Student',
              companyName: 'XYZ School',
              workPhone: '',
              education: 'Studying',
              specialization: '',
              hobbies: 'Sports, Games'
            }
          ],
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
      console.error('Error fetching family profile:', error);
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
        totalFamilyMembers: '3',
        dependents: '2',
        familyMembers: [
          { 
            name: 'Jane Doe', 
            relation: 'Spouse', 
            dateOfBirth: '1992-05-20',
            age: '32', 
            gender: 'Female', 
            bloodGroup: 'A+',
            maritalStatus: 'Married',
            anniversaryDate: '2018-11-20',
            mobile: '+91 87654 32109', 
            email: 'jane.doe@email.com',
            occupation: 'Teacher',
            companyName: 'ABC School',
            workPhone: '+91 22 1234 5678',
            education: 'B.Ed',
            specialization: 'English',
            hobbies: 'Reading, Music'
          },
          { 
            name: 'Johnny Doe', 
            relation: 'Son', 
            dateOfBirth: '2016-03-10',
            age: '8', 
            gender: 'Male', 
            bloodGroup: 'B+',
            maritalStatus: 'Single',
            mobile: '', 
            email: '',
            occupation: 'Student',
            companyName: 'XYZ School',
            workPhone: '',
            education: 'Studying',
            specialization: '',
            hobbies: 'Sports, Games'
          }
        ],
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

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languagesKnown: prev.languagesKnown.includes(language)
        ? prev.languagesKnown.filter(lang => lang !== language)
        : [...prev.languagesKnown, language]
    }));
  };

  const addFamilyMember = () => {
    if (newMember.name && newMember.relation) {
      setFormData(prev => ({
        ...prev,
        familyMembers: [...prev.familyMembers, { ...newMember }],
        totalFamilyMembers: (parseInt(prev.totalFamilyMembers) + 1).toString()
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

  const editFamilyMember = (index) => {
    const member = formData.familyMembers[index];
    if (!member) {
      return;
    }
    setEditingMember(index);
    setNewMember({...member});
    
    // Scroll to the add member form
    setTimeout(() => {
      const addMemberSection = document.querySelector('.add-member-section');
      if (addMemberSection) {
        addMemberSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const updateFamilyMember = () => {
    if (editingMember !== null && newMember.name && newMember.relation) {
      setFormData(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.map((member, index) => 
          index === editingMember ? {...newMember} : member
        )
      }));
      setEditingMember(null);
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
        drivingLicense: '',
        additionalInfo: ''
      });
    }
  };

  const cancelEdit = () => {
    setEditingMember(null);
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
      drivingLicense: '',
      additionalInfo: ''
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('Saving family profile data:', formData);
      let response;
      
      if (formData._id) {
        console.log('Updating existing record with ID:', formData._id);
        response = await staticAPI.updateBasicDetails(formData._id, formData);
      } else {
        console.log('Creating new record');
        response = await staticAPI.createBasicDetails(formData);
      }
      
      console.log('Save response:', response);
      console.log('Response data:', response.data);
      setFormData(response.data);
      setEditMode(false);
      alert('Family profile saved successfully!');
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

  if (loading && !formData.firstName) {
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
        {/* Basic Information Header */}
        <div className="static-section">
          <div className="section-header">
            <FiUser className="section-icon" />
            <h3>Basic Information</h3>
          </div>
          <div className="section-content">
            {editMode ? (
              // Show form when in edit mode
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={formData.gender || ''}
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
                      value={formData.bloodGroup || ''}
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
                      value={formData.maritalStatus || ''}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
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
                        value={formData.anniversaryDate || ''}
                        onChange={(e) => handleInputChange('anniversaryDate', e.target.value)}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Primary Mobile</label>
                    <input
                      type="tel"
                      value={formData.primaryMobile || ''}
                      onChange={(e) => handleInputChange('primaryMobile', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Secondary Mobile</label>
                    <input
                      type="tel"
                      value={formData.secondaryMobile || ''}
                      onChange={(e) => handleInputChange('secondaryMobile', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Primary Email</label>
                    <input
                      type="email"
                      value={formData.primaryEmail || ''}
                      onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Address Information */}
                <div className="form-row">
                  <h4 style={{width: '100%', marginBottom: '20px', color: '#495057'}}>Address Information</h4>
                  <div className="form-group">
                    <label>Current Street</label>
                    <input
                      type="text"
                      value={formData.currentAddress?.street || ''}
                      onChange={(e) => handleAddressChange('currentAddress', 'street', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Area</label>
                    <input
                      type="text"
                      value={formData.currentAddress?.area || ''}
                      onChange={(e) => handleAddressChange('currentAddress', 'area', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current City</label>
                    <input
                      type="text"
                      value={formData.currentAddress?.city || ''}
                      onChange={(e) => handleAddressChange('currentAddress', 'city', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current State</label>
                    <input
                      type="text"
                      value={formData.currentAddress?.state || ''}
                      onChange={(e) => handleAddressChange('currentAddress', 'state', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Pincode</label>
                    <input
                      type="text"
                      value={formData.currentAddress?.pincode || ''}
                      onChange={(e) => handleAddressChange('currentAddress', 'pincode', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent Street</label>
                    <input
                      type="text"
                      value={formData.permanentAddress?.street || ''}
                      onChange={(e) => handleAddressChange('permanentAddress', 'street', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent Area</label>
                    <input
                      type="text"
                      value={formData.permanentAddress?.area || ''}
                      onChange={(e) => handleAddressChange('permanentAddress', 'area', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent City</label>
                    <input
                      type="text"
                      value={formData.permanentAddress?.city || ''}
                      onChange={(e) => handleAddressChange('permanentAddress', 'city', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent State</label>
                    <input
                      type="text"
                      value={formData.permanentAddress?.state || ''}
                      onChange={(e) => handleAddressChange('permanentAddress', 'state', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent Pincode</label>
                    <input
                      type="text"
                      value={formData.permanentAddress?.pincode || ''}
                      onChange={(e) => handleAddressChange('permanentAddress', 'pincode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Show table when not in edit mode
              <div className="info-table">
                <div className="info-section">
                  <h4>Basic Information</h4>
                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="companies-table">
                        <thead>
                          <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Date of Birth</th>
                            <th>Gender</th>
                            <th>Blood Group</th>
                            <th>Marital Status</th>
                            {formData.anniversaryDate && <th>Anniversary Date</th>}
                            <th>Primary Mobile</th>
                            <th>Secondary Mobile</th>
                            <th>Primary Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea', fontWeight: '500' }}
                            >
                              {formData.firstName || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea', fontWeight: '500' }}
                            >
                              {formData.lastName || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.dateOfBirth || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.gender || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.bloodGroup || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.maritalStatus || 'N/A'}
                            </td>
                            {formData.anniversaryDate && (
                              <td 
                                onClick={() => setEditMode(true)}
                                style={{ cursor: 'pointer', color: '#667eea' }}
                              >
                                {formData.anniversaryDate}
                              </td>
                            )}
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.primaryMobile || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.secondaryMobile || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.primaryEmail || 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
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
          </div>
          <div className="section-content">
                    {editMode ? (
                      // Show family form when in edit mode
                      <div className="form-section">
                        <div className="form-row">
                          <h4 style={{width: '100%', marginBottom: '20px', color: '#2c3e50'}}>Family Details</h4>
                          <div className="form-group">
                            <label>Family Head</label>
                            <input
                              type="text"
                              value={formData.familyHead || ''}
                              onChange={(e) => handleInputChange('familyHead', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Total Family Members</label>
                            <input
                              type="number"
                              value={formData.totalFamilyMembers || ''}
                              onChange={(e) => handleInputChange('totalFamilyMembers', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Dependents</label>
                            <input
                              type="number"
                              value={formData.dependents || ''}
                              onChange={(e) => handleInputChange('dependents', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Show family table when not in edit mode
                      <div className="info-table">
                        <div className="info-section">
                          <h4>Family Details</h4>
                          <div className="table-container">
                            <div className="table-wrapper">
                              <table className="companies-table">
                                <thead>
                                  <tr>
                                    <th>Family Head</th>
                                    <th>Total Members</th>
                                    <th>Dependents</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td 
                                      onClick={() => setEditMode(true)}
                                      style={{ cursor: 'pointer', color: '#667eea', fontWeight: '700', fontSize: '15px' }}
                                    >
                                      {formData.familyHead || 'N/A'}
                                    </td>
                                    <td 
                                      onClick={() => setEditMode(true)}
                                      style={{ cursor: 'pointer', color: '#667eea' }}
                                    >
                                      {formData.totalFamilyMembers || 'N/A'}
                                    </td>
                                    <td 
                                      onClick={() => setEditMode(true)}
                                      style={{ cursor: 'pointer', color: '#667eea' }}
                                    >
                                      {formData.dependents || 'N/A'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        
                        {/* Family Members Table */}
                        <div className="info-section">
                          <h4>Family Members</h4>
                          <div className="table-container">
                            <div className="table-wrapper">
                              <table className="companies-table">
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
                                    <th>Company</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(formData.familyMembers || []).map((member, index) => (
                                    <tr key={index}>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea', fontWeight: '700', fontSize: '15px' }}
                                      >
                                        {member.name || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.relation || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.dateOfBirth || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.age || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.gender || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.bloodGroup || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.maritalStatus || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.mobile || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.email || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.occupation || 'N/A'}
                                      </td>
                                      <td 
                                        onClick={() => setEditMode(true)}
                                        style={{ cursor: 'pointer', color: '#667eea' }}
                                      >
                                        {member.companyName || 'N/A'}
                                      </td>
                                      <td className="table-actions">
                                        {editMode && (
                                          <div style={{display: 'flex', gap: '5px'}}>
                                            <button
                                              className="btn-edit"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                editFamilyMember(index);
                                              }}
                                              style={{
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                              }}
                                              title="Edit Family Member"
                                            >
                                              <FiEdit2 />
                                            </button>
                                            <button
                                              className="btn-remove"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeFamilyMember(index);
                                              }}
                                              style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                              }}
                                              title="Delete Family Member"
                                            >
                                              <FiX />
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Add Member Section - Always visible in edit mode */}
                    {editMode && (
                      <div className="add-member-section">
                        <div className="add-member-header" style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h5 style={{ 
                      margin: 0, 
                      color: '#495057',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {editingMember !== null ? 'Edit Family Member' : 'Add New Family Member'}
                    </h5>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className={editingMember !== null ? "btn-update-member" : "btn-add-member"} 
                        onClick={editingMember !== null ? updateFamilyMember : addFamilyMember}
                        style={{
                          background: editingMember !== null ? '#28a745' : '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = editingMember !== null ? '#218838' : '#0056b3';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = editingMember !== null ? '#28a745' : '#007bff';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {editingMember !== null ? <FiSave /> : <FiPlus />} 
                        {editingMember !== null ? 'Update' : 'Add'} Member
                      </button>
                      {editingMember !== null && (
                        <button 
                          className="btn-cancel-edit" 
                          onClick={cancelEdit}
                          style={{
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#5a6268';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = '#6c757d';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <FiX /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="add-member-form">
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
                        <input
                          type="text"
                          value={newMember.relation}
                          onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
                          placeholder="e.g., Son, Daughter, Spouse"
                        />
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
                          type="text"
                          value={newMember.age}
                          onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                          placeholder="Age"
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
                        <label>Mobile</label>
                        <input
                          type="tel"
                          value={newMember.mobile}
                          onChange={(e) => setNewMember({...newMember, mobile: e.target.value})}
                          placeholder="Mobile number"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                          placeholder="Email address"
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
                          placeholder="Occupation"
                        />
                      </div>
                      <div className="form-group">
                        <label>Company</label>
                        <input
                          type="text"
                          value={newMember.companyName}
                          onChange={(e) => setNewMember({...newMember, companyName: e.target.value})}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Work Phone</label>
                        <input
                          type="tel"
                          value={newMember.workPhone}
                          onChange={(e) => setNewMember({...newMember, workPhone: e.target.value})}
                          placeholder="Work phone"
                        />
                      </div>
                      <div className="form-group">
                        <label>Education</label>
                        <input
                          type="text"
                          value={newMember.education}
                          onChange={(e) => setNewMember({...newMember, education: e.target.value})}
                          placeholder="Education qualification"
                        />
                      </div>
                      <div className="form-group">
                        <label>Specialization</label>
                        <input
                          type="text"
                          value={newMember.specialization}
                          onChange={(e) => setNewMember({...newMember, specialization: e.target.value})}
                          placeholder="Specialization"
                        />
                      </div>
                      <div className="form-group">
                        <label>Hobbies</label>
                        <input
                          type="text"
                          value={newMember.hobbies}
                          onChange={(e) => setNewMember({...newMember, hobbies: e.target.value})}
                          placeholder="Hobbies and interests"
                        />
                      </div>
                    </div>

                    {/* Health Information */}
                    <h6>Health Information</h6>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Health Issues</label>
                        <textarea
                          value={newMember.healthIssues}
                          onChange={(e) => setNewMember({...newMember, healthIssues: e.target.value})}
                          placeholder="Any health conditions or issues"
                          rows={2}
                        />
                      </div>
                      <div className="form-group">
                        <label>Medications</label>
                        <textarea
                          value={newMember.medications}
                          onChange={(e) => setNewMember({...newMember, medications: e.target.value})}
                          placeholder="Current medications"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Document Information */}
                    <h6>Document Information</h6>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Aadhaar Number</label>
                        <input
                          type="text"
                          value={newMember.aadhaarNumber}
                          onChange={(e) => setNewMember({...newMember, aadhaarNumber: e.target.value})}
                          placeholder="Aadhaar number"
                        />
                      </div>
                      <div className="form-group">
                        <label>PAN Number</label>
                        <input
                          type="text"
                          value={newMember.panNumber}
                          onChange={(e) => setNewMember({...newMember, panNumber: e.target.value})}
                          placeholder="PAN number"
                        />
                      </div>
                      <div className="form-group">
                        <label>Passport Number</label>
                        <input
                          type="text"
                          value={newMember.passportNumber}
                          onChange={(e) => setNewMember({...newMember, passportNumber: e.target.value})}
                          placeholder="Passport number"
                        />
                      </div>
                      <div className="form-group">
                        <label>Driving License</label>
                        <input
                          type="text"
                          value={newMember.drivingLicense}
                          onChange={(e) => setNewMember({...newMember, drivingLicense: e.target.value})}
                          placeholder="Driving license number"
                        />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <h6>Additional Information</h6>
                    <div className="form-group full-width">
                      <label>Additional Information</label>
                      <textarea
                        value={newMember.additionalInfo}
                        onChange={(e) => setNewMember({...newMember, additionalInfo: e.target.value})}
                        placeholder="Any additional information about the family member"
                        rows={3}
                      />
                    </div>
                  </div>
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
            {editMode ? (
              // Show form when in edit mode
              <>
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

                <div className="address-section">
                <h4>Office Address</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Street</label>
                    <input
                      type="text"
                      value={formData.officeAddress?.street || ''}
                      onChange={(e) => handleAddressChange('officeAddress', 'street', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.officeAddress?.city || ''}
                      onChange={(e) => handleAddressChange('officeAddress', 'city', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.officeAddress?.state || ''}
                      onChange={(e) => handleAddressChange('officeAddress', 'state', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={formData.officeAddress?.pincode || ''}
                      onChange={(e) => handleAddressChange('officeAddress', 'pincode', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>
            </>
            ) : (
              // Show professional table when not in edit mode
              <div className="info-table">
                <div className="info-section">
                  <h4>Professional Details</h4>
                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="companies-table">
                        <thead>
                          <tr>
                            <th>Occupation</th>
                            <th>Company Name</th>
                            <th>Designation</th>
                            <th>Work Email</th>
                            <th>Work Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.occupation || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.companyName || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.designation || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.workEmail || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.workPhone || 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Office Address</h4>
                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="companies-table">
                        <thead>
                          <tr>
                            <th>Street</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Pincode</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.officeAddress?.street || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.officeAddress?.city || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.officeAddress?.state || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.officeAddress?.pincode || 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="static-section">
          <div className="section-header">
            <FiGlobe className="section-icon" />
            <h3>Additional Information</h3>
          </div>
          <div className="section-content">
            {editMode ? (
              // Show form when in edit mode
              <>
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
                  <div className="form-group">
                    <label>Languages Known</label>
                    <div className="checkbox-group">
                      {['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi', 'Urdu', 'Other'].map(language => (
                        <label key={language} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(formData.languagesKnown || []).includes(language)}
                            onChange={() => handleLanguageToggle(language)}
                            disabled={!editMode}
                          />
                          {language}
                        </label>
                      ))}
                    </div>
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
                  />
                </div>
                <div className="form-group">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
                    disabled={!editMode}
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
              </>
            ) : (
              // Show additional table when not in edit mode
              <div className="info-table">
                <div className="info-section">
                  <h4>Additional Details</h4>
                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="companies-table">
                        <thead>
                          <tr>
                            <th>Nationality</th>
                            <th>Religion</th>
                            <th>Caste</th>
                            <th>Mother Tongue</th>
                            <th>Languages Known</th>
                            <th>Aadhaar Number</th>
                            <th>PAN Number</th>
                            <th>Passport Number</th>
                            <th>Voter ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.nationality || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.religion || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.caste || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.motherTongue || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {(formData.languagesKnown || []).join(', ') || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.aadhaarNumber || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.panNumber || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.passportNumber || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.voterId || 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="static-section">
          <div className="section-header">
            <FiPhone className="section-icon" />
            <h3>Emergency Contact</h3>
          </div>
          <div className="section-content">
            {editMode ? (
              // Show form when in edit mode
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
            ) : (
              // Show emergency contact table when not in edit mode
              <div className="info-table">
                <div className="info-section">
                  <h4>Emergency Contact Details</h4>
                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="companies-table">
                        <thead>
                          <tr>
                            <th>Contact Name</th>
                            <th>Relation</th>
                            <th>Mobile Number</th>
                            <th>Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.emergencyContact?.name || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.emergencyContact?.relation || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.emergencyContact?.mobile || 'N/A'}
                            </td>
                            <td 
                              onClick={() => setEditMode(true)}
                              style={{ cursor: 'pointer', color: '#667eea' }}
                            >
                              {formData.emergencyContact?.address || 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default FamilyProfile;
