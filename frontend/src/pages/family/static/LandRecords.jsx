import { useEffect, useState } from 'react';
import { FiMap, FiHome, FiEdit2, FiTrash2, FiPlus, FiFileText, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
import './Static.css';

const defaultEntry = {
  propertyType: 'Agricultural',
  surveyNumber: '',
  area: '',
  areaUnit: 'Acres',
  location: {
    village: '',
    tehsil: '',
    district: '',
    state: '',
    pincode: ''
  },
  ownershipType: 'Individual',
  owners: [{
    name: '',
    sharePercentage: '',
    relation: ''
  }],
  purchaseDate: '',
  purchasePrice: '',
  currentMarketValue: '',
  landUse: 'Cultivation',
  irrigationSource: 'Well',
  soilType: 'Black Soil',
  boundaries: {
    north: '',
    south: '',
    east: '',
    west: ''
  },
  documents: {
    titleDeed: '',
    saleDeed: '',
    mutationCertificate: '',
    landRecords: '',
    taxReceipts: ''
  },
  legalStatus: 'Clear',
  disputes: '',
  developmentStatus: 'Undeveloped',
  notes: ''
};

const LandRecords = () => {
  const [entries, setEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await staticAPI.getLandRecords();
      setEntries(res.data || []);
    } catch (e) {
      console.error('Error fetching land records:', e);
    }
  };

  const resetForm = () => {
    setFormData(defaultEntry);
    setEditingIndex(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await staticAPI.updateLandRecord(editingId, formData);
      } else {
        await staticAPI.createLandRecord(formData);
      }
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
    if (window.confirm('Delete this land record?')) {
      try {
        await staticAPI.deleteLandRecord(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleOwnerChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.map((owner, i) => 
        i === index ? { ...owner, [field]: value } : owner
      )
    }));
  };

  const addOwner = () => {
    setFormData(prev => ({
      ...prev,
      owners: [...prev.owners, { name: '', sharePercentage: '', relation: '' }]
    }));
  };

  const removeOwner = (index) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.filter((_, i) => i !== index)
    }));
  };

  if (loading && entries.length === 0) {
    return (
      <div className="static-page">
        <div className="static-header">
          <FiMap className="section-icon" />
          <h2>Land Records</h2>
          <p>Manage your land and property records</p>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header">
        <FiMap className="section-icon" />
        <h2>Land Records</h2>
        <p>Manage your land and property records</p>
      </div>

      <div className="static-content">
        {!editMode ? (
          // List View
          <div className="entries-list">
            {entries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiMap />
                </div>
                <h3>No Land Records</h3>
                <p>Start adding your land and property records</p>
                <button className="btn-primary" onClick={() => setEditMode(true)}>
                  <FiPlus /> Add First Land Record
                </button>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>Land Records ({entries.length})</h3>
                  <button className="btn-primary" onClick={() => setEditMode(true)}>
                    <FiPlus /> Add Land Record
                  </button>
                </div>
                <div className="table-container">
                  <table className="companies-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Survey No.</th>
                        <th>Area</th>
                        <th>Location</th>
                        <th>Ownership</th>
                        <th>Market Value</th>
                        <th>Legal Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={entry._id}>
                          <td>
                            <div className="company-cell">
                              <FiMap className="company-icon" />
                              <div>
                                <div className="property-name">{entry.propertyType}</div>
                                <div className="property-subtitle">{entry.landUse}</div>
                              </div>
                            </div>
                          </td>
                          <td>{entry.surveyNumber || 'N/A'}</td>
                          <td>
                            {entry.area} {entry.areaUnit}
                          </td>
                          <td>
                            <div className="location-cell">
                              <FiMapPin />
                              {entry.location?.village}, {entry.location?.tehsil}
                            </div>
                          </td>
                          <td>{entry.ownershipType}</td>
                          <td>
                            <div className="value-cell">
                              <FiDollarSign />
                              {entry.currentMarketValue || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge status-${entry.legalStatus?.toLowerCase()}`}>
                              {entry.legalStatus}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="btn-edit" onClick={() => handleEdit(index)}>
                                <FiEdit2 />
                              </button>
                              <button className="btn-delete" onClick={() => handleDelete(index)}>
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
          // Form View
          <div className="static-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit Land Record' : 'Add Land Record'}</h3>
              <button className="btn-secondary" onClick={() => { setEditMode(false); resetForm(); }}>
                <FiPlus /> Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="static-form-content">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      required
                    >
                      <option value="Agricultural">Agricultural</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Mixed Use">Mixed Use</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Survey Number</label>
                    <input
                      type="text"
                      value={formData.surveyNumber}
                      onChange={(e) => handleInputChange('surveyNumber', e.target.value)}
                      placeholder="e.g., 123/456"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Area</label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="e.g., 2.5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Area Unit</label>
                    <select
                      value={formData.areaUnit}
                      onChange={(e) => handleInputChange('areaUnit', e.target.value)}
                      required
                    >
                      <option value="Acres">Acres</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Sq. Feet">Sq. Feet</option>
                      <option value="Sq. Meters">Sq. Meters</option>
                      <option value="Bigha">Bigha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Location Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Village/City</label>
                    <input
                      type="text"
                      value={formData.location.village}
                      onChange={(e) => handleLocationChange('village', e.target.value)}
                      placeholder="e.g., Ramnagar"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tehsil/Block</label>
                    <input
                      type="text"
                      value={formData.location.tehsil}
                      onChange={(e) => handleLocationChange('tehsil', e.target.value)}
                      placeholder="e.g., North Block"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      value={formData.location.district}
                      onChange={(e) => handleLocationChange('district', e.target.value)}
                      placeholder="e.g., Pune"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) => handleLocationChange('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={formData.location.pincode}
                      onChange={(e) => handleLocationChange('pincode', e.target.value)}
                      placeholder="e.g., 411001"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Ownership Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ownership Type</label>
                    <select
                      value={formData.ownershipType}
                      onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                      required
                    >
                      <option value="Individual">Individual</option>
                      <option value="Joint">Joint</option>
                      <option value="Family">Family</option>
                      <option value="Company">Company</option>
                      <option value="Trust">Trust</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Purchase Price</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      placeholder="e.g., 5000000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Market Value</label>
                    <input
                      type="text"
                      value={formData.currentMarketValue}
                      onChange={(e) => handleInputChange('currentMarketValue', e.target.value)}
                      placeholder="e.g., 7500000"
                    />
                  </div>
                </div>

                <div className="owners-section">
                  <div className="owners-header">
                    <h5>Owners</h5>
                    <button type="button" className="btn-add-owner" onClick={addOwner}>
                      <FiPlus /> Add Owner
                    </button>
                  </div>
                  {formData.owners.map((owner, index) => (
                    <div key={index} className="owner-row">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Owner Name</label>
                          <input
                            type="text"
                            value={owner.name}
                            onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
                            placeholder="Owner name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Share %</label>
                          <input
                            type="text"
                            value={owner.sharePercentage}
                            onChange={(e) => handleOwnerChange(index, 'sharePercentage', e.target.value)}
                            placeholder="e.g., 50"
                          />
                        </div>
                        <div className="form-group">
                          <label>Relation</label>
                          <input
                            type="text"
                            value={owner.relation}
                            onChange={(e) => handleOwnerChange(index, 'relation', e.target.value)}
                            placeholder="e.g., Self, Father, etc."
                          />
                        </div>
                        <div className="form-group">
                          <button
                            type="button"
                            className="btn-remove-owner"
                            onClick={() => removeOwner(index)}
                            disabled={formData.owners.length === 1}
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>Land Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Land Use</label>
                    <select
                      value={formData.landUse}
                      onChange={(e) => handleInputChange('landUse', e.target.value)}
                    >
                      <option value="Cultivation">Cultivation</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Vacant">Vacant</option>
                      <option value="Recreational">Recreational</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Irrigation Source</label>
                    <select
                      value={formData.irrigationSource}
                      onChange={(e) => handleInputChange('irrigationSource', e.target.value)}
                    >
                      <option value="Well">Well</option>
                      <option value="Canal">Canal</option>
                      <option value="Borewell">Borewell</option>
                      <option value="Rain-fed">Rain-fed</option>
                      <option value="Drip">Drip Irrigation</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Soil Type</label>
                    <select
                      value={formData.soilType}
                      onChange={(e) => handleInputChange('soilType', e.target.value)}
                    >
                      <option value="Black Soil">Black Soil</option>
                      <option value="Red Soil">Red Soil</option>
                      <option value="Alluvial">Alluvial</option>
                      <option value="Clay">Clay</option>
                      <option value="Sandy">Sandy</option>
                      <option value="Loamy">Loamy</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Development Status</label>
                    <select
                      value={formData.developmentStatus}
                      onChange={(e) => handleInputChange('developmentStatus', e.target.value)}
                    >
                      <option value="Undeveloped">Undeveloped</option>
                      <option value="Partially Developed">Partially Developed</option>
                      <option value="Fully Developed">Fully Developed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Boundaries</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>North</label>
                    <input
                      type="text"
                      value={formData.boundaries.north}
                      onChange={(e) => handleInputChange('boundaries', { ...formData.boundaries, north: e.target.value })}
                      placeholder="e.g., Road, Property Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>South</label>
                    <input
                      type="text"
                      value={formData.boundaries.south}
                      onChange={(e) => handleInputChange('boundaries', { ...formData.boundaries, south: e.target.value })}
                      placeholder="e.g., Road, Property Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>East</label>
                    <input
                      type="text"
                      value={formData.boundaries.east}
                      onChange={(e) => handleInputChange('boundaries', { ...formData.boundaries, east: e.target.value })}
                      placeholder="e.g., Road, Property Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>West</label>
                    <input
                      type="text"
                      value={formData.boundaries.west}
                      onChange={(e) => handleInputChange('boundaries', { ...formData.boundaries, west: e.target.value })}
                      placeholder="e.g., Road, Property Name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Legal & Documents</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Legal Status</label>
                    <select
                      value={formData.legalStatus}
                      onChange={(e) => handleInputChange('legalStatus', e.target.value)}
                    >
                      <option value="Clear">Clear</option>
                      <option value="Under Litigation">Under Litigation</option>
                      <option value="Disputed">Disputed</option>
                      <option value="Mortgaged">Mortgaged</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Legal Disputes (if any)</label>
                    <textarea
                      value={formData.disputes}
                      onChange={(e) => handleInputChange('disputes', e.target.value)}
                      placeholder="Describe any ongoing or past legal disputes..."
                      rows={3}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any additional information about the property..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setEditMode(false); resetForm(); }}>
                  <FiPlus /> Cancel
                </button>
                <button type="submit" className="btn-success">
                  <FiEdit2 /> {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandRecords;
