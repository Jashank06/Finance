import { useEffect, useState } from 'react';
import { FiUser, FiFileText, FiEdit2, FiTrash2, FiPlus, FiLink } from 'react-icons/fi';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import { syncRemindersFromForm } from '../../../utils/remindersSyncUtil';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  docType: 'Aadhaar',
  idNumber: '',
  nameOnId: '',
  issueDate: '',
  expiryDate: '',
  placeOfIssue: '',
  issuingAuthority: '',
  fileUrl: '',
  mobileNumber: '',
  emailId: '',
  url: '',
  userId: '',
  password: '',
  additional: '',
  notes: '',
};

const PersonalRecords = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);


  const CATEGORY_KEY = 'static-personal-records';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: data.docType,
    name: data.nameOnId || data.docType,
    provider: data.issuingAuthority || 'Authority',
    amount: 0,
    startDate: data.issueDate || new Date().toISOString().slice(0, 10),
    maturityDate: data.expiryDate || undefined,
    notes: JSON.stringify({ ...data }),
  });

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return { _id: inv._id, ...notes };
  };

  const fetchEntries = async () => {
    try {
      const res = await staticAPI.getPersonalRecords();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching personal records:', e);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/static/personal-records', 'view');
    (async () => {
      try {
        const res = await staticAPI.getPersonalRecords();
        setEntries(res.data || []);
      } catch (e) {
        console.error('Error fetching personal records:', e);
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
        await staticAPI.updatePersonalRecord(editingId, formData);
      } else {
        await staticAPI.createPersonalRecord(formData);
      }

      // Sync contacts to Contact Management
      await syncContactsFromForm(formData, 'PersonalRecords');

      // Sync customer support to Customer Support
      await syncCustomerSupportFromForm(formData, 'PersonalRecords');

      // Sync reminders to Reminders & Notifications
      syncRemindersFromForm(formData, 'PersonalRecords');

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
    if (window.confirm('Delete this record?')) {
      try {
        await staticAPI.deletePersonalRecord(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  return (
    <div className="static-page">
      <div className="static-header" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="header-content">
          <div className="header-icon">
            <FiUser />
          </div>
          <div className="header-text">
            <h1 style={{ color: '#0A0A0A' }}>Personal Records</h1>
            <p style={{ color: '#4A5568' }}>Store key identity and document details for family members</p>
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
            <FiFileText className="section-icon" />
            <h3>Document Information</h3>
          </div>
          <div className="section-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Document Type</label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  >
                    <option>Aadhaar</option>
                    <option>PAN</option>
                    <option>Voter ID</option>
                    <option>Passport</option>
                    <option>Driving License</option>
                    <option>Birth Certificate</option>
                    <option>Marriage Certificate</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Name on ID</label>
                  <input
                    type="text"
                    value={formData.nameOnId}
                    onChange={(e) => setFormData({ ...formData, nameOnId: e.target.value })}
                    placeholder="Name as printed on document"
                  />
                </div>

                <div className="form-group">
                  <label>ID Number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="Document identification number"
                  />
                </div>

                <div className="form-group">
                  <label>Issuing Authority</label>
                  <input
                    type="text"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                    placeholder="Government department or authority"
                  />
                </div>

                <div className="form-group">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>File URL</label>
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="Link to scanned document"
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="Mobile number"
                  />
                </div>

                <div className="form-group">
                  <label>Email Id</label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                    placeholder="Email address"
                  />
                </div>

                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="Website or portal URL"
                  />
                </div>

                <div className="form-group">
                  <label>User Id</label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="User ID or username"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
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
                    placeholder="Additional remarks or information"
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
            <FiFileText className="section-icon" />
            <h3>Saved Records</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>ID Number</th>
                    <th>Name on ID</th>
                    <th>Issue</th>
                    <th>Expiry</th>
                    <th>Place</th>
                    <th>Authority</th>
                    <th>File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.docType}</td>
                      <td>{e.idNumber}</td>
                      <td>{e.nameOnId}</td>
                      <td>{e.issueDate}</td>
                      <td>{e.expiryDate}</td>
                      <td>{e.placeOfIssue}</td>
                      <td>{e.issuingAuthority}</td>
                      <td>
                        {e.fileUrl ? (
                          <a href={e.fileUrl} target="_blank" rel="noreferrer" className="btn-icon"><FiLink /></a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <a href={e.fileUrl} target="_blank" rel="noreferrer" className="btn-icon"><FiLink /></a>
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

export default PersonalRecords;
