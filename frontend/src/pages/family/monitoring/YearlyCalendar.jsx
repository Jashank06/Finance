import React, { useEffect, useState } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight, FiCalendar, FiTrash2, FiEdit2, FiSettings } from 'react-icons/fi';
import calendarAPI from '../../../api/calendar';
import categoriesAPI from '../../../api/categories';
import EventModal from '../../../components/EventModal';
import ManageCategories from '../../../components/ManageCategories';
import './YearlyCalendar.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const YearlyCalendar = () => {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      let response;
      
      if (view === 'year') {
        const year = currentDate.getFullYear();
        response = await calendarAPI.getYearEvents(year);
      } else {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        response = await calendarAPI.getMonthEvents(year, month);
      }
      
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => 
      selectedCategories.includes(event.category || 'other')
    );
    setFilteredEvents(filtered);
  }, [events, selectedCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchEvents();
    }
  }, [view, currentDate.getFullYear(), currentDate.getMonth(), categories.length]);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Event handlers
  const handleAddEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEditEvent = (event, e) => {
    e?.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(null);
    setModalOpen(true);
  };

  const handleDeleteEvent = async (eventId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await calendarAPI.delete(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleSaveEvent = async (eventData, eventId) => {
    try {
      if (eventId) {
        await calendarAPI.update(eventId, eventData);
      } else {
        await calendarAPI.create(eventData);
      }
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  };

  // Helper functions
  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getCurrentPeriodText = () => {
    if (view === 'year') {
      return currentDate.getFullYear().toString();
    } else if (view === 'month') {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      return `Week of ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    } else {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
  };

  // Render functions
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const getDaysInMonth = (month) => new Date(year, month + 1, 0).getDate();
    
    return (
      <div className="year-table-view">
        <div className="year-table-container">
          <table className="year-calendar-table">
            <thead>
              <tr>
                <th className="month-header">MONTH</th>
                <th className="category-header">CATEGORIES</th>
                <th colSpan="31" className="calendar-title">CALENDAR</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((monthName, monthIndex) => {
                const daysInMonth = getDaysInMonth(monthIndex);
                const monthEvents = events.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getFullYear() === year && 
                         eventDate.getMonth() === monthIndex &&
                         selectedCategories.includes(event.category || 'other');
                });
                
                // Group events by date and category
                const eventsByDateAndCategory = {};
                monthEvents.forEach(event => {
                  const day = new Date(event.date).getDate();
                  const category = event.category || 'other';
                  const key = `${day}-${category}`;
                  if (!eventsByDateAndCategory[key]) {
                    eventsByDateAndCategory[key] = [];
                  }
                  eventsByDateAndCategory[key].push(event);
                });
                
                return (
                  <React.Fragment key={monthIndex}>
                    {/* Month header row with days */}
                    <tr className="month-row">
                      <td className="month-name" rowSpan="5">{monthName.toUpperCase()}</td>
                      <td className="day-header-label">Days →</td>
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        return (
                          <td key={day} className={`day-header ${day > daysInMonth ? 'empty-day' : ''}`}>
                            {day <= daysInMonth ? day : ''}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Category rows */}
                    {categories.map((category) => (
                      <tr key={`${monthIndex}-${category.value}`} className="category-row">
                        <td className="category-label">
                          <span className="category-dot" style={{ backgroundColor: category.color }}></span>
                          {category.label}
                        </td>
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = i + 1;
                          const key = `${day}-${category.value}`;
                          const dayEvents = eventsByDateAndCategory[key] || [];
                          
                          return day <= daysInMonth && dayEvents.length > 0 ? (
                            <td 
                              key={day}
                              className="event-cell has-event"
                              style={{ backgroundColor: `${category.color}15`, borderLeft: `3px solid ${category.color}` }}
                              onClick={() => handleEditEvent(dayEvents[0])}
                              title={dayEvents.map(e => e.title).join(', ')}
                            >
                              {dayEvents.length > 1 ? `${dayEvents.length}` : '●'}
                            </td>
                          ) : (
                            <td key={day} className={`event-cell ${day > daysInMonth ? 'empty-day' : ''}`}></td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getMonthDays(year, month);
    
    return (
      <div className="month-view">
        <div className="calendar-grid">
          {DAYS.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day.fullDate);
            
            return (
              <div
                key={idx}
                className={`calendar-day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.fullDate) ? 'today' : ''}`}
                onClick={() => handleAddEvent(day.fullDate.toISOString().split('T')[0])}
              >
                <div className="day-number">{day.date}</div>
                <div className="event-list">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event._id}
                      className={`event-item ${event.category || 'other'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event, e);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="event-more">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="day-view">
        {dayEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiCalendar />
            </div>
            <div className="empty-state-text">No events for this day</div>
            <div className="empty-state-subtext">Click the + button to add an event</div>
          </div>
        ) : (
          <div className="day-events-list">
            {dayEvents.map(event => {
              const category = CATEGORIES.find(c => c.value === event.category);
              
              return (
                <div
                  key={event._id}
                  className="day-event-item"
                  style={{ borderLeftColor: category?.color || '#3B82F6' }}
                  onClick={() => handleEditEvent(event)}
                >
                  <div className="event-time">
                    {event.time || 'All day'} • {category?.label || 'Other'}
                  </div>
                  <div className="event-title">{event.title}</div>
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={(e) => handleEditEvent(event, e)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px', background: '#EF4444' }}
                      onClick={(e) => handleDeleteEvent(event._id, e)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="yearly-calendar-container">
        <div className="loading">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="yearly-calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <h1>📅 Calendar</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => handleAddEvent(new Date().toISOString().split('T')[0])}>
            <FiPlus /> Add Event
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="calendar-toolbar">
        <div className="view-selector">
          <button 
            className={`view-btn ${view === 'year' ? 'active' : ''}`}
            onClick={() => setView('year')}
          >
            Year
          </button>
          <button 
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button 
            className={`view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>

        <div className="calendar-navigation">
          <button className="nav-btn" onClick={goToPrevious}>
            <FiChevronLeft />
          </button>
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
          <div className="current-period">{getCurrentPeriodText()}</div>
          <button className="nav-btn" onClick={goToNext}>
            <FiChevronRight />
          </button>
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-filter ${selectedCategories.includes(cat.value) ? 'active' : ''}`}
              onClick={() => toggleCategory(cat.value)}
            >
              <span className="category-dot" style={{ backgroundColor: cat.color }}></span>
              {cat.label}
            </button>
          ))}
          <button
            className="category-filter manage-btn"
            onClick={() => setManageCategoriesOpen(true)}
            title="Manage Categories"
          >
            <FiSettings /> Manage
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      {view === 'year' && renderYearView()}
      {view === 'month' && renderMonthView()}
      {view === 'day' && renderDayView()}

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
          fetchEvents();
        }}
      />
    </div>
  );
};

export default YearlyCalendar;
