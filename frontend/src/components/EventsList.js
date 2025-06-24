import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import EventModal from './EventModal';
import './EventsList.css';

const EventsList = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    eventType: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/public`);
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by event type
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filters.eventType);
    }

    // Filter by date range
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= now && eventDate <= weekFromNow;
        });
        break;
      case 'month':
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= now && eventDate <= monthFromNow;
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= now;
        });
        break;
      default:
        break;
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleRegisterForEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/register/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Successfully registered for event!');
          fetchEvents(); // Refresh events to update registration status
        } else {
          alert(result.message || 'Failed to register for event');
        }
      } else {
        throw new Error('Failed to register for event');
      }
    } catch (err) {
      alert('Error registering for event: ' + err.message);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      academic: '#3b82f6',
      social: '#10b981',
      sports: '#f59e0b',
      cultural: '#8b5cf6',
      other: '#6b7280'
    };
    return colors[eventType] || colors.other;
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      academic: 'fas fa-graduation-cap',
      social: 'fas fa-users',
      sports: 'fas fa-running',
      cultural: 'fas fa-music',
      other: 'fas fa-calendar'
    };
    return icons[eventType] || icons.other;
  };

  if (loading) {
    return (
      <div className={`events-list-container ${darkMode ? 'dark' : ''}`}>
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className={`events-list-container ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="events-header">
        <div className="header-left">
          <h2>Campus Events</h2>
          <p>{filteredEvents.length} events found</p>
        </div>
        <button
          className="create-event-btn"
          onClick={() => {
            setSelectedEvent(null);
            setShowEventModal(true);
          }}
        >
          <i className="fas fa-plus"></i>
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="events-filters">
        <div className="filter-group">
          <label>Event Type:</label>
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="academic">Academic</option>
            <option value="social">Social</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search events..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </div>

      {/* Events List */}
      <div className="events-list">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <i className="fas fa-calendar-times"></i>
            <h3>No events found</h3>
            <p>Try adjusting your filters or create a new event</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-type-badge" style={{ backgroundColor: getEventTypeColor(event.eventType) }}>
                  <i className={getEventTypeIcon(event.eventType)}></i>
                  {event.eventType}
                </div>
                <div className="event-date">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </div>
              </div>

              <div className="event-content" onClick={() => handleEventClick(event)}>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">
                  {event.description?.substring(0, 150)}
                  {event.description?.length > 150 && '...'}
                </p>
                
                <div className="event-details">
                  <div className="event-time">
                    <i className="fas fa-clock"></i>
                    {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                  </div>
                  
                  {event.location && (
                    <div className="event-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {event.location}
                    </div>
                  )}
                </div>

                <div className="event-stats">
                  <div className="participants">
                    <i className="fas fa-users"></i>
                    {event.currentParticipants || 0}
                    {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                  </div>
                  
                  {event.registrationDeadline && (
                    <div className="registration-deadline">
                      <i className="fas fa-calendar-check"></i>
                      Registration until {format(new Date(event.registrationDeadline), 'MMM dd, HH:mm')}
                    </div>
                  )}
                </div>
              </div>

              <div className="event-actions">
                <button
                  className="register-btn"
                  onClick={() => handleRegisterForEvent(event.id)}
                  disabled={new Date() > new Date(event.registrationDeadline || event.startDate)}
                >
                  <i className="fas fa-user-plus"></i>
                  Register
                </button>
                
                <button
                  className="view-details-btn"
                  onClick={() => handleEventClick(event)}
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onSave={() => {
            fetchEvents();
            setShowEventModal(false);
          }}
        />
      )}
    </div>
  );
};

export default EventsList; 