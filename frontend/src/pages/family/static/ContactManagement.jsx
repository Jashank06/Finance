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
  const [editMode, setEditMode] = useState(true);

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
          <button className="btn-success" onClick={resetForm}>
            <FiPlus /> New Contact
          </button>
        </div>
      </div>

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
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input type="text" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })} disabled={!editMode} placeholder="e.g., Self, Father, Vendor" />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Alt. Phone</label>
                <input type="tel" value={formData.altPhone} onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Alt. Email</label>
                <input type="email" value={formData.altEmail} onChange={(e) => setFormData({ ...formData, altEmail: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group full-width">
                <label>Address Line 1</label>
                <input type="text" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group full-width">
                <label>Address Line 2</label>
                <input type="text" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group">
                <label>City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group full-width">
                <label>Tags</label>
                <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} disabled={!editMode} placeholder="Comma separated (e.g., vendor, family)" />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} disabled={!editMode} />
              </div>
            </div>

            <div className="header-actions">
              <button type="submit" className="btn-success" disabled={!editMode}>
                {editingIndex !== null ? 'Update' : 'Save'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Reset</button>
            </div>
          </form>
        </div>
      </div>

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
