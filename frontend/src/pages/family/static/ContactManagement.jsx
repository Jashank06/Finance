import { useEffect, useState } from 'react';
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import './Static.css';
import { investmentAPI } from '../../../utils/investmentAPI';

const defaultEntry = {
  name: '',
  relation: '',
  company: '',
  phone: '',
  email: '',
  altPhone: '',
  altEmail: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  tags: '',
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
      setEntries(list);
    } catch (e) {
      console.error('Error fetching contacts:', e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await investmentAPI.getAll(CATEGORY_KEY);
        const list = (res.data.investments || []).map(fromInvestment);
        setEntries(list);
      } catch (e) {
        console.error('Error fetching contacts:', e);
      }
    })();
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
      <div className="static-header">
        <div className="header-content">
          <div className="header-icon">
            <FiUsers />
          </div>
          <div className="header-text">
            <h1>Contact Management</h1>
            <p>Maintain comprehensive contact details for family and associates</p>
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
                  <label>Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Relation</label>
                  <input type="text" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })} placeholder="e.g., Self, Father, Vendor" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
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
            <FiPhone className="section-icon" />
            <h3>Saved Contacts</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Relation</th>
                    <th>Company</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.name}</td>
                      <td>{e.relation}</td>
                      <td>{e.company}</td>
                      <td>{e.phone}</td>
                      <td>{e.email}</td>
                      <td>{e.city}</td>
                      <td>{e.tags}</td>
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

export default ContactManagement;
