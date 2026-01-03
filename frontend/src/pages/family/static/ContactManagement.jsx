import { useEffect, useState } from 'react';
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import './Static.css';
import { investmentAPI } from '../../../utils/investmentAPI';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  nameOfPerson: '',
  reference: '',
  serviceProviderOrProductSeller: '',
  profession: '',
  industry: '',
  category: '',
  primaryProducts: '',
  nameOfCompany: '',
  mobileNumber1: '',
  mobileNumber2: '',
  emailId: '',
  website: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
  serviceAreaLocation: '',
  notes: '',
};

const ContactManagement = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const CATEGORY_KEY = 'static-contact-management';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: 'Contact',
    name: data.name || 'Contact',
    provider: data.company || data.relation || 'Contact',
    amount: 0,
    startDate: new Date().toISOString().slice(0, 10),
    notes: JSON.stringify({ ...data }),
  });

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return { _id: inv._id, ...notes };
  };

  const fetchEntries = async () => {
    try {
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);

      // Filter out demo contacts
      const demoNames = ['John Doe', 'Jane Doe', 'Johnny Doe', 'Robert Doe'];
      const cleanList = list.filter(
        contact => !demoNames.includes(contact.nameOfPerson)
      );

      setEntries(cleanList);
    } catch (e) {
      console.error('Error fetching contacts:', e);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/static/contact-management', 'view');
    fetchEntries();
  }, []);

  const resetForm = () => {
    setFormData(defaultEntry);
    setEditingIndex(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await investmentAPI.update(editingId, toPayload(formData));
      } else {
        await investmentAPI.create(toPayload(formData));
      }
      await fetchEntries();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving contact');
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
    if (window.confirm('Delete this contact?')) {
      try {
        await investmentAPI.delete(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting contact');
      }
    }
  };

  return (
    <div className="static-page">
      <div className="static-header" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="header-content">
          <div className="header-icon">
            <FiUsers />
          </div>
          <div className="header-text">
            <h1 style={{ color: '#0A0A0A' }}>Contact Management</h1>
            <p style={{ color: '#4A5568' }}>Maintain comprehensive contact details for family and associates</p>
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
            <FiMapPin className="section-icon" />
            <h3>Contact Information</h3>
          </div>
          <div className="section-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name of Person</label>
                  <input type="text" value={formData.nameOfPerson} onChange={(e) => setFormData({ ...formData, nameOfPerson: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reference</label>
                  <input type="text" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} placeholder="How you know this person" />
                </div>
                <div className="form-group">
                  <label>Service Provider / Product Seller</label>
                  <input type="text" value={formData.serviceProviderOrProductSeller} onChange={(e) => setFormData({ ...formData, serviceProviderOrProductSeller: e.target.value })} placeholder="Service or product type" />
                </div>
                <div className="form-group">
                  <label>Profession</label>
                  <input type="text" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="e.g., Engineer, Doctor, Consultant" />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input type="text" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="e.g., IT, Healthcare, Education" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Vendor, Client, Partner" />
                </div>
                <div className="form-group">
                  <label>Primary Products</label>
                  <input type="text" value={formData.primaryProducts} onChange={(e) => setFormData({ ...formData, primaryProducts: e.target.value })} placeholder="Main products or services" />
                </div>
                <div className="form-group">
                  <label>Name of Company</label>
                  <input type="text" value={formData.nameOfCompany} onChange={(e) => setFormData({ ...formData, nameOfCompany: e.target.value })} placeholder="Company or business name" />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" value={formData.mobileNumber1} onChange={(e) => setFormData({ ...formData, mobileNumber1: e.target.value })} placeholder="Primary mobile" />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" value={formData.mobileNumber2} onChange={(e) => setFormData({ ...formData, mobileNumber2: e.target.value })} placeholder="Secondary mobile" />
                </div>
                <div className="form-group">
                  <label>Email Id</label>
                  <input type="email" value={formData.emailId} onChange={(e) => setFormData({ ...formData, emailId: e.target.value })} placeholder="Email address" />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="Website URL" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City name" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State name" />
                </div>
                <div className="form-group">
                  <label>Pin Code</label>
                  <input type="text" value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })} placeholder="Postal code" />
                </div>
                <div className="form-group">
                  <label>Service Area Location</label>
                  <input type="text" value={formData.serviceAreaLocation} onChange={(e) => setFormData({ ...formData, serviceAreaLocation: e.target.value })} placeholder="Areas served" />
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
            <FiPhone className="section-icon" />
            <h3>Saved Contacts</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Name of Person</th>
                    <th>Profession</th>
                    <th>Company</th>
                    <th>Mobile Number</th>
                    <th>Email Id</th>
                    <th>City</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.nameOfPerson}</td>
                      <td>{e.profession}</td>
                      <td>{e.nameOfCompany}</td>
                      <td>{e.mobileNumber1}</td>
                      <td>{e.emailId}</td>
                      <td>{e.city}</td>
                      <td>{e.category}</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleEdit(idx)} className="btn-edit"><FiEdit2 /></button>
                          <button onClick={() => handleDelete(idx)} className="btn-remove"><FiTrash2 /></button>
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

export default ContactManagement;
