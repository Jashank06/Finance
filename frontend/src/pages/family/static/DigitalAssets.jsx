import { useEffect, useState } from 'react';
import { FiBox, FiLock, FiEdit2, FiTrash2, FiPlus, FiLink } from 'react-icons/fi';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';

const defaultEntry = {
  assetType: 'Crypto',
  platform: '',
  identifier: '',
  link: '',
  storageLocation: 'Exchange',
  twoFA: false,
  recoveryEmail: '',
  recoveryPhone: '',
  notes: '',
};

const DigitalAssets = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(true);

  const CATEGORY_KEY = 'static-digital-assets';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: data.assetType,
    name: data.identifier || data.assetType,
    provider: data.platform || 'Platform',
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
      const res = await staticAPI.getDigitalAssets();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching digital assets:', e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await staticAPI.getDigitalAssets();
        setEntries(res.data || []);
      } catch (e) {
        console.error('Error fetching digital assets:', e);
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
        await staticAPI.updateDigitalAsset(editingId, formData);
      } else {
        await staticAPI.createDigitalAsset(formData);
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
        await staticAPI.deleteDigitalAsset(item._id);
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
            <FiBox />
          </div>
          <div className="header-text">
            <h1>Digital Assets</h1>
            <p>Track crypto, NFTs, domains, and other digital assets</p>
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
          <FiLock className="section-icon" />
          <h3>Asset Information</h3>
        </div>
        <div className="section-content">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                  disabled={!editMode}
                >
                  <option>Crypto</option>
                  <option>NFT</option>
                  <option>Domain</option>
                  <option>Cloud Storage</option>
                  <option>Social Handle</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Platform / Provider</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  disabled={!editMode}
                  placeholder="e.g., Binance, OpenSea, GoDaddy, Google Drive"
                />
              </div>

              <div className="form-group">
                <label>Identifier</label>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  disabled={!editMode}
                  placeholder="Wallet address, domain name, handle, etc."
                />
              </div>

              <div className="form-group">
                <label>Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  disabled={!editMode}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Storage Location</label>
                <select
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  disabled={!editMode}
                >
                  <option>Exchange</option>
                  <option>Self-custody Wallet</option>
                  <option>Cloud</option>
                  <option>Other</option>
                </select>
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

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!editMode}
                  placeholder="Do not store passwords. Add access instructions only."
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
            <FiBox className="section-icon" />
            <h3>Saved Digital Assets</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Platform</th>
                    <th>Identifier</th>
                    <th>Link</th>
                    <th>2FA</th>
                    <th>Storage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.assetType}</td>
                      <td>{e.platform}</td>
                      <td>{e.identifier}</td>
                      <td>
                        {e.link ? (
                          <a href={e.link} target="_blank" rel="noreferrer" className="btn-icon"><FiLink /></a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{e.twoFA ? 'Enabled' : 'Disabled'}</td>
                      <td>{e.storageLocation}</td>
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

export default DigitalAssets;
