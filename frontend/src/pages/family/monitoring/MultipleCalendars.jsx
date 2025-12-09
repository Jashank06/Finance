import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiPlus, FiX, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFilter, FiBell, FiMapPin, FiUsers, FiRepeat, FiSettings } from 'react-icons/fi';
import calendarAPI from '../../../api/calendar';
import calendarTypesAPI from '../../../api/calendarTypes';
import './MultipleCalendars.css';

const MultipleCalendars = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedCalendar, setSelectedCalendar] = useState('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCalendarTypeModal, setShowCalendarTypeModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [editingCalendarType, setEditingCalendarType] = useState(null);
  const [calendarTypeForm, setCalendarTypeForm] = useState({
    name: '',
    color: '#3B82F6'
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    attendees: '',
    calendar: 'family',
    reminder: 'none',
    repeat: 'none'
  });
  const [loading, setLoading] = useState(false);

  // Load events from backend
  const loadEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await calendarAPI.getMonthEvents(year, month, selectedCalendar);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to sample data
      setEvents([
        {
          id: 1,
          title: 'Family Dinner',
          description: 'Monthly family gathering',
          date: '2024-12-15',
          time: '19:00',
          location: 'Home',
          calendar: 'family',
          reminder: '1-hour',
          repeat: 'monthly'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Save event to backend
  const saveEvent = async () => {
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time || '00:00',
        datetime: `${newEvent.date}T${newEvent.time || '00:00'}:00`,
        location: newEvent.location,
        calendar: newEvent.calendar,
        reminder: newEvent.reminder === 'none' ? null : newEvent.reminder,
        repeat: newEvent.repeat === 'none' ? null : newEvent.repeat,
        attendees: newEvent.attendees ? newEvent.attendees.split(',').map(a => ({ name: a.trim(), email: '', phone: '' })) : []
      };
      
      if (newEvent.id) {
        // Update existing event
        await calendarAPI.update(newEvent.id, eventData);
      } else {
        // Create new event
        const response = await calendarAPI.create(eventData);
        newEvent.id = response.event.id;
      }
      
      await loadEvents(); // Reload events
      resetEventForm();
      setShowEventModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    try {
      await calendarAPI.delete(eventId);
      await loadEvents(); // Reload events
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const resetEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      attendees: '',
      calendar: 'family',
      reminder: 'none',
      repeat: 'none'
    });
  };

  // Load calendar types from backend
  const loadCalendarTypes = async () => {
    try {
      const response = await calendarTypesAPI.getAll();
      setCalendars(response.calendarTypes || []);
    } catch (error) {
      console.error('Error loading calendar types:', error);
    }
  };

  // Save calendar type
  const saveCalendarType = async () => {
    try {
      if (!calendarTypeForm.name || !calendarTypeForm.color) {
        alert('Please fill in all fields');
        return;
      }

      if (editingCalendarType) {
        // Update existing
        await calendarTypesAPI.update(editingCalendarType._id, calendarTypeForm);
      } else {
        // Create new
        await calendarTypesAPI.create(calendarTypeForm);
      }

      await loadCalendarTypes();
      resetCalendarTypeForm();
      setShowCalendarTypeModal(false);
    } catch (error) {
      console.error('Error saving calendar type:', error);
      alert(error.response?.data?.error || 'Failed to save calendar type');
    }
  };

  // Delete calendar type
  const deleteCalendarType = async (id) => {
    if (window.confirm('Are you sure you want to delete this calendar type?')) {
      try {
        await calendarTypesAPI.delete(id);
        await loadCalendarTypes();
      } catch (error) {
        console.error('Error deleting calendar type:', error);
        alert(error.response?.data?.error || 'Failed to delete calendar type');
      }
    }
  };

  // Edit calendar type
  const handleEditCalendarType = (calendarType) => {
    setEditingCalendarType(calendarType);
    setCalendarTypeForm({
      name: calendarType.name,
      color: calendarType.color
    });
    setShowCalendarTypeModal(true);
  };

  const resetCalendarTypeForm = () => {
    setCalendarTypeForm({
      name: '',
      color: '#3B82F6'
    });
    setEditingCalendarType(null);
  };

  // Load calendar types and events when component mounts
  useEffect(() => {
    loadCalendarTypes();
  }, []);

  // Load events when component mounts or date/calendar changes
  useEffect(() => {
    if (calendars.length > 0) {
      loadEvents();
    }
  }, [currentDate, selectedCalendar, calendars]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Filter events based on selected calendar
    const dayEvents = events.filter(event => {
      const eventDate = event.date ? event.date.split('T')[0] : event.datetime ? event.datetime.split('T')[0] : '';
      const matchesDate = eventDate === dateStr;
      const matchesCalendar = selectedCalendar === 'all' || event.calendar === selectedCalendar;
      return matchesDate && matchesCalendar;
    });
    
    return dayEvents;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      saveEvent();
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  const toggleCalendarVisibility = (calendarId) => {
    setCalendars(calendars.map(cal => 
      cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal
    ));
    
    // If hiding the currently selected calendar, switch to 'all'
    if (selectedCalendar === calendarId) {
      setSelectedCalendar('all');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="multiple-calendars">
      <div className="calendars-header">
        <div className="header-content">
          <div className="header-text">
            <h1><FiCalendar /> Multiple Calendars</h1>
            <p>Manage and view all your calendars in one place</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowEventModal(true)}>
              <FiPlus /> Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="calendars-controls">
        <div className="view-controls">
          <div className="date-navigation">
            <button onClick={handlePrevMonth} className="nav-btn">
              <FiChevronLeft />
            </button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={handleNextMonth} className="nav-btn">
              <FiChevronRight />
            </button>
          </div>
          
          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
        </div>

        <div className="calendar-filters">
          <div className="calendar-legend-header">
            <h3>Calendar Types</h3>
            <button 
              className="manage-calendars-btn"
              onClick={() => setShowCalendarTypeModal(true)}
              title="Manage Calendar Types"
            >
              <FiSettings /> Manage
            </button>
          </div>
          <div className="calendar-legend">
            {calendars.map(calendar => (
              <div 
                key={calendar.id}
                className={`calendar-item ${!calendar.visible ? 'hidden' : ''}`}
                onClick={() => toggleCalendarVisibility(calendar.id)}
              >
                <div 
                  className="calendar-color"
                  style={{ backgroundColor: calendar.color }}
                />
                <span>{calendar.name}</span>
              </div>
            ))}
          </div>
          
          <select 
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
            className="calendar-select"
          >
            <option value="all">All Calendars</option>
            {calendars.map(calendar => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-grid">
          {/* Week days header */}
          {weekDays.map(day => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {generateCalendarDays().map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() && 
                           currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              >
                {day && (
                  <>
                    <div className="day-number">{day}</div>
                    <div className="day-events">
                      {dayEvents.slice(0, 3).map(event => {
                        const calendar = calendars.find(cal => cal.id === event.calendar);
                        return (
                          <div 
                            key={event.id}
                            className="event-item"
                            style={{ backgroundColor: calendar?.color }}
                          >
                            <span className="event-time">{event.time}</span>
                            <span className="event-title">{event.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="more-events">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Sidebar */}
      <div className="upcoming-events">
        <h3><FiClock /> Upcoming Events</h3>
        <div className="events-list">
          {events
            .filter(event => {
              const eventDateTime = new Date(event.datetime || event.date);
              const isUpcoming = eventDateTime >= new Date();
              const matchesCalendar = selectedCalendar === 'all' || event.calendar === selectedCalendar;
              return isUpcoming && matchesCalendar;
            })
            .sort((a, b) => new Date(a.datetime || a.date) - new Date(b.datetime || b.date))
            .slice(0, 5)
            .map(event => {
              const calendar = calendars.find(cal => cal.id === event.calendar);
              return (
                <div key={event.id} className="upcoming-event">
                  <div 
                    className="event-indicator"
                    style={{ backgroundColor: calendar?.color }}
                  />
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <p><FiClock /> {event.time || 'All day'}</p>
                    {event.location && <p><FiMapPin /> {event.location}</p>}
                    <p className="event-calendar">{calendar?.name}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Event</h3>
              <button onClick={() => setShowEventModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Calendar</label>
                <select
                  value={newEvent.calendar}
                  onChange={(e) => setNewEvent({ ...newEvent, calendar: e.target.value })}
                >
                  {calendars.map(calendar => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Add location"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Add description"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Reminder</label>
                  <select
                    value={newEvent.reminder}
                    onChange={(e) => setNewEvent({ ...newEvent, reminder: e.target.value })}
                  >
                    <option value="0">None</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Repeat</label>
                  <select
                    value={newEvent.repeat}
                    onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.value })}
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEventModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddEvent} className="btn-primary">
                <FiPlus /> Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Type Management Modal */}
      {showCalendarTypeModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCalendarTypeModal(false);
          resetCalendarTypeForm();
        }}>
          <div className="modal-content calendar-type-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCalendarType ? 'Edit' : 'Add'} Calendar Type</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCalendarTypeModal(false);
                  resetCalendarTypeForm();
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g., Projects, Health, Hobbies"
                  value={calendarTypeForm.name}
                  onChange={(e) => setCalendarTypeForm({...calendarTypeForm, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker-container">
                  <input
                    type="color"
                    value={calendarTypeForm.color}
                    onChange={(e) => setCalendarTypeForm({...calendarTypeForm, color: e.target.value})}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={calendarTypeForm.color}
                    onChange={(e) => setCalendarTypeForm({...calendarTypeForm, color: e.target.value})}
                    className="color-text-input"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => {
                    setShowCalendarTypeModal(false);
                    resetCalendarTypeForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={saveCalendarType} className="btn-primary">
                  <FiPlus /> {editingCalendarType ? 'Update' : 'Add'}
                </button>
              </div>

              {/* Existing Calendar Types List */}
              <div className="existing-calendar-types">
                <h3>Existing Calendar Types</h3>
                <div className="calendar-types-list">
                  {calendars.map(calendar => (
                    <div key={calendar._id} className="calendar-type-item">
                      <div className="calendar-type-info">
                        <div 
                          className="calendar-color-box"
                          style={{ backgroundColor: calendar.color }}
                        />
                        <span className="calendar-type-name">{calendar.name}</span>
                        {calendar.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <div className="calendar-type-actions">
                        <button 
                          onClick={() => handleEditCalendarType(calendar)}
                          className="btn-icon-small"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        {!calendar.isDefault && (
                          <button 
                            onClick={() => deleteCalendarType(calendar._id)}
                            className="btn-icon-small danger"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleCalendars;
