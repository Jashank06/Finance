import { useEffect, useState } from 'react';
import { FiUser, FiFileText, FiEdit2, FiTrash2, FiPlus, FiLink } from 'react-icons/fi';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';

const defaultEntry = {
  docType: 'Aadhaar',
  idNumber: '',
  nameOnId: '',
  issueDate: '',
  expiryDate: '',
  placeOfIssue: '',
  issuingAuthority: '',
  fileUrl: '',
  notes: '',
};

const PersonalRecords = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(true);
  

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
        await staticAPI.deletePersonalRecord(item._id);
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
            <FiUser />
          </div>
          <div className="header-text">
            <h1>Personal Records</h1>
            <p>Store key identity and document details for family members</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Lock Form' : 'Edit Form'}
          </button>
          <button className="btn-success" onClick={resetForm}>
            <FiPlus /> New Record
          </button>
        </div>
      </div>

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
                  disabled={!editMode}
                >
                  <option>Aadhaar</option>
                  <option>PAN</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                  <option>Birth Certificate</option>
                  <option>Marriage Certificate</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., PAN ABCDE1234F"
                />
              </div>

              <div className="form-group">
                <label>Name on ID</label>
                <input
                  type="text"
                  value={formData.nameOnId}
                  onChange={(e) => setFormData({ ...formData, nameOnId: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Place of Issue</label>
                <input
                  type="text"
                  value={formData.placeOfIssue}
                  onChange={(e) => setFormData({ ...formData, placeOfIssue: e.target.value })}
                  disabled={!editMode}
                  placeholder="City, State"
                />
              </div>

              <div className="form-group">
                <label>Issuing Authority</label>
                <input
                  type="text"
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., UIDAI, RTO, Passport Office"
                />
              </div>

              <div className="form-group">
                <label>Document File URL</label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  disabled={!editMode}
                  placeholder="Link to PDF/Image in your drive"
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!editMode}
                  placeholder="Additional details, renewal reminders, etc."
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

export default PersonalRecords;
