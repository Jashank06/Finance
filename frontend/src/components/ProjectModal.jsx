import { useState, useEffect } from 'react';
import { FiX, FiFolder, FiCalendar, FiDollarSign, FiTag, FiEdit2 } from 'react-icons/fi';
import './ProjectModal.css';

const ProjectModal = ({ isOpen, onClose, onSave, project }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    currency: 'INR',
    color: '#3B82F6',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const CURRENCY_OPTIONS = [
    'INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'
  ];

  const COLOR_OPTIONS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || '',
        currency: project.currency || 'INR',
        color: project.color || '#3B82F6',
        tags: project.tags ? project.tags.join(', ') : ''
      });
    }
  }, [project]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget && (isNaN(formData.budget) || parseFloat(formData.budget) < 0)) {
      newErrors.budget = 'Budget must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      await onSave(projectData, project?._id);
      handleClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error.response?.data?.error || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      budget: '',
      currency: 'INR',
      color: '#3B82F6',
      tags: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="project-modal-overlay" onClick={handleClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <h2>{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form className="project-modal-form" onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="form-group">
            <label className="form-label required">
              <FiFolder />
              Project Name
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FiEdit2 />
              Description
            </label>
            <textarea
              className="form-textarea"
              placeholder="Enter project description"
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="form-row">
            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                {CURRENCY_OPTIONS.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Start Date */}
            <div className="form-group">
              <label className="form-label required">
                <FiCalendar />
                Start Date
              </label>
              <input
                type="date"
                className={`form-input ${errors.startDate ? 'error' : ''}`}
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            {/* End Date */}
            <div className="form-group">
              <label className="form-label">
                <FiCalendar />
                End Date (Optional)
              </label>
              <input
                type="date"
                className={`form-input ${errors.endDate ? 'error' : ''}`}
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                min={formData.startDate}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          {/* Budget */}
          <div className="form-group">
            <label className="form-label">
              <FiDollarSign />
              Budget
            </label>
            <input
              type="number"
              step="0.01"
              className={`form-input ${errors.budget ? 'error' : ''}`}
              placeholder="Enter project budget"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
            />
            {errors.budget && <span className="error-text">{errors.budget}</span>}
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">Project Color</label>
            <div className="color-selector">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-btn ${formData.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <FiTag />
              Tags
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter tags separated by commas"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
            />
            <small className="form-hint">Separate multiple tags with commas</small>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : (project ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
