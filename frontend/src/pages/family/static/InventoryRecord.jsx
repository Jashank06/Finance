import { useEffect, useState } from 'react';
import { FiPackage, FiDatabase, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './Static.css';
import { investmentAPI } from '../../../utils/investmentAPI';

const defaultEntry = {
  itemName: '',
  category: 'Electronics',
  location: '',
  quantity: 1,
  unit: 'pcs',
  purchaseDate: '',
  purchasePrice: '',
  vendorName: '',
  serialNumber: '',
  warrantyExpiry: '',
  notes: '',
};

const InventoryRecord = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(true);

  const CATEGORY_KEY = 'static-inventory-record';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: data.category,
    name: data.itemName || 'Inventory Item',
    provider: data.vendorName || 'Vendor',
    amount: Number(data.purchasePrice) || 0,
    startDate: data.purchaseDate || new Date().toISOString().slice(0, 10),
    maturityDate: data.warrantyExpiry || undefined,
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
      console.error('Error fetching inventory records:', e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await investmentAPI.getAll(CATEGORY_KEY);
        const list = (res.data.investments || []).map(fromInvestment);
        setEntries(list);
      } catch (e) {
        console.error('Error fetching inventory records:', e);
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
      alert(error.response?.data?.message || 'Error saving inventory record');
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
            <FiPackage />
          </div>
          <div className="header-text">
            <h1>Inventory Record</h1>
            <p>Track household and office inventory items</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Lock Form' : 'Edit Form'}
          </button>
          <button className="btn-success" onClick={resetForm}>
            <FiPlus /> New Item
          </button>
        </div>
      </div>

      <div className="static-section">
        <div className="section-header">
          <FiDatabase className="section-icon" />
          <h3>Item Information</h3>
        </div>
        <div className="section-content">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Item Name</label>
                <input type="text" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} disabled={!editMode}>
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Appliances</option>
                  <option>Documents</option>
                  <option>Tools</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} disabled={!editMode} placeholder="e.g., Home, Locker, Office" />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} disabled={!editMode}>
                  <option>pcs</option>
                  <option>kg</option>
                  <option>litre</option>
                  <option>pack</option>
                  <option>set</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purchase Date</label>
                <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Purchase Price (₹)</label>
                <input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group">
                <label>Vendor Name</label>
                <input type="text" value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>Serial / Identifier</label>
                <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} disabled={!editMode} />
              </div>

              <div className="form-group">
                <label>Warranty Expiry</label>
                <input type="date" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} disabled={!editMode} />
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
            <FiPackage className="section-icon" />
            <h3>Saved Inventory</h3>
          </div>
          <div className="section-content">
            <div className="table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Vendor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.itemName}</td>
                      <td>{e.category}</td>
                      <td>{e.location}</td>
                      <td>{e.quantity}</td>
                      <td>{e.unit}</td>
                      <td>{e.vendorName}</td>
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

export default InventoryRecord;
