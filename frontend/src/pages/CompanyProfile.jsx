import { useState, useEffect } from 'react';
import { FiBriefcase, FiPhone, FiMail, FiMapPin, FiEdit2, FiSave, FiX, FiUsers, FiHome, FiGlobe, FiPlus, FiCalendar } from 'react-icons/fi';
import { staticAPI } from '../utils/staticAPI';
import './family/static/Static.css';

const CompanyProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
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
    fetchCompanyRecords();
  }, []);

  const fetchCompanyRecords = async () => {
    try {
      setLoading(true);
      const response = await staticAPI.getCompanyRecords();
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching company records:', error);
      // Set demo data if API fails
      setCompanies([
        {
          id: 'demo-1',
          companyName: 'Tech Solutions Pvt Ltd',
          companyType: 'Private Limited',
          industry: 'IT Services',
          registrationNumber: 'ROC-12345',
          incorporationDate: '2020-01-15',
          panNumber: 'AAACT1234C',
          gstNumber: '27AAACT1234C1ZV',
          registeredOffice: {
            address: '123 Tech Park, Sector 15',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: '+91 22 1234 5678',
            email: 'info@techsolutions.com',
            website: 'www.techsolutions.com'
          },
          directors: [
            { name: 'John Doe', din: '12345678', appointmentDate: '2020-01-15' },
            { name: 'Jane Smith', din: '87654321', appointmentDate: '2020-01-15' }
          ],
          turnover: '50000000',
          employeeCount: '50'
        }
      ]);
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

  const handleSameAsRegisteredChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsRegistered: checked,
      corporateOffice: checked 
        ? { ...prev.registeredOffice } 
        : prev.corporateOffice || {
            address: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            phone: '',
            email: ''
          }
    }));
  };

  const addDirector = () => {
    setFormData(prev => ({
      ...prev,
      directors: [...prev.directors, { 
        name: '', 
        din: '', 
        appointmentDate: '',
        mcaMobileNumber: '',
        mcaEmailId: '',
        gstMobileNumber: '',
        gstEmailId: '',
        bankMobileNumber: '',
        bankEmailId: '',
        additional: ''
      }]
    }));
  };

  const updateDirector = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.map((director, i) => 
        i === index ? { ...director, [field]: value } : director
      )
    }));
  };

  const removeDirector = (index) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }));
  };

  const addBankAccount = () => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { 
        bankName: '', 
        accountNumber: '', 
        accountType: '', 
        ifscCode: '', 
        branch: '' 
      }]
    }));
  };

  const updateBankAccount = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }));
  };

  const removeBankAccount = (index) => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let response;
      if (editingCompany) {
        // Update existing company
        const companyId = editingCompany._id || editingCompany.id;
        response = await staticAPI.updateCompanyRecord(companyId, formData);
        setCompanies(prev => prev.map(company => 
          (company._id || company.id) === companyId 
            ? { ...formData, _id: companyId }
            : company
        ));
      } else {
        // Add new company
        response = await staticAPI.createCompanyRecord(formData);
        const newCompany = { ...formData, _id: response.data?._id || response.data?.id };
        setCompanies(prev => [...prev, newCompany]);
      }
      
      setShowForm(false);
      setEditingCompany(null);
      setEditMode(false);
      resetForm();
    } catch (error) {
      console.error('Error saving company record:', error);
      alert('Failed to save company record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData(company);
    setShowForm(true);
    setEditMode(true);
  };

  const handleDelete = async (companyId) => {
    try {
      await staticAPI.deleteCompanyRecord(companyId);
      setCompanies(prev => prev.filter(company => (company._id || company.id) !== companyId));
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company record. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      companyType: '',
      industry: '',
      registrationNumber: '',
      incorporationDate: '',
      panNumber: '',
      tanNumber: '',
      gstNumber: '',
      cinNumber: '',
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
      directors: [],
      shareholders: [],
      authorizedSignatories: [],
      businessActivities: [],
      turnover: '',
      employeeCount: '',
      branches: [],
      bankAccounts: [],
      complianceStatus: '',
      lastAuditDate: '',
      nextAuditDue: '',
      taxStatus: '',
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
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
    setEditMode(false);
    resetForm();
  };

  if (loading && companies.length === 0) {
    return (
      <div className="static-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading company records...</p>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header">
        <div className="header-content">
          <div className="header-icon">
            <FiBriefcase />
          </div>
          <div className="header-text">
            <h1>Company Profile</h1>
            <p>Manage your company information and documents</p>
          </div>
        </div>
        <div className="header-actions">
          {!showForm ? (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FiPlus /> Add Company
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
        {!showForm ? (
          // Companies List View
          <div className="companies-list">
            {companies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiBriefcase />
                </div>
                <h3>No Companies Added</h3>
                <p>Start by adding your first company record</p>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  <FiPlus /> Add First Company
                </button>
              </div>
            ) : (
              <div className="companies-table-container">
                <table className="companies-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Type</th>
                      <th>Industry</th>
                      <th>PAN</th>
                      <th>GST</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => (
                      <tr key={company._id || company.id}>
                        <td className="company-name">{company.companyName}</td>
                        <td>{company.companyType}</td>
                        <td>{company.industry}</td>
                        <td>{company.panNumber}</td>
                        <td>{company.gstNumber}</td>
                        <td>{company.registeredOffice?.city}, {company.registeredOffice?.state}</td>
                        <td className="table-actions">
                          <button className="btn-edit" onClick={() => handleEdit(company)}>
                            <FiEdit2 />
                          </button>
                          <button className="btn-remove" onClick={() => handleDelete(company._id || company.id)}>
                            <FiX />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Company Form View - First part only due to length limit
          <div className="company-form">
            {/* Basic Company Information */}
            <div className="static-section">
              <div className="section-header">
                <FiBriefcase className="section-icon" />
                <h3>Basic Company Information</h3>
              </div>
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Type</label>
                    <select
                      value={formData.companyType}
                      onChange={(e) => handleInputChange('companyType', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      {companyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Registration Number</label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Incorporation Date</label>
                    <input
                      type="date"
                      value={formData.incorporationDate}
                      onChange={(e) => handleInputChange('incorporationDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>PAN Number</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value)}
                      maxLength={10}
                    />
                  </div>
                  <div className="form-group">
                    <label>TAN Number</label>
                    <input
                      type="text"
                      value={formData.tanNumber}
                      onChange={(e) => handleInputChange('tanNumber', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>CIN Number</label>
                    <input
                      type="text"
                      value={formData.cinNumber}
                      onChange={(e) => handleInputChange('cinNumber', e.target.value)}
                    />
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

export default CompanyProfile;