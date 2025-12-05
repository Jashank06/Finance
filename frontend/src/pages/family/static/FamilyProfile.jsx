import { useEffect, useState } from 'react';
import { FiUsers, FiHome, FiPhone, FiMail, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';

const defaultEntry = {
  familyName: '',
  familyHead: '',
  totalMembers: '',
  city: '',
  state: '',
  country: '',
  primaryPhone: '',
  primaryEmail: '',
  emergencyName: '',
  emergencyPhone: '',
  notes: '',
};

const FamilyProfile = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(true);

  const CATEGORY_KEY = 'static-family-profile';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: 'Profile',
    name: data.familyName || 'Family Profile',
    provider: data.familyHead || 'Head',
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
      const res = await staticAPI.getFamilyProfile();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching family profile:', e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await staticAPI.getFamilyProfile();
        setEntries(res.data || []);
      } catch (e) {
        console.error('Error fetching family profile:', e);
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
        await staticAPI.updateFamilyProfile(editingId, formData);
      } else {
        await staticAPI.createFamilyProfile(formData);
      }
      await fetchEntries();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving profile');
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
    if (window.confirm('Delete this profile?')) {
      try {
        await staticAPI.deleteFamilyProfile(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting profile');
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
            <h1>Family Profile</h1>
            <p>High-level summary of your family’s core information</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Lock Form' : 'Edit Form'}
          </button>
          <button className="btn-success" onClick={resetForm}>
            <FiPlus /> New Profile
          </button>
        </div>
      </div>

      <div className="static-section">
        <div className="section-header">
          <FiHome className="section-icon" />
          <h3>Profile Information</h3>
        </div>
        <div className="section-content">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Family Name</label>
                <input type="text" value={formData.familyName} onChange={(e) => setFormData({ ...formData, familyName: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Family Head</label>
                <input type="text" value={formData.familyHead} onChange={(e) => setFormData({ ...formData, familyHead: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Total Members</label>
                <input type="number" value={formData.totalMembers} onChange={(e) => setFormData({ ...formData, totalMembers: e.target.value })} disabled={!editMode} />
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
                <label>Country</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group">
                <label>Primary Phone</label>
                <input type="tel" value={formData.primaryPhone} onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Primary Email</label>
                <input type="email" value={formData.primaryEmail} onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input type="text" value={formData.emergencyName} onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input type="tel" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} disabled={!editMode} />
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
            <FiUsers className="section-icon" />
            <h3>Saved Profiles</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Family</th>
                    <th>Head</th>
                    <th>Members</th>
                    <th>City</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.familyName}</td>
                      <td>{e.familyHead}</td>
                      <td>{e.totalMembers}</td>
                      <td>{e.city}</td>
                      <td>{e.primaryPhone}</td>
                      <td>{e.primaryEmail}</td>
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

export default FamilyProfile;
