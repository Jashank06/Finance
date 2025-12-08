import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiAlignLeft, FiRepeat, FiBell } from 'react-icons/fi';
import './EventModal.css';

const REMINDER_OPTIONS = [
  { value: '', label: 'No reminder' },
  { value: '5-minutes', label: '5 minutes before' },
  { value: '15-minutes', label: '15 minutes before' },
  { value: '30-minutes', label: '30 minutes before' },
  { value: '1-hour', label: '1 hour before' },
  { value: '1-day', label: '1 day before' },
  { value: '1-week', label: '1 week before' }
];

const REPEAT_OPTIONS = [
  { value: '', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const EventModal = ({ isOpen, onClose, onSave, event, selectedDate, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    date: '',
    time: '',
    isAllDay: false,
    location: '',
    reminder: '',
    repeat: '',
    eventColor: '#3B82F6'
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      // Edit mode
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'other',
        date: eventDate.toISOString().split('T')[0],
        time: event.time || '',
        isAllDay: event.isAllDay || false,
        location: event.location || '',
        reminder: event.reminder || '',
        repeat: event.repeat || '',
        eventColor: event.eventColor || '#3B82F6'
      });
    } else if (selectedDate) {
      // Add mode with pre-selected date
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, [event, selectedDate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-update color when category changes
    if (field === 'category') {
      const category = categories.find(c => c.value === value);
      if (category) {
        setFormData(prev => ({ ...prev, eventColor: category.color }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.isAllDay && formData.time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.time)) {
      newErrors.time = 'Invalid time format (HH:MM)';
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
      const eventData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        reminder: formData.reminder || null,
        repeat: formData.repeat || null
      };

      await onSave(eventData, event?._id);
      handleClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.error || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      date: '',
      time: '',
      isAllDay: false,
      location: '',
      reminder: '',
      repeat: '',
      eventColor: '#3B82F6'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="event-modal-overlay" onClick={handleClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <h2>{event ? 'Edit Event' : 'New Event'}</h2>
          <button className="close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form className="event-modal-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <input
              type="text"
              className={`form-input title-input ${errors.title ? 'error' : ''}`}
              placeholder="Add title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">
              <FiCalendar />
              Category
            </label>
            <div className="category-selector">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                  style={{
                    '--category-color': cat.color,
                    borderColor: formData.category === cat.value ? cat.color : '#E5E7EB'
                  }}
                  onClick={() => handleChange('category', cat.value)}
                >
                  <span className="category-dot" style={{ backgroundColor: cat.color }}></span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="form-group">
            <label className="form-label">
              <FiCalendar />
              Date & Time
            </label>
            <div className="datetime-inputs">
              <input
                type="date"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
              <input
                type="time"
                className={`form-input ${errors.time ? 'error' : ''}`}
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                disabled={formData.isAllDay}
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => handleChange('isAllDay', e.target.checked)}
                />
                All day
              </label>
            </div>
            {errors.date && <span className="error-text">{errors.date}</span>}
            {errors.time && <span className="error-text">{errors.time}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FiAlignLeft />
              Description
            </label>
            <textarea
              className="form-textarea"
              placeholder="Add description"
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              <FiClock />
              Location
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Add location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          {/* Repeat */}
          <div className="form-group">
            <label className="form-label">
              <FiRepeat />
              Repeat
            </label>
            <select
              className="form-select"
              value={formData.repeat}
              onChange={(e) => handleChange('repeat', e.target.value)}
            >
              {REPEAT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Reminder */}
          <div className="form-group">
            <label className="form-label">
              <FiBell />
              Reminder
            </label>
            <select
              className="form-select"
              value={formData.reminder}
              onChange={(e) => handleChange('reminder', e.target.value)}
            >
              {REMINDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : (event ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
