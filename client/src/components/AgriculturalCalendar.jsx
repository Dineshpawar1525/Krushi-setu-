import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Droplets, 
  Wrench, 
  Wheat, 
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { calendarEventsApi } from '../services/calendarApi';

const AgriculturalCalendar = () => {
  // State variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    category: 'planting',
    description: ''
  });
  const [activeView, setActiveView] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);

  // Helper function to format date consistently (avoiding timezone issues)
  const formatDateForComparison = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to save events to localStorage immediately
  const saveEventsToLocalStorage = (eventsToSave) => {
    try {
      console.log('Directly saving events to localStorage:', eventsToSave);
      localStorage.setItem('agriCalendarEvents', JSON.stringify(eventsToSave));
      console.log('Events saved to localStorage successfully');
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  };

  // Helper function to clear localStorage and start fresh
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('agriCalendarEvents');
      console.log('localStorage cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Category configurations
  const categoryConfig = {
    planting: { 
      color: '#4CAF50', 
      icon: Wheat, 
      bgColor: '#E8F5E8',
      label: 'Planting'
    },
    watering: { 
      color: '#2196F3', 
      icon: Droplets, 
      bgColor: '#E3F2FD',
      label: 'Watering'
    },
    fertilizing: { 
      color: '#FF9800', 
      icon: Wheat, 
      bgColor: '#FFF3E0',
      label: 'Fertilizing'
    },
    harvesting: { 
      color: '#9C27B0', 
      icon: Wheat, 
      bgColor: '#F3E5F5',
      label: 'Harvesting'
    },
    maintenance: { 
      color: '#607D8B', 
      icon: Wrench, 
      bgColor: '#ECEFF1',
      label: 'Maintenance'
    },
    other: { 
      color: '#795548', 
      icon: Calendar, 
      bgColor: '#EFEBE9',
      label: 'Other'
    }
  };

  // Load events from database on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Save events to localStorage whenever they change (as fallback)
  useEffect(() => {
    // Only save if events array is not empty and not just sample events
    if (events.length > 0) {
      console.log('Saving events to localStorage:', events);
      localStorage.setItem('agriCalendarEvents', JSON.stringify(events));
      console.log('Events saved to localStorage successfully');
    }
  }, [events]);

  // Load events from database
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('agriai_token');
      console.log('Authentication token found:', !!token);
      if (!token) {
        console.log('No authentication token found, using localStorage fallback');
        // Load from localStorage if no token
        const storedEvents = localStorage.getItem('agriCalendarEvents');
        console.log('Stored events from localStorage:', storedEvents);
        if (storedEvents && storedEvents !== '[]' && storedEvents !== 'null') {
          try {
            const parsedEvents = JSON.parse(storedEvents);
            console.log('Parsed events from localStorage:', parsedEvents);
            if (parsedEvents && parsedEvents.length > 0) {
              setEvents(parsedEvents);
            } else {
              console.log('No valid events in localStorage, adding sample events');
              addSampleEvents();
            }
          } catch (error) {
            console.error('Error parsing stored events:', error);
            addSampleEvents();
          }
        } else {
          console.log('No stored events found, adding sample events');
          addSampleEvents();
        }
        return;
      }
      
      const response = await calendarEventsApi.getEvents();
      console.log('API Response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('Loading events from database:', response.data);
        // Transform database events to frontend format
        const transformedEvents = response.data.map(event => ({
          id: event._id,
          title: event.title,
          date: formatDateForComparison(new Date(event.plannedDate)),
          category: event.category || 'planting',
          description: event.description || '',
          status: event.status || 'pending',
          priority: event.priority || 'medium'
        }));
        console.log('Transformed events:', transformedEvents);
        setEvents(transformedEvents);
      } else if (response.success && response.data && response.data.length === 0) {
        console.log('Database returned empty array, checking localStorage');
        // Check localStorage first before adding sample events
        const storedEvents = localStorage.getItem('agriCalendarEvents');
        if (storedEvents && JSON.parse(storedEvents).length > 0) {
          console.log('Loading events from localStorage:', JSON.parse(storedEvents));
          setEvents(JSON.parse(storedEvents));
        } else {
          console.log('No events found, adding sample events');
          addSampleEvents();
        }
      } else {
        console.log('API response format issue, checking localStorage');
        // Check localStorage first before adding sample events
        const storedEvents = localStorage.getItem('agriCalendarEvents');
        if (storedEvents && JSON.parse(storedEvents).length > 0) {
          console.log('Loading events from localStorage:', JSON.parse(storedEvents));
          setEvents(JSON.parse(storedEvents));
        } else {
          console.log('No events found, adding sample events');
          addSampleEvents();
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to localStorage if API fails
      const storedEvents = localStorage.getItem('agriCalendarEvents');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        addSampleEvents();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add sample events for demonstration
  const addSampleEvents = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    const sampleEvents = [
      {
        id: 'sample1',
        title: 'Wheat Planting',
        date: formatDateForComparison(today),
        category: 'planting',
        description: 'Plant winter wheat in north field'
      },
      {
        id: 'sample2',
        title: 'Irrigation Check',
        date: formatDateForComparison(tomorrow),
        category: 'watering',
        description: 'Check irrigation system in all fields'
      },
      {
        id: 'sample3',
        title: 'Apply Fertilizer',
        date: formatDateForComparison(nextWeek),
        category: 'fertilizing',
        description: 'Apply organic fertilizer to corn fields'
      },
      {
        id: 'sample4',
        title: 'Tractor Maintenance',
        date: formatDateForComparison(lastWeek),
        category: 'maintenance',
        description: 'Schedule regular maintenance for the tractor'
      }
    ];
    
    setEvents(sampleEvents);
  };

  // Navigate to previous/next month
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Change calendar view (month, week, day)
  const changeView = (view) => {
    setActiveView(view);
  };

  // Select a date
  const selectDate = (date) => {
    setSelectedDate(date);
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateString = formatDateForComparison(date);
    return events.filter(event => event.date === dateString);
  };

  // Open event modal
  const openEventModal = (event = null) => {
    if (event) {
      setCurrentEvent(event);
      setEventForm({
        title: event.title,
        date: event.date,
        category: event.category,
        description: event.description
      });
    } else {
      setCurrentEvent(null);
      setEventForm({
        title: '',
        date: formatDateForComparison(selectedDate),
        category: 'planting',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  // Close event modal
  const closeEventModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm({
      ...eventForm,
      [name]: value
    });
  };

  // Handle event form submission
  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('agriai_token');
      if (!token) {
        console.log('No authentication token found, using localStorage fallback');
        // Use localStorage fallback
        const eventData = {
          id: currentEvent ? currentEvent.id : Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          title: eventForm.title,
          date: eventForm.date,
          category: eventForm.category,
          description: eventForm.description
        };
        
        console.log('Creating event with localStorage fallback:', eventData);
        
        if (currentEvent) {
          // Update existing event
          console.log('Updating existing event:', currentEvent.id);
          const updatedEvents = events.map(event => event.id === currentEvent.id ? eventData : event);
          setEvents(updatedEvents);
          saveEventsToLocalStorage(updatedEvents);
        } else {
          // Add new event
          console.log('Adding new event to localStorage');
          const newEvents = [...events, eventData];
          setEvents(newEvents);
          saveEventsToLocalStorage(newEvents);
        }
        
        closeEventModal();
        return;
      }
      
      // Prepare event data for database
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        plannedDate: new Date(eventForm.date),
        status: 'pending',
        priority: 'medium'
      };
      
      let savedEvent;
      if (currentEvent) {
        // Update existing event
        const response = await calendarEventsApi.updateEvent(currentEvent.id, eventData);
        if (response.success) {
          savedEvent = response.data;
          // Update local state
          setEvents(events.map(event => 
            event.id === currentEvent.id 
              ? {
                  ...event,
                  title: eventForm.title,
                  date: eventForm.date,
                  category: eventForm.category,
                  description: eventForm.description
                }
              : event
          ));
        }
      } else {
        // Create new event
        const response = await calendarEventsApi.createEvent(eventData);
        console.log('Create event response:', response);
        if (response.success) {
          savedEvent = response.data;
          console.log('Event created successfully:', savedEvent);
          // Add to local state
          const newEvent = {
            id: savedEvent._id,
            title: eventForm.title,
            date: eventForm.date,
            category: eventForm.category,
            description: eventForm.description,
            status: 'pending',
            priority: 'medium'
          };
          console.log('Adding new event to local state:', newEvent);
          setEvents([...events, newEvent]);
        }
      }
      
      closeEventModal();
    } catch (error) {
      console.error('Error saving event:', error);
      console.log('Falling back to localStorage due to API error');
      // Fallback to localStorage if API fails
      const eventData = {
        id: currentEvent ? currentEvent.id : Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        title: eventForm.title,
        date: eventForm.date,
        category: eventForm.category,
        description: eventForm.description
      };
      
      console.log('Creating event with localStorage fallback due to error:', eventData);
      
      if (currentEvent) {
        // Update existing event
        console.log('Updating existing event due to error:', currentEvent.id);
        const updatedEvents = events.map(event => event.id === currentEvent.id ? eventData : event);
        setEvents(updatedEvents);
        saveEventsToLocalStorage(updatedEvents);
      } else {
        // Add new event
        console.log('Adding new event to localStorage due to error');
        const newEvents = [...events, eventData];
        setEvents(newEvents);
        saveEventsToLocalStorage(newEvents);
      }
      
      closeEventModal();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event deletion
  const handleEventDelete = async () => {
    if (currentEvent) {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem('agriai_token');
        if (!token) {
          console.log('No authentication token found, using localStorage fallback');
          // Use localStorage fallback
          const updatedEvents = events.filter(event => event.id !== currentEvent.id);
          setEvents(updatedEvents);
          saveEventsToLocalStorage(updatedEvents);
          closeEventModal();
          return;
        }
        
        const response = await calendarEventsApi.deleteEvent(currentEvent.id);
        if (response.success) {
          // Remove from local state
          setEvents(events.filter(event => event.id !== currentEvent.id));
          closeEventModal();
        } else {
          alert('Error deleting event. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        // Fallback to localStorage if API fails
        const updatedEvents = events.filter(event => event.id !== currentEvent.id);
        setEvents(updatedEvents);
        saveEventsToLocalStorage(updatedEvents);
        closeEventModal();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render calendar grid
  const renderCalendar = () => {
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    // Calculate total days to render (previous month days + current month days + next month days)
    const totalDays = 42; // 6 rows of 7 days
    
    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                           today.getFullYear() === currentDate.getFullYear();
    
    const days = [];
    
    // Render days
    for (let i = 0; i < totalDays; i++) {
      let dayDate;
      let dayNumber;
      let isOtherMonth = false;
      
      // Previous month days
      if (i < daysFromPrevMonth) {
        dayNumber = prevMonthLastDay - daysFromPrevMonth + i + 1;
        dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, dayNumber);
        isOtherMonth = true;
      } 
      // Current month days
      else if (i < daysFromPrevMonth + lastDayOfMonth.getDate()) {
        dayNumber = i - daysFromPrevMonth + 1;
        dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
      } 
      // Next month days
      else {
        dayNumber = i - daysFromPrevMonth - lastDayOfMonth.getDate() + 1;
        dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, dayNumber);
        isOtherMonth = true;
      }
      
      // Check if this day is today
      const isToday = formatDateForComparison(dayDate) === formatDateForComparison(today);
      
      // Get events for this day
      const dayEvents = getEventsForDate(dayDate);
      
      days.push(
        <div
          key={i}
          className={`calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${formatDateForComparison(selectedDate) === formatDateForComparison(dayDate) ? 'selected' : ''}`}
          onClick={() => {
            selectDate(dayDate);
            // Only open form if clicking on empty date
            if (dayEvents.length === 0) {
              openEventModal();
            }
          }}
        >
          <div className="day-number">{dayNumber}</div>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.slice(0, 3).map(event => {
                const config = categoryConfig[event.category];
                const IconComponent = config.icon;
                return (
                  <div
                    key={event.id}
                    className={`event-item event-${event.category}`}
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEventModal(event);
                    }}
                  >
                    <IconComponent size={12} />
                    <span className="event-title">{event.title}</span>
                  </div>
                );
              })}
              {dayEvents.length > 3 && (
                <div className="more-events">+{dayEvents.length - 3} more</div>
              )}
              {/* Add new event button for dates with existing events */}
              <div 
                className="add-event-to-date"
                onClick={(e) => {
                  e.stopPropagation();
                  openEventModal();
                }}
                title="Add new event to this date"
              >
                <Plus size={12} />
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Get today's reminders
  const getTodayReminders = () => {
    const todayEvents = getEventsForDate(selectedDate);
    
    if (todayEvents.length === 0) {
      return <p className="empty-state">No reminders for today</p>;
    }
    
    return todayEvents.map(event => {
      const config = categoryConfig[event.category];
      const IconComponent = config.icon;
      return (
        <div
          key={event.id}
          className="reminder-item"
          onClick={() => openEventModal(event)}
        >
          <IconComponent size={16} style={{ color: config.color }} />
          <span>{event.title}</span>
        </div>
      );
    });
  };

  // Get missed tasks
  const getMissedTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const missedEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    });
    
    if (missedEvents.length === 0) {
      return <p className="empty-state">No missed tasks</p>;
    }
    
    return missedEvents.map(event => {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      
      return (
        <div
          key={event.id}
          className="task-item"
          onClick={() => openEventModal(event)}
        >
          <AlertCircle size={16} style={{ color: '#f44336' }} />
          <div>
            <div className="task-title">{event.title}</div>
            <small className="task-date">{formattedDate}</small>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="agricultural-calendar">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Agricultural Calendar...</h2>
          <p>Preparing your farming schedule</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agricultural-calendar">
      {/* Header */}
      <header className="calendar-header">
        <div className="header-left">
          <div className="logo">
            <h1>Agricultural Calendar</h1>
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            className="btn btn-primary"
            onClick={goToToday}
          >
            <Clock size={16} />
            Today
          </button>
          
          <div className="month-navigation">
            <button 
              className="nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <h2>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button 
              className="nav-btn"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="view-selector">
            <button 
              className={`view-btn ${activeView === 'month' ? 'active' : ''}`}
              onClick={() => changeView('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${activeView === 'week' ? 'active' : ''}`}
              onClick={() => changeView('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${activeView === 'day' ? 'active' : ''}`}
              onClick={() => changeView('day')}
            >
              Day
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="calendar-main">
        <div className="calendar-container">
          <div className="weekdays-header">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="calendar-sidebar">
          <section className="today-section">
            <h3>Today's Overview</h3>
            <div className="date-display">
              <span className="day-number">{selectedDate.getDate()}</span>
              <span className="month-year">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="weather-info">
              <Sun size={20} />
              <span>28°C</span>
              <span>Sunny</span>
            </div>
          </section>

          <section className="reminders-section">
            <h3>Today's Reminders</h3>
            <div className="reminders-list">
              {getTodayReminders()}
            </div>
          </section>

          <section className="missed-tasks-section">
            <h3>Missed Tasks</h3>
            <div className="tasks-list">
              {getMissedTasks()}
            </div>
          </section>

          <button 
            className="btn btn-success add-event-btn"
            onClick={() => openEventModal()}
          >
            <Plus size={16} />
            Add New Event
          </button>
        </aside>
      </main>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {currentEvent ? 'Edit Farming Event' : 'Add New Farming Event'}
              </h3>
              <button 
                className="close-modal"
                onClick={closeEventModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEventFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventForm.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Wheat Planting"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={eventForm.category}
                  onChange={handleInputChange}
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={eventForm.description}
                  onChange={handleInputChange}
                  placeholder="Add details about this farming event..."
                />
              </div>
              
              <div className="form-actions">
                {currentEvent && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleEventDelete}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
                <div className="action-buttons">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeEventModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                  >
                    <CheckCircle size={16} />
                    Save Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgriculturalCalendar;
