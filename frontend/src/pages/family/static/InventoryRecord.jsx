import { useEffect, useState } from 'react';
import { FiPackage, FiDatabase, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './Static.css';
import { investmentAPI } from '../../../utils/investmentAPI';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import { syncRemindersFromForm } from '../../../utils/remindersSyncUtil';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  itemName: '',
  category: 'Electronics',
  location: '',
  quantity: 1,
  unit: 'pcs',
  purchaseDate: '',
  purchasePrice: '',
  invoiceNumber: '',
  vendorName: '',
  serialNumber: '',
  warrantyExpiry: '',
  companyName: '',
  modelName: '',
  totalValue: '',
  vendorContactNumber: '',
  vendorContactEmail: '',
  address: '',
  serviceCenterNumber: '',
  customerCareNumber: '',
  customerCareEmail: '',
  // Service Provider fields
  serviceProviderName: '',
  serviceName: '',
  servicePersonName: '',
  serviceMobileNumber: '',
  serviceCompanyName: '',
  serviceAddress: '',
  serviceEmailId: '',
  serviceWebsite: '',
  notes: '',
};

const STANDARD_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Appliances',
  'Books',
  'Clothing',
  'Kitchen',
  'Tools'
];

const InventoryRecord = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

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
    trackFeatureUsage('/family/static/inventory-record', 'view');
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

  // Auto-calculate total when quantity or purchase price changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const total = quantity * purchasePrice;
    setFormData(prev => ({ ...prev, totalValue: total.toString() }));
  }, [formData.quantity, formData.purchasePrice]);

  const resetForm = () => {
    setFormData(defaultEntry);
    setEditingIndex(null);
    setEditingId(null);
    setIsCustomCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await investmentAPI.update(editingId, toPayload(formData));
      } else {
        await investmentAPI.create(toPayload(formData));
      }

      // Sync contacts to Contact Management
      await syncContactsFromForm(formData, 'InventoryRecord');

      // Sync customer support to Customer Support
      await syncCustomerSupportFromForm(formData, 'InventoryRecord');

      // Sync reminders to Reminders & Notifications
      syncRemindersFromForm(formData, 'InventoryRecord');

      await fetchEntries();
      resetForm();
      setEditMode(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving inventory record');
    }
  };

  const handleEdit = (index) => {
    const item = entries[index];
    setFormData({ ...item });

    // Check if category is custom
    if (item.category && !STANDARD_CATEGORIES.includes(item.category)) {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }

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

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  return (
    <div className="static-page">
      <div className="static-header" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="header-content">
          <div className="header-icon">
            <FiPackage />
          </div>
          <div className="header-text">
            <h1 style={{ color: '#0A0A0A' }}>Inventory Record</h1>
            <p style={{ color: '#4A5568' }}>Track household and office inventory items</p>
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
            <FiDatabase className="section-icon" />
            <h3>Item Information</h3>
          </div>
          <div className="section-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name</label>
                  <input type="text" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={isCustomCategory ? 'Other' : formData.category}
                    onChange={handleCategoryChange}
                  >
                    {STANDARD_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">Other (Custom)</option>
                  </select>
                  {isCustomCategory && (
                    <input
                      type="text"
                      placeholder="Enter custom category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ marginTop: '10px' }}
                      autoFocus
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Purchase Price</label>
                  <input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Invoice Number</label>
                  <input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} placeholder="Invoice or bill number" />
                </div>
                <div className="form-group">
                  <label>Vendor Name</label>
                  <input type="text" value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Name of Company</label>
                  <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g., Samsung, LG, Apple" />
                </div>

                <div className="form-group">
                  <label>Model Name</label>
                  <input type="text" value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} placeholder="e.g., Galaxy S23, iPhone 14" />
                </div>

                <div className="form-group">
                  <label>Total Value (Auto-calculated)</label>
                  <input type="number" value={formData.totalValue} readOnly placeholder="Total current value" style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
                </div>

                <div className="form-group">
                  <label>Vendor Contact Number</label>
                  <input type="tel" value={formData.vendorContactNumber} onChange={(e) => setFormData({ ...formData, vendorContactNumber: e.target.value })} placeholder="Vendor phone number" />
                </div>

                <div className="form-group">
                  <label>Vendor Contact Email</label>
                  <input type="email" value={formData.vendorContactEmail} onChange={(e) => setFormData({ ...formData, vendorContactEmail: e.target.value })} placeholder="Vendor email address" />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Vendor or service address" />
                </div>

                <div className="form-group">
                  <label>Service Center Number</label>
                  <input type="tel" value={formData.serviceCenterNumber} onChange={(e) => setFormData({ ...formData, serviceCenterNumber: e.target.value })} placeholder="Authorized service center" />
                </div>

                <div className="form-group">
                  <label>Customer Care Number</label>
                  <input type="tel" value={formData.customerCareNumber} onChange={(e) => setFormData({ ...formData, customerCareNumber: e.target.value })} placeholder="Company customer care" />
                </div>

                <div className="form-group">
                  <label>Customer Care Email Id</label>
                  <input type="email" value={formData.customerCareEmail} onChange={(e) => setFormData({ ...formData, customerCareEmail: e.target.value })} placeholder="Customer support email" />
                </div>

                <div className="form-group">
                  <label>Serial Number</label>
                  <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Warranty Expiry</label>
                  <input type="date" value={formData.warrantyExpiry} onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })} />
                </div>
              </div>

              {/* Service Provider Section */}
              <div className="form-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '15px', color: '#475569' }}>Service Provider Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name of Service</label>
                    <input type="text" value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} placeholder="e.g., Installation, Repair, Maintenance" />
                  </div>

                  <div className="form-group">
                    <label>Name of Person</label>
                    <input type="text" value={formData.servicePersonName} onChange={(e) => setFormData({ ...formData, servicePersonName: e.target.value })} placeholder="Service provider contact person" />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="tel" value={formData.serviceMobileNumber} onChange={(e) => setFormData({ ...formData, serviceMobileNumber: e.target.value })} placeholder="Service provider mobile" />
                  </div>

                  <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" value={formData.serviceCompanyName} onChange={(e) => setFormData({ ...formData, serviceCompanyName: e.target.value })} placeholder="Service provider company" />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" value={formData.serviceAddress} onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })} placeholder="Service provider address" />
                  </div>

                  <div className="form-group">
                    <label>Email Id</label>
                    <input type="email" value={formData.serviceEmailId} onChange={(e) => setFormData({ ...formData, serviceEmailId: e.target.value })} placeholder="Service provider email" />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input type="url" value={formData.serviceWebsite} onChange={(e) => setFormData({ ...formData, serviceWebsite: e.target.value })} placeholder="Service provider website" />
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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
                    <th>Name of Company</th>
                    <th>Warranty / Guarantee Date</th>
                    <th>Vendor</th>
                    <th>Date of Purchase</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.itemName}</td>
                      <td>{e.category}</td>
                      <td>{e.companyName}</td>
                      <td>{e.warrantyExpiry || 'N/A'}</td>
                      <td>{e.vendorName}</td>
                      <td>{e.purchaseDate || 'N/A'}</td>
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

export default InventoryRecord;
