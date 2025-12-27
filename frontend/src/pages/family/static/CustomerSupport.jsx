import { useEffect, useState } from 'react';
import { FiPhone, FiMail, FiMessageSquare, FiEdit2, FiTrash2, FiPlus, FiCalendar, FiClock, FiUser, FiX } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  type: 'Customer Service',
  companyName: '',
  serviceCategory: 'Technical Support',
  contactPerson: '',
  phone: '',
  email: '',
  website: '',
  supportHours: '',
  notes: ''
};

const CustomerSupport = () => {
  const [entries, setEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    trackFeatureUsage('/family/static/customer-support', 'view');
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await staticAPI.getCustomerSupport();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching customer support:', e);
    }
  };

  const resetForm = () => {
    setFormData(defaultEntry);
    setEditingIndex(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await staticAPI.updateCustomerSupport(editingId, formData);
      } else {
        await staticAPI.createCustomerSupport(formData);
      }
      await fetchEntries();
      resetForm();
      setEditMode(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving record');
    }
  };

  const handleEdit = (index) => {
    const item = entries[index];
    setFormData({ ...item });
    setEditingIndex(index);
    setEditingId(item._id);
    setEditMode(true);
  };

  const handleDelete = async (index) => {
    const item = entries[index];
    if (window.confirm('Delete this support record?')) {
      try {
        await staticAPI.deleteCustomerSupport(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && entries.length === 0) {
    return (
      <div className="static-page">
        <div className="static-header">
          <FiHeadset className="section-icon" />
          <h2>Customer Support</h2>
          <p>Manage customer service and support contacts</p>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header">
        <FiUser className="section-icon" />
        <h2>Customer Support</h2>
        <p>Manage customer service and support contacts</p>
      </div>

      <div className="static-content">
        {!editMode ? (
          // List View
          <div className="entries-list">
            {entries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiUser />
                </div>
                <h3>No Support Records</h3>
                <p>Start adding your customer service contacts</p>
                <button className="btn-primary" onClick={() => setEditMode(true)}>
                  <FiPlus /> Add First Support Record
                </button>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>Support Contacts ({entries.length})</h3>
                  <button className="btn-primary" onClick={() => setEditMode(true)}>
                    <FiPlus /> Add Support Record
                  </button>
                </div>
                <div className="table-container">
                  <table className="companies-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Service Type</th>
                        <th>Contact Person</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={entry._id}>
                          <td>
                            <div className="company-cell">
                              <FiUser className="company-icon" />
                              <span>{entry.companyName || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{entry.serviceCategory}</td>
                          <td>{entry.contactPerson || 'N/A'}</td>
                          <td>{entry.phone || 'N/A'}</td>
                          <td>{entry.email || 'N/A'}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn-edit" onClick={() => handleEdit(index)}>
                                <FiEdit2 />
                              </button>
                              <button className="btn-delete" onClick={() => handleDelete(index)}>
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
          // Form View
          <div className="static-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit Support Record' : 'Add Support Record'}</h3>
              <button className="btn-secondary" onClick={() => { setEditMode(false); resetForm(); }}>
                <FiX /> Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="static-form-content">
              <div className="form-section">
                <h4>Service Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Service Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      required
                    >
                      <option value="Customer Service">Customer Service</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Support">Billing Support</option>
                      <option value="Product Support">Product Support</option>
                      <option value="Emergency Support">Emergency Support</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="e.g., Internet Service Provider"
                    />
                  </div>
                  <div className="form-group">
                    <label>Service Category</label>
                    <select
                      value={formData.serviceCategory}
                      onChange={(e) => handleInputChange('serviceCategory', e.target.value)}
                      required
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Support">Billing Support</option>
                      <option value="Account Support">Account Support</option>
                      <option value="Product Support">Product Support</option>
                      <option value="Emergency Support">Emergency Support</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="Name of contact person"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Contact Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 12345 67890"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="support@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://company.com/support"
                    />
                  </div>
                  <div className="form-group">
                    <label>Support Hours</label>
                    <input
                      type="text"
                      value={formData.supportHours}
                      onChange={(e) => handleInputChange('supportHours', e.target.value)}
                      placeholder="e.g., 9:00 AM - 6:00 PM, Mon-Fri"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Additional Notes</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any additional notes or follow-up actions..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setEditMode(false); resetForm(); }}>
                  <FiX /> Cancel
                </button>
                <button type="submit" className="btn-success">
                  <FiEdit2 /> {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;
