import { useEffect, useState } from 'react';
import { FiPhone, FiMail, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';

const defaultEntry = {
  type: 'Mobile',
  name: '',
  relation: '',
  mobile: '',
  carrier: '',
  simType: 'Prepaid',
  email: '',
  provider: 'Gmail',
  recoveryEmail: '',
  recoveryPhone: '',
  twoFA: false,
  notes: '',
};

const MobileEmailDetails = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(true);
  

  const CATEGORY_KEY = 'static-mobile-email';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: data.type,
    name: data.type === 'Email' ? data.email || 'Email' : data.mobile || 'Mobile',
    provider: data.type === 'Email' ? data.provider || 'Other' : data.carrier || 'Other',
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
      const res = await staticAPI.getMobileEmailDetails();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching mobile/email details:', e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await staticAPI.getMobileEmailDetails();
        setEntries(res.data || []);
      } catch (e) {
        console.error('Error fetching mobile/email details:', e);
      }
    })();
  }, []);

  const resetForm = () => {
    setFormData(defaultEntry);
    setEditingIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await staticAPI.updateMobileEmailDetails(editingId, formData);
      } else {
        await staticAPI.createMobileEmailDetails(formData);
      }
      await fetchEntries();
      resetForm();
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
    if (window.confirm('Delete this record?')) {
      try {
        await staticAPI.deleteMobileEmailDetails(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  return (
    <div className="static-page">
      <div className="static-header">
        <div className="header-content">
          <div className="header-icon">
            <FiPhone />
          </div>
          <div className="header-text">
            <h1>Mobile & Email Details</h1>
            <p>Keep important contact and access details for family members</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Lock Form' : 'Edit Form'}
          </button>
          <button className="btn-success" onClick={resetForm}>
            <FiPlus /> New Entry
          </button>
        </div>
      </div>

      <div className="static-section">
        <div className="section-header">
          <FiMail className="section-icon" />
          <h3>Contact Information</h3>
        </div>
        <div className="section-content">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={!editMode}
                >
                  <option>Mobile</option>
                  <option>Email</option>
                </select>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., Jay"
                />
              </div>

              <div className="form-group">
                <label>Relation</label>
                <input
                  type="text"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., Self, Father, Mother"
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., +91-9876543210"
                />
              </div>

              <div className="form-group">
                <label>Carrier</label>
                <input
                  type="text"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., Jio, Airtel, VI"
                />
              </div>

              <div className="form-group">
                <label>SIM Type</label>
                <select
                  value={formData.simType}
                  onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                  disabled={!editMode}
                >
                  <option>Prepaid</option>
                  <option>Postpaid</option>
                  <option>eSIM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., jay@example.com"
                />
              </div>

              <div className="form-group">
                <label>Email Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  disabled={!editMode}
                >
                  <option>Gmail</option>
                  <option>Outlook</option>
                  <option>Yahoo</option>
                  <option>Proton</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Recovery Email</label>
                <input
                  type="email"
                  value={formData.recoveryEmail}
                  onChange={(e) => setFormData({ ...formData, recoveryEmail: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Recovery Phone</label>
                <input
                  type="tel"
                  value={formData.recoveryPhone}
                  onChange={(e) => setFormData({ ...formData, recoveryPhone: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Two-Factor Authentication</label>
                <select
                  value={formData.twoFA ? 'Enabled' : 'Disabled'}
                  onChange={(e) => setFormData({ ...formData, twoFA: e.target.value === 'Enabled' })}
                  disabled={!editMode}
                >
                  <option value="Disabled">Disabled</option>
                  <option value="Enabled">Enabled</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!editMode}
                  placeholder="Plan details, pack info, forwarding rules, etc."
                />
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
                    <th>Type</th>
                    <th>Name</th>
                    <th>Relation</th>
                    <th>Mobile</th>
                    <th>Carrier</th>
                    <th>Email</th>
                    <th>2FA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.type}</td>
                      <td>{e.name}</td>
                      <td>{e.relation}</td>
                      <td>{e.mobile}</td>
                      <td>{e.carrier}</td>
                      <td>{e.email}</td>
                      <td>{e.twoFA ? 'Enabled' : 'Disabled'}</td>
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

export default MobileEmailDetails;
