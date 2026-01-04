import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiPlus, FiX, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFilter, FiBell, FiMapPin, FiUsers, FiRepeat, FiSettings } from 'react-icons/fi';
import calendarAPI from '../../../api/calendar';
import categoriesAPI from '../../../api/categories';
import EventModal from '../../../components/EventModal';
import ManageCategories from '../../../components/ManageCategories';
import './MultipleCalendars.css';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const MultipleCalendars = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const cats = response.categories || [];
      setCategories(cats);
      // Select all categories by default
      setSelectedCategories(cats.map(c => c.value));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Load events from backend
  const loadEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      console.log('Multiple Calendars - Fetching events for:', year, month);
      const response = await calendarAPI.getMonthEvents(year, month);
      console.log('Multiple Calendars - Fetched events:', response.events?.length, response.events);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Save event handler
  const handleSaveEvent = async (eventData) => {
    try {
      if (eventData._id) {
        await calendarAPI.update(eventData._id, eventData);
      } else {
        await calendarAPI.create(eventData);
      }
      await loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
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

  // Toggle category filter
  const toggleCategory = (categoryValue) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(c => c !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  // Add event handler
  const handleAddEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  // Edit event handler
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setModalOpen(true);
  };

  // Load categories and events when component mounts
  useEffect(() => {
    trackFeatureUsage('/family/monitoring/multiple-calendars', 'view');
    fetchCategories();
  }, []);

  // Load events when date changes
  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  // Filter events based on selected categories
  useEffect(() => {
    console.log('Filtering events. Total:', events.length, 'Selected categories:', selectedCategories);
    const filtered = events.filter(event => {
      const matches = selectedCategories.includes(event.category || 'other');
      return matches;
    });
    console.log('Filtered events:', filtered.length);
    setFilteredEvents(filtered);
  }, [events, selectedCategories]);

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

  const isEventOnDate = (event, date) => {
    const eventStartDate = new Date(event.date);
    const targetDate = new Date(date);

    // Normalize dates to midnight for comparison
    eventStartDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    // Event must start on or before target date
    if (eventStartDate > targetDate) return false;

    // Check repeat end date
    if (event.repeatEndDate) {
      const endDate = new Date(event.repeatEndDate);
      endDate.setHours(0, 0, 0, 0);
      if (targetDate > endDate) return false;
    }

    if (!event.repeat || event.repeat === 'none') {
      return eventStartDate.getTime() === targetDate.getTime();
    }

    switch (event.repeat.toLowerCase()) {
      case 'daily':
        return true;
      case 'weekly':
        return eventStartDate.getDay() === targetDate.getDay();
      case 'monthly':
        return eventStartDate.getDate() === targetDate.getDate();
      case 'yearly':
        return eventStartDate.getMonth() === targetDate.getMonth() &&
          eventStartDate.getDate() === targetDate.getDate();
      default:
        return eventStartDate.getTime() === targetDate.getTime();
    }
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return filteredEvents.filter(event => isEventOnDate(event, date));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handlePrevious = () => {
    if (viewMode === 'month') handlePrevMonth();
    else if (viewMode === 'week') handlePrevWeek();
    else handlePrevDay();
  };

  const handleNext = () => {
    if (viewMode === 'month') handleNextMonth();
    else if (viewMode === 'week') handleNextWeek();
    else handleNextDay();
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getCurrentPeriodText = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${currentDate.getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
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
            <button className="btn-primary" onClick={() => handleAddEvent(new Date().toISOString().split('T')[0])}>
              <FiPlus /> Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="calendars-controls">
        <div className="view-controls">
          <div className="date-navigation">
            <button onClick={handlePrevious} className="nav-btn">
              <FiChevronLeft />
            </button>
            <h2>{getCurrentPeriodText()}</h2>
            <button onClick={handleNext} className="nav-btn">
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
            <h3>Categories</h3>
            <button
              className="manage-calendars-btn"
              onClick={() => setManageCategoriesOpen(true)}
              title="Manage Categories"
            >
              <FiSettings /> Manage
            </button>
          </div>
          <div className="calendar-legend">
            {categories.map(cat => (
              <div
                key={cat.value}
                className={`calendar-item ${selectedCategories.includes(cat.value) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat.value)}
              >
                <div
                  className="calendar-color"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'month' && (
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
                  onClick={() => day && handleAddEvent(new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0])}
                >
                  {day && (
                    <>
                      <div className="day-number">{day}</div>
                      <div className="day-events">
                        {dayEvents.slice(0, 3).map(event => {
                          const category = categories.find(cat => cat.value === event.category);
                          return (
                            <div
                              key={event._id || event.id}
                              className="event-item"
                              style={{ 
                                backgroundColor: category?.color || '#3b82f6',
                                borderLeft: `3px solid ${category?.color || '#3b82f6'}`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}
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
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="calendar-container">
          <div className="calendar-grid">
            {getWeekDays().map((date, index) => {
              const dayEvents = filteredEvents.filter(event => isEventOnDate(event, date));
              const isToday = date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <div key={index} className="week-day-column">
                  <div className={`week-day-header ${isToday ? 'today' : ''}`}>
                    <div className="day-name">{weekDays[date.getDay()]}</div>
                    <div className="day-number">{date.getDate()}</div>
                  </div>
                  <div 
                    className="week-day-events"
                    onClick={() => handleAddEvent(date.toISOString().split('T')[0])}
                  >
                    {dayEvents.map(event => {
                      const category = categories.find(cat => cat.value === event.category);
                      return (
                        <div
                          key={event._id || event.id}
                          className="event-item"
                          style={{ 
                            backgroundColor: category?.color || '#3b82f6',
                            borderLeft: `3px solid ${category?.color || '#3b82f6'}`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          <span className="event-time">{event.time}</span>
                          <span className="event-title">{event.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="calendar-container day-view-container">
          <div className="day-view-header">
            <h3>{weekDays[currentDate.getDay()]}, {monthNames[currentDate.getMonth()]} {currentDate.getDate()}</h3>
            <button className="btn-primary" onClick={() => handleAddEvent(currentDate.toISOString().split('T')[0])}>
              <FiPlus /> Add Event
            </button>
          </div>
          <div className="day-events-list">
            {filteredEvents.filter(event => isEventOnDate(event, currentDate)).length === 0 ? (
              <div className="no-events">
                <p>No events scheduled for this day</p>
                <button className="btn-primary" onClick={() => handleAddEvent(currentDate.toISOString().split('T')[0])}>
                  <FiPlus /> Add Event
                </button>
              </div>
            ) : (
              filteredEvents
                .filter(event => isEventOnDate(event, currentDate))
                .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
                .map(event => {
                  const category = categories.find(cat => cat.value === event.category);
                  return (
                    <div
                      key={event._id || event.id}
                      className="day-event-card"
                      style={{ 
                        borderLeft: `4px solid ${category?.color || '#3b82f6'}`
                      }}
                      onClick={() => handleEditEvent(event)}
                    >
                      <div className="event-time-large">{event.time || 'All day'}</div>
                      <div className="event-details-large">
                        <h4>{event.title}</h4>
                        {event.description && <p className="event-description">{event.description}</p>}
                        {event.location && (
                          <p className="event-location">
                            <FiMapPin /> {event.location}
                          </p>
                        )}
                        <div className="event-category" style={{ color: category?.color }}>
                          {category?.label || 'Other'}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        onSave={handleSaveEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
        categories={categories}
      />

      {/* Manage Categories Modal */}
      <ManageCategories
        isOpen={manageCategoriesOpen}
        onClose={() => setManageCategoriesOpen(false)}
        onUpdate={() => {
          fetchCategories();
          loadEvents();
        }}
      />
    </div>
  );
};

export default MultipleCalendars;
