import { useEffect, useState, useRef } from 'react';
import { FiMail, FiSmartphone, FiEdit2, FiTrash2, FiPlus, FiPhone, FiUpload, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import { syncRemindersFromForm } from '../../../utils/remindersSyncUtil';
import { syncBillScheduleFromForm } from '../../../utils/billScheduleSyncUtil';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultEntry = {
  type: 'Mobile',
  name: '',
  relation: '',
  mobile: '',
  carrier: '',
  simType: 'Prepaid',
  planName: '',
  planAmount: '',
  address: '',
  alternateNumber: '',
  customerCareNo: '',
  customerCareEmail: '',
  billingCycle: '',
  accountNo: '',
  email: '',
  provider: 'Gmail',
  googleAccountEmail: '',
  recoveryEmail: '',
  recoveryNumber: '',
  alternateEmails: '',
  passkeysAndSecurityKey: '',
  password: '',
  purpose: '',
  twoFA: false,
  notes: '',
};

const MobileEmailDetails = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);


  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const calculateCompletionPercentage = (entry) => {
    const isMobile = entry.type === 'Mobile';
    const mandatoryFields = [
      'type',
      'name',
      'relation',
      isMobile ? 'carrier' : 'provider',
      isMobile ? 'mobile' : 'email'
    ];
    let filledFields = 0;
    mandatoryFields.forEach(field => {
      if (entry[field] && entry[field].toString().trim() !== '') {
        filledFields++;
      }
    });
    return Math.round((filledFields / mandatoryFields.length) * 100);
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
    trackFeatureUsage('/family/static/mobile-email-details', 'view');
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

      // Sync to other modules in parallel
      await Promise.all([
        syncContactsFromForm(formData, 'MobileEmailDetails'),
        syncCustomerSupportFromForm(formData, 'MobileEmailDetails'),
        syncRemindersFromForm(formData, 'MobileEmailDetails'),
        syncBillScheduleFromForm(formData, 'MobileEmailDetails')
      ]);

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
        await staticAPI.deleteMobileEmailDetails(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  const getValue = (row, key) => {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '').trim();
    const actualKey = Object.keys(row).find(k =>
      k.toLowerCase().replace(/\s+/g, '').trim() === normalizedKey
    );
    return actualKey ? row[actualKey] : undefined;
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Excel file is empty!');
        setUploading(false);
        return;
      }

      const required = ['Type'];
      const firstRow = jsonData[0];
      const missing = required.filter(col => !(col in firstRow));
      if (missing.length > 0) {
        alert(`Missing required column: ${missing.join(', ')}`);
        setUploading(false);
        return;
      }

      const records = jsonData.map(row => ({
        type: getValue(row, 'Type') || 'Mobile',
        name: getValue(row, 'Name') || '',
        relation: getValue(row, 'Relation') || '',
        mobile: getValue(row, 'Mobile') || '',
        carrier: getValue(row, 'Carrier') || '',
        simType: getValue(row, 'SIM Type') || 'Prepaid',
        planName: getValue(row, 'Plan Name') || '',
        planAmount: getValue(row, 'Plan Amount') || '',
        address: getValue(row, 'Address') || '',
        alternateNumber: getValue(row, 'Alternate Number') || '',
        customerCareNo: getValue(row, 'Customer Care No') || '',
        customerCareEmail: getValue(row, 'Customer Care Email') || '',
        billingCycle: getValue(row, 'Billing Cycle') || '',
        accountNo: getValue(row, 'Account No') || '',
        email: getValue(row, 'Email') || '',
        provider: getValue(row, 'Provider') || '',
        googleAccountEmail: getValue(row, 'Google Account Email') || '',
        recoveryEmail: getValue(row, 'Recovery Email') || '',
        recoveryNumber: getValue(row, 'Recovery Number') || '',
        alternateEmails: getValue(row, 'Alternate Emails') || '',
        passkeysAndSecurityKey: getValue(row, 'Passkeys') || '',
        password: getValue(row, 'Password') || '',
        purpose: getValue(row, 'Purpose') || '',
        notes: getValue(row, 'Notes') || '',
        ownerName: getValue(row, 'Owner Name') || '',
        relationship: getValue(row, 'Relationship') || '',
        isPrimary: getValue(row, 'Is Primary') === 'Yes',
        twoFA: getValue(row, '2FA') === 'Enabled',
      }));

      const res = await staticAPI.bulkCreateMobileEmailDetails({ records });

      const syncPromises = [];
      for (const record of records) {
        syncPromises.push(
          syncContactsFromForm(record, 'MobileEmailDetails'),
          syncCustomerSupportFromForm(record, 'MobileEmailDetails'),
          syncRemindersFromForm(record, 'MobileEmailDetails'),
          syncBillScheduleFromForm(record, 'MobileEmailDetails')
        );
      }
      await Promise.allSettled(syncPromises);

      await fetchEntries();
      alert(`Import completed!\nSuccess: ${res.data.created}\nErrors: ${res.data.errors?.length || 0}`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Type: 'Mobile',
        Name: 'Rahul Sharma',
        Relation: 'Self',
        Mobile: '+91 9876543210',
        Carrier: 'Jio',
        'SIM Type': 'Prepaid',
        'Plan Name': 'Rs. 299 Plan',
        'Plan Amount': '299',
        Address: 'Mumbai, Maharashtra',
        'Alternate Number': '+91 9876543211',
        'Customer Care No': '1800-123-4567',
        'Customer Care Email': 'care@jio.com',
        'Billing Cycle': 'Monthly',
        'Account No': 'CUST001',
        Email: '',
        Provider: '',
        'Google Account Email': '',
        'Recovery Email': '',
        'Recovery Number': '',
        'Alternate Emails': '',
        Passkeys: '',
        Password: '',
        Purpose: '',
        Notes: 'Primary mobile number',
        'Owner Name': '',
        Relationship: '',
        'Is Primary': 'Yes',
        '2FA': 'Disabled',
      },
      {
        Type: 'Mobile',
        Name: 'Priya Sharma',
        Relation: 'Spouse',
        Mobile: '+91 9876543212',
        Carrier: 'Airtel',
        'SIM Type': 'Postpaid',
        'Plan Name': 'Rs. 499 Plan',
        'Plan Amount': '499',
        Address: 'Mumbai, Maharashtra',
        'Alternate Number': '',
        'Customer Care No': '1800-987-6543',
        'Customer Care Email': 'help@airtel.com',
        'Billing Cycle': 'Monthly',
        'Account No': 'CUST002',
        Email: '',
        Provider: '',
        'Google Account Email': '',
        'Recovery Email': '',
        'Recovery Number': '',
        'Alternate Emails': '',
        Passkeys: '',
        Password: '',
        Purpose: '',
        Notes: 'Secondary mobile number',
        'Owner Name': '',
        Relationship: '',
        'Is Primary': 'No',
        '2FA': 'Disabled',
      },
      {
        Type: 'Email',
        Name: 'Rahul Sharma',
        Relation: 'Self',
        Mobile: '',
        Carrier: '',
        'SIM Type': '',
        'Plan Name': '',
        'Plan Amount': '',
        Address: '',
        'Alternate Number': '',
        'Customer Care No': '',
        'Customer Care Email': '',
        'Billing Cycle': '',
        'Account No': '',
        Email: 'rahul.sharma@gmail.com',
        Provider: 'Gmail',
        'Google Account Email': 'rahul.sharma@gmail.com',
        'Recovery Email': 'rahul.recovery@yahoo.com',
        'Recovery Number': '+91 9876543210',
        'Alternate Emails': 'rahul.work@outlook.com',
        Passkeys: 'YubiKey #1234',
        Password: '********',
        Purpose: 'Personal email',
        Notes: 'Primary email with 2FA',
        'Owner Name': '',
        Relationship: '',
        'Is Primary': 'Yes',
        '2FA': 'Enabled',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Mobile_Email_Template.xlsx');
  };

  return (
    <div className="static-page">
      <div className="static-header" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="header-content">
          <div className="header-icon">
            <FiPhone />
          </div>
          <div className="header-text">
            <h1 style={{ color: '#0A0A0A' }}>Mobile & Email Details</h1>
            <p style={{ color: '#4A5568' }}>Keep important contact and access details for family members</p>
          </div>
        </div>
        <div className="header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
          <button
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <FiUpload /> {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Excel'}
          </button>
          <button className="btn-secondary" onClick={downloadTemplate}>
            <FiDownload /> Template
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
                  >
                    <option>Mobile</option>
                    <option>Email</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mobile/Email</label>
                  <input
                    type="text"
                    value={formData.type === 'Mobile' ? formData.mobile : formData.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      [formData.type === 'Mobile' ? 'mobile' : 'email']: e.target.value
                    })}
                    placeholder={formData.type === 'Mobile' ? '+91 9876543210' : 'example@email.com'}
                  />
                </div>

                <div className="form-group">
                  <label>Provider/Carrier</label>
                  <input
                    type="text"
                    value={formData.type === 'Mobile' ? formData.carrier : formData.provider}
                    onChange={(e) => setFormData({
                      ...formData,
                      [formData.type === 'Mobile' ? 'carrier' : 'provider']: e.target.value
                    })}
                    placeholder={formData.type === 'Mobile' ? 'Airtel, Jio, etc.' : 'Gmail, Yahoo, etc.'}
                  />
                </div>

                <div className="form-group">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Family member name"
                  />
                </div>

                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Self, Spouse, Child, Parent, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Is Primary</label>
                  <select
                    value={formData.isPrimary ? 'Yes' : 'No'}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
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

                {formData.type === 'Mobile' && (
                  <>
                    <div className="form-group">
                      <label>Plan Name</label>
                      <input
                        type="text"
                        value={formData.planName}
                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                        placeholder="Mobile plan name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Plan Amount</label>
                      <input
                        type="text"
                        value={formData.planAmount}
                        onChange={(e) => setFormData({ ...formData, planAmount: e.target.value })}
                        placeholder="Monthly/Annual plan amount"
                      />
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Registered address"
                      />
                    </div>

                    <div className="form-group">
                      <label>Alternate Number</label>
                      <input
                        type="text"
                        value={formData.alternateNumber}
                        onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
                        placeholder="Alternate contact number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Customer Care No.</label>
                      <input
                        type="text"
                        value={formData.customerCareNo}
                        onChange={(e) => setFormData({ ...formData, customerCareNo: e.target.value })}
                        placeholder="Customer service number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Customer Care Email</label>
                      <input
                        type="email"
                        value={formData.customerCareEmail}
                        onChange={(e) => setFormData({ ...formData, customerCareEmail: e.target.value })}
                        placeholder="Customer service email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Billing Cycle</label>
                      <input
                        type="text"
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                        placeholder="Monthly, Quarterly, Yearly"
                      />
                    </div>

                    <div className="form-group">
                      <label>Account No. / Customer No.</label>
                      <input
                        type="text"
                        value={formData.accountNo}
                        onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                        placeholder="Account or customer number"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'Email' && (
                  <>
                    <div className="form-group">
                      <label>Google Account Email</label>
                      <input
                        type="email"
                        value={formData.googleAccountEmail}
                        onChange={(e) => setFormData({ ...formData, googleAccountEmail: e.target.value })}
                        placeholder="Google account email address"
                      />
                    </div>

                    <div className="form-group">
                      <label>Recovery Email</label>
                      <input
                        type="email"
                        value={formData.recoveryEmail}
                        onChange={(e) => setFormData({ ...formData, recoveryEmail: e.target.value })}
                        placeholder="Recovery email address"
                      />
                    </div>

                    <div className="form-group">
                      <label>Recovery Number</label>
                      <input
                        type="tel"
                        value={formData.recoveryNumber}
                        onChange={(e) => setFormData({ ...formData, recoveryNumber: e.target.value })}
                        placeholder="Recovery phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Alternate Emails</label>
                      <input
                        type="text"
                        value={formData.alternateEmails}
                        onChange={(e) => setFormData({ ...formData, alternateEmails: e.target.value })}
                        placeholder="Alternate email addresses (comma separated)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Passkeys and Security Key</label>
                      <input
                        type="text"
                        value={formData.passkeysAndSecurityKey}
                        onChange={(e) => setFormData({ ...formData, passkeysAndSecurityKey: e.target.value })}
                        placeholder="Passkeys and security key information"
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Email password"
                      />
                    </div>

                    <div className="form-group">
                      <label>Purpose</label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Purpose of this email account"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information"
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
                    <th>Completion %</th>
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
                        <div className="completion-percentage">
                          <div className={`completion-bar ${calculateCompletionPercentage(e) === 100 ? 'complete' : calculateCompletionPercentage(e) > 50 ? 'partial' : 'low'}`}>
                            <div className="completion-fill" style={{ width: `${calculateCompletionPercentage(e)}%` }}></div>
                          </div>
                          <span className="completion-text">{calculateCompletionPercentage(e)}%</span>
                        </div>
                      </td>
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

export default MobileEmailDetails;
