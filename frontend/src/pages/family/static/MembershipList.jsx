import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiDollarSign, FiEdit2, FiTrash2, FiPlus, FiCreditCard, FiAward } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';
import { syncRemindersFromForm } from '../../../utils/remindersSyncUtil';
import { syncBillScheduleFromForm } from '../../../utils/billScheduleSyncUtil';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  membershipType: 'Gym',
  organizationName: '',
  memberName: '',
  membershipNumber: '',
  startDate: '',
  endDate: '',
  renewalDate: '',
  status: 'Active',
  paymentFrequency: 'Monthly',
  amount: '',
  currency: 'INR',
  benefits: [''],
  contactInfo: {
    phone: '',
    email: '',
    website: ''
  },
  address: {
    street: '',
    city: '',
    state: '',
    pincode: ''
  },
  notes: ''
};

const MembershipList = () => {
  const [entries, setEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    trackFeatureUsage('/family/static/membership-list', 'view');
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await staticAPI.getMembershipList();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching membership list:', e);
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
        await staticAPI.updateMembership(editingId, formData);
      } else {
        await staticAPI.createMembership(formData);
      }

      // Sync reminders, bills, and contacts
      await Promise.all([
        syncRemindersFromForm(formData, 'MembershipList'),
        syncBillScheduleFromForm(formData, 'MembershipList'),
        syncContactsFromForm(formData, 'MembershipList')
      ]);

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
    if (window.confirm('Delete this membership?')) {
      try {
        await staticAPI.deleteMembership(item._id);
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

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleBenefitChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) =>
        i === index ? value : benefit
      )
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  if (loading && entries.length === 0) {
    return (
      <div className="static-page">
        <div className="static-header">
          <FiUsers className="section-icon" />
          <h2>Membership List</h2>
          <p>Manage your memberships and subscriptions</p>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header">
        <FiUsers className="section-icon" />
        <h2>Membership List</h2>
        <p>Manage your memberships and subscriptions</p>
      </div>

      <div className="static-content">
        {!editMode ? (
          // List View
          <div className="entries-list">
            {entries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiUsers />
                </div>
                <h3>No Memberships</h3>
                <p>Start adding your memberships and subscriptions</p>
                <button className="btn-primary" onClick={() => setEditMode(true)}>
                  <FiPlus /> Add First Membership
                </button>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>Memberships ({entries.length})</h3>
                  <button className="btn-primary" onClick={() => setEditMode(true)}>
                    <FiPlus /> Add Membership
                  </button>
                </div>
                <div className="table-container">
                  <table className="companies-table">
                    <thead>
                      <tr>
                        <th>Organization</th>
                        <th>Type</th>
                        <th>Member Name</th>
                        <th>Amount</th>
                        <th>Frequency</th>
                        <th>Validity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={entry._id}>
                          <td>
                            <div className="company-cell">
                              <FiAward className="company-icon" />
                              <div>
                                <div className="property-name">{entry.organizationName}</div>
                                <div className="property-subtitle">{entry.membershipNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td>{entry.membershipType}</td>
                          <td>{entry.memberName || 'N/A'}</td>
                          <td>
                            <div className="value-cell">
                              <FiDollarSign />
                              {entry.amount} {entry.currency}
                            </div>
                          </td>
                          <td>{entry.paymentFrequency}</td>
                          <td>
                            <div className="date-cell">
                              <FiCalendar />
                              {entry.startDate} - {entry.endDate}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge status-${entry.status?.toLowerCase()}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="btn-edit" onClick={() => handleEdit(index)}>
                                <FiEdit2 />
                              </button>
                              <button className="btn-remove" onClick={() => handleDelete(index)}>
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
              <h3>{editingId ? 'Edit Membership' : 'Add Membership'}</h3>
              <button className="btn-secondary" onClick={() => { setEditMode(false); resetForm(); }}>
                <FiPlus /> Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="static-form-content">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Membership Type</label>
                    <select
                      value={formData.membershipType}
                      onChange={(e) => handleInputChange('membershipType', e.target.value)}
                      required
                    >
                      <option value="Gym">Gym</option>
                      <option value="Club">Club</option>
                      <option value="Library">Library</option>
                      <option value="Professional">Professional</option>
                      <option value="Subscription">Subscription</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Organization Name</label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="e.g., Fitness First Gym"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Member Name</label>
                    <input
                      type="text"
                      value={formData.memberName}
                      onChange={(e) => handleInputChange('memberName', e.target.value)}
                      placeholder="Your name on the membership"
                    />
                  </div>
                  <div className="form-group">
                    <label>Membership Number</label>
                    <input
                      type="text"
                      value={formData.membershipNumber}
                      onChange={(e) => handleInputChange('membershipNumber', e.target.value)}
                      placeholder="e.g., MEM-12345"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Payment Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="e.g., 999"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Frequency</label>
                    <select
                      value={formData.paymentFrequency}
                      onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="One-time">One-time</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Date Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Renewal Date</label>
                    <input
                      type="date"
                      value={formData.renewalDate}
                      onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Contact Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      placeholder="e.g., +91 12345 67890"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="e.g., support@organization.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={formData.contactInfo.website}
                      onChange={(e) => handleContactChange('website', e.target.value)}
                      placeholder="e.g., https://organization.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Address</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="e.g., 123 Main Street"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      placeholder="e.g., 400001"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Benefits</h4>
                <div className="benefits-section">
                  <div className="benefits-header">
                    <h5>Benefits & Features</h5>
                    <button type="button" className="btn-add-benefit" onClick={addBenefit}>
                      <FiPlus /> Add Benefit
                    </button>
                  </div>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="benefit-row">
                      <div className="form-group">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          placeholder="e.g., Free access to all equipment"
                        />
                      </div>
                      <div className="form-group">
                        <button
                          type="button"
                          className="btn-remove-benefit"
                          onClick={() => removeBenefit(index)}
                          disabled={formData.benefits.length === 1}
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>Additional Information</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any additional notes about the membership..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setEditMode(false); resetForm(); }}>
                  <FiPlus /> Cancel
                </button>
                <button type="submit" className="btn-success">
                  <FiEdit2 /> {editingId ? 'Update Membership' : 'Save Membership'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipList;
