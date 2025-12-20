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
  cropName: '',
  khataNumber: '',
  projectAffected: '',
  online7_12: '',
  form8A: '',
  map: '',
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
    originalSaleDeed: '',
    mutationCertificate: '',
    landRecords: '',
    taxReceipts: '',
    loanMortgage: '',
    electricMeter: ''
  },
  legalStatus: 'Clear',
  disputes: '',
  developmentStatus: 'Undeveloped',
  notes: ''
};

const defaultPlotEntry = {
  propertyType: 'Residential Plot',
  surveyNumber: '',
  area: '',
  areaUnit: 'Sq Yards',
  location: {
    village: '',
    tehsil: '',
    district: '',
    state: '',
    pincode: ''
  },
  cropName: '',
  khataNumber: '',
  projectAffected: '',
  online7_12: '',
  form8A: '',
  map: '',
  ownershipType: 'Individual',
  owners: [{
    name: '',
    sharePercentage: '',
    relation: ''
  }],
  purchaseDate: '',
  purchasePrice: '',
  currentMarketValue: '',
  landUse: 'Residential',
  irrigationSource: '',
  soilType: '',
  boundaries: {
    north: '',
    south: '',
    east: '',
    west: ''
  },
  documents: {
    titleDeed: '',
    saleDeed: '',
    originalSaleDeed: '',
    mutationCertificate: '',
    landRecords: '',
    taxReceipts: '',
    loanMortgage: '',
    electricMeter: ''
  },
  legalStatus: 'Clear',
  disputes: '',
  developmentStatus: 'Undeveloped',
  notes: ''
};

const defaultFlatEntry = {
  propertyType: 'Apartment/Flat',
  surveyNumber: '',
  area: '',
  areaUnit: 'Sq Feet',
  floorNumber: '',
  totalFloors: '',
  wing: '',
  societyName: '',
  location: {
    village: '',
    tehsil: '',
    district: '',
    state: '',
    pincode: ''
  },
  cropName: '',
  khataNumber: '',
  projectAffected: '',
  online7_12: '',
  form8A: '',
  map: '',
  ownershipType: 'Individual',
  owners: [{
    name: '',
    sharePercentage: '',
    relation: ''
  }],
  purchaseDate: '',
  purchasePrice: '',
  currentMarketValue: '',
  landUse: 'Residential',
  irrigationSource: '',
  soilType: '',
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
  developmentStatus: 'Constructed',
  notes: ''
};

const LandRecords = () => {
  const [entries, setEntries] = useState([]);
  const [editMode, setEditMode] = useState(false); // false, 'land', 'plot', 'flat'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultEntry);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const getFormTitle = () => {
    if (editingId) return 'Edit Property Record';
    switch(editMode) {
      case 'land': return 'Add Land Record';
      case 'plot': return 'Add Plot Record';
      case 'flat': return 'Add Flat Record';
      default: return 'Add Property Record';
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (editMode && !editingId) {
      switch(editMode) {
        case 'land':
          setFormData(defaultEntry);
          break;
        case 'plot':
          setFormData(defaultPlotEntry);
          break;
        case 'flat':
          setFormData(defaultFlatEntry);
          break;
        default:
          setFormData(defaultEntry);
      }
    }
  }, [editMode, editingId]);

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
    setEditMode(item.propertyType?.toLowerCase().includes('flat') ? 'flat' : 
             item.propertyType?.toLowerCase().includes('plot') ? 'plot' : 'land');
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
                <div className="empty-actions">
                  <button className="btn-primary" onClick={() => setEditMode('land')}>
                    <FiPlus /> Add Land Record
                  </button>
                  <button className="btn-primary" onClick={() => setEditMode('plot')}>
                    <FiPlus /> Add Plot
                  </button>
                  <button className="btn-primary" onClick={() => setEditMode('flat')}>
                    <FiPlus /> Add Flat
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>Land Records ({entries.length})</h3>
                  <div className="header-buttons">
                    <button className="btn-primary" onClick={() => setEditMode('land')}>
                      <FiPlus /> Add Land Record
                    </button>
                    <button className="btn-primary" onClick={() => setEditMode('plot')}>
                      <FiPlus /> Add Plot
                    </button>
                    <button className="btn-primary" onClick={() => setEditMode('flat')}>
                      <FiPlus /> Add Flat
                    </button>
                  </div>
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
              <h3>{getFormTitle()}</h3>
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
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Apartment/Flat">Apartment/Flat</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{editMode === 'flat' ? 'Flat Number' : 'Survey Number'}</label>
                    <input
                      type="text"
                      value={formData.surveyNumber}
                      onChange={(e) => handleInputChange('surveyNumber', e.target.value)}
                      placeholder={editMode === 'flat' ? 'e.g., A-101' : 'e.g., 123/456'}
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
                      {editMode === 'land' && (
                        <>
                          <option value="Acres">Acres</option>
                          <option value="Hectares">Hectares</option>
                          <option value="Bigha">Bigha</option>
                        </>
                      )}
                      {editMode === 'plot' && (
                        <>
                          <option value="Sq Yards">Sq Yards</option>
                          <option value="Sq. Feet">Sq. Feet</option>
                          <option value="Sq. Meters">Sq. Meters</option>
                        </>
                      )}
                      {editMode === 'flat' && (
                        <>
                          <option value="Sq Feet">Sq Feet</option>
                          <option value="Sq. Meters">Sq. Meters</option>
                        </>
                      )}
                    </select>
                  </div>
                  {editMode === 'flat' && (
                    <>
                      <div className="form-group">
                        <label>Floor Number</label>
                        <input
                          type="number"
                          value={formData.floorNumber || ''}
                          onChange={(e) => handleInputChange('floorNumber', e.target.value)}
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div className="form-group">
                        <label>Total Floors</label>
                        <input
                          type="number"
                          value={formData.totalFloors || ''}
                          onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                          placeholder="e.g., 10"
                        />
                      </div>
                      <div className="form-group">
                        <label>Wing/Block</label>
                        <input
                          type="text"
                          value={formData.wing || ''}
                          onChange={(e) => handleInputChange('wing', e.target.value)}
                          placeholder="e.g., A"
                        />
                      </div>
                      <div className="form-group">
                        <label>Society Name</label>
                        <input
                          type="text"
                          value={formData.societyName || ''}
                          onChange={(e) => handleInputChange('societyName', e.target.value)}
                          placeholder="e.g., XYZ Society"
                        />
                      </div>
                    </>
                  )}
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

              {editMode === 'land' && (
              <div className="form-section">
                <h4>Land Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Crop Name</label>
                    <input
                      type="text"
                      value={formData.cropName}
                      onChange={(e) => handleInputChange('cropName', e.target.value)}
                      placeholder="e.g., Wheat, Rice, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Khata Number</label>
                    <input
                      type="text"
                      value={formData.khataNumber}
                      onChange={(e) => handleInputChange('khataNumber', e.target.value)}
                      placeholder="e.g., 123/456"
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Affected</label>
                    <input
                      type="text"
                      value={formData.projectAffected}
                      onChange={(e) => handleInputChange('projectAffected', e.target.value)}
                      placeholder="e.g., Irrigation Dept, Highway Project"
                    />
                  </div>
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
                      <option value="Clay Soil">Clay Soil</option>
                      <option value="Sandy Soil">Sandy Soil</option>
                      <option value="Loamy Soil">Loamy Soil</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-section">
              <h4>Land Records & Maps</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Online 7/12</label>
                  <input
                    type="text"
                    value={formData.online7_12}
                    onChange={(e) => handleInputChange('online7_12', e.target.value)}
                    placeholder="7/12 extract details or URL"
                  />
                </div>
                <div className="form-group">
                  <label>8-A Form</label>
                  <input
                    type="text"
                    value={formData.form8A}
                    onChange={(e) => handleInputChange('form8A', e.target.value)}
                    placeholder="8-A form details"
                  />
                </div>
                <div className="form-group">
                  <label>Map</label>
                  <input
                    type="text"
                    value={formData.map}
                    onChange={(e) => handleInputChange('map', e.target.value)}
                    placeholder="Map reference or URL"
                  />
                </div>
              </div>
            </div>

              <div className="form-section">
                <h4>Development Status</h4>
                <div className="form-grid">
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
                  <div className="form-group">
                    <label>Title Deed</label>
                    <input
                      type="text"
                      value={formData.documents.titleDeed}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, titleDeed: e.target.value })}
                      placeholder="Title deed details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sale Deed</label>
                    <input
                      type="text"
                      value={formData.documents.saleDeed}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, saleDeed: e.target.value })}
                      placeholder="Sale deed details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Sale Deed</label>
                    <input
                      type="text"
                      value={formData.documents.originalSaleDeed}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, originalSaleDeed: e.target.value })}
                      placeholder="Original sale deed details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mutation Certificate</label>
                    <input
                      type="text"
                      value={formData.documents.mutationCertificate}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, mutationCertificate: e.target.value })}
                      placeholder="Mutation certificate details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Land Records</label>
                    <input
                      type="text"
                      value={formData.documents.landRecords}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, landRecords: e.target.value })}
                      placeholder="Land record details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax Receipts</label>
                    <input
                      type="text"
                      value={formData.documents.taxReceipts}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, taxReceipts: e.target.value })}
                      placeholder="Tax receipt details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Loan / Mortgage</label>
                    <input
                      type="text"
                      value={formData.documents.loanMortgage}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, loanMortgage: e.target.value })}
                      placeholder="Loan or mortgage details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Electric Meter</label>
                    <input
                      type="text"
                      value={formData.documents.electricMeter}
                      onChange={(e) => handleInputChange('documents', { ...formData.documents, electricMeter: e.target.value })}
                      placeholder="Electric meter details"
                    />
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
