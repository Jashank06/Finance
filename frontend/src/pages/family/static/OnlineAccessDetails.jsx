import { useEffect, useState } from 'react';
import { FiGlobe, FiShield, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './Static.css';
import { investmentAPI } from '../../../utils/investmentAPI';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  category: 'Banking',
  serviceName: '',
  url: '',
  userId: '',
  password: '',
  recoveryEmail: '',
  recoveryPhone: '',
  twoFA: false,
  otpMethod: 'SMS',
  securityQuestion: '',
  securityAnswer: '',
  additional: '',
  notes: '',
};

const OnlineAccessDetails = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);


  const CATEGORY_KEY = 'static-online-access';
  const DEFAULT_CATEGORIES = [
    'Banking',
    'Trading / Investment',
    'Utilities',
    'Government / Tax',
    'Email',
    'Social',
    'Work / SaaS'
  ];

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: 'Account',
    name: data.serviceName || 'Online Access',
    provider: data.category || 'Other',
    amount: 0,
    startDate: new Date().toISOString().slice(0, 10),
    notes: JSON.stringify({
      category: data.category,
      serviceName: data.serviceName,
      url: data.url,
      userId: data.userId,
      recoveryEmail: data.recoveryEmail,
      recoveryPhone: data.recoveryPhone,
      twoFA: data.twoFA,
      otpMethod: data.otpMethod,
      securityQuestion: data.securityQuestion,
      securityAnswer: data.securityAnswer,
      notes: data.notes,
    }),
  });

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return {
      _id: inv._id,
      category: notes.category || inv.provider || 'Other',
      serviceName: notes.serviceName || inv.name || '',
      url: notes.url || '',
      userId: notes.userId || '',
      recoveryEmail: notes.recoveryEmail || '',
      recoveryPhone: notes.recoveryPhone || '',
      twoFA: !!notes.twoFA,
      otpMethod: notes.otpMethod || 'SMS',
      securityQuestion: notes.securityQuestion || '',
      securityAnswer: notes.securityAnswer || '',
      notes: notes.notes || '',
    };
  };

  const fetchEntries = async () => {
    try {
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);
      setEntries(list);
    } catch (e) {
      console.error('Error fetching online access details:', e);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/static/online-access-details', 'view');
    (async () => {
      try {
        const res = await investmentAPI.getAll(CATEGORY_KEY);
        const list = (res.data.investments || []).map(fromInvestment);
        setEntries(list);
      } catch (e) {
        console.error('Error fetching online access details:', e);
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
        await investmentAPI.update(editingId, toPayload(formData));
      } else {
        await investmentAPI.create(toPayload(formData));
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
    if (window.confirm('Are you sure you want to delete this access record?')) {
      try {
        await investmentAPI.delete(item._id);
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
            <FiGlobe />
          </div>
          <div className="header-text">
            <h1>Online Access Details</h1>
            <p>Maintain secure records of online accounts and access information</p>
          </div>
        </div>
        <div className="header-actions">

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
            <FiShield className="section-icon" />
            <h3>Access Information</h3>
          </div>
          <div className="section-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={DEFAULT_CATEGORIES.includes(formData.category) ? formData.category : 'Other'}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'Other') {
                        // If switching to Other, we can keep the current value if it was already custom, or clear it if it was a default
                        if (DEFAULT_CATEGORIES.includes(formData.category)) {
                          setFormData({ ...formData, category: '' });
                        }
                        // If it was already custom, do nothing (keep it)
                      } else {
                        setFormData({ ...formData, category: value });
                      }
                    }}
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                {!DEFAULT_CATEGORIES.includes(formData.category) && (
                  <div className="form-group">
                    <label>Specify Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Enter custom category"
                      autoFocus
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Service Name</label>
                  <input
                    type="text"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="e.g., HDFC NetBanking"
                  />
                </div>

                <div className="form-group">
                  <label>Login URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>User ID</label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Recovery Email</label>
                  <input
                    type="email"
                    value={formData.recoveryEmail}
                    onChange={(e) => setFormData({ ...formData, recoveryEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Recovery Phone</label>
                  <input
                    type="tel"
                    value={formData.recoveryPhone}
                    onChange={(e) => setFormData({ ...formData, recoveryPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Two-Factor Authentication</label>
                  <select
                    value={formData.twoFA ? 'Enabled' : 'Disabled'}
                    onChange={(e) => setFormData({ ...formData, twoFA: e.target.value === 'Enabled' })}
                  >
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>OTP Method</label>
                  <select
                    value={formData.otpMethod}
                    onChange={(e) => setFormData({ ...formData, otpMethod: e.target.value })}
                  >
                    <option>SMS</option>
                    <option>Email</option>
                    <option>Authenticator App</option>
                    <option>Security Key</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Security Question</label>
                  <input
                    type="text"
                    value={formData.securityQuestion}
                    onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Security Answer</label>
                  <input
                    type="text"
                    value={formData.securityAnswer}
                    onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Additional</label>
                  <input
                    type="text"
                    value={formData.additional}
                    onChange={(e) => setFormData({ ...formData, additional: e.target.value })}
                    placeholder="Any additional details"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional instructions or remarks"
                  />
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
            <FiGlobe className="section-icon" />
            <h3>Saved Online Accounts</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Service</th>
                    <th>URL</th>
                    <th>User ID</th>
                    <th>2FA</th>
                    <th>OTP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.category}</td>
                      <td>{e.serviceName}</td>
                      <td><a href={e.url} target="_blank" rel="noreferrer">{e.url}</a></td>
                      <td>{e.userId}</td>
                      <td>{e.twoFA ? 'Enabled' : 'Disabled'}</td>
                      <td>{e.otpMethod}</td>
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

export default OnlineAccessDetails;
