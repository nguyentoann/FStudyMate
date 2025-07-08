import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import PersonalScheduleModal from './PersonalScheduleModal';
import EventModal from './EventModal';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [personalSchedules, setPersonalSchedules] = useState([]);
  const [classSchedules, setClassSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchEvents();
    }
  }, [user, currentDate, view]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      console.log(`Fetching schedules for user ID: ${user.id}`);
      const [personalResponse, classResponse] = await Promise.all([
        fetch(`${API_URL}/schedule/personal/${user.id}`),
        fetch(`${API_URL}/schedule/class/${user.classId || 'default'}`)
      ]);

      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        console.log(`Received ${personalData.length} personal schedules:`, personalData);
        setPersonalSchedules(personalData);
      } else {
        console.error(`Error fetching personal schedules: ${personalResponse.status} ${personalResponse.statusText}`);
        const errorText = await personalResponse.text();
        console.error(`Response body: ${errorText}`);
      }

      if (classResponse.ok) {
        const classData = await classResponse.json();
        setClassSchedules(classData);
      } else {
        console.error(`Error fetching class schedules: ${classResponse.status} ${classResponse.statusText}`);
      }
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events/public`);
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const getSchedulesForDate = (date) => {
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7
    
    const personalForDate = personalSchedules.filter(schedule => 
      isSameDay(new Date(schedule.startTime), date)
    );

    const classForDate = classSchedules.filter(schedule => 
      schedule.dayOfWeek === dayOfWeek
    );

    return { personal: personalForDate, class: classForDate };
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startDate), date)
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowPersonalModal(true);
  };

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowPersonalModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);
    const days = eachDayOfInterval({ start: startWeek, end: endWeek });

    return (
      <div className="calendar-grid">
        {/* Header */}
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="calendar-days">
          {days.map(day => {
            const { personal, class: classScheds } = getSchedulesForDate(day);
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                
                {/* Personal Schedules */}
                <div className="day-schedules">
                  {personal.slice(0, 2).map(schedule => (
                    <div
                      key={schedule.id}
                      className="schedule-item personal"
                      style={{ backgroundColor: schedule.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleClick(schedule);
                      }}
                    >
                      {schedule.title}
                    </div>
                  ))}
                  
                  {/* Class Schedules */}
                  {classScheds.slice(0, 2).map(schedule => (
                    <div
                      key={schedule.id}
                      className="schedule-item class"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleClick(schedule);
                      }}
                    >
                      {schedule.subjectId} - {schedule.room}
                    </div>
                  ))}
                  
                  {/* Events */}
                  {dayEvents.slice(0, 1).map(event => (
                    <div
                      key={event.id}
                      className="schedule-item event"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {/* Show count if more items */}
                  {(personal.length + classScheds.length + dayEvents.length) > 5 && (
                    <div className="more-items">
                      +{(personal.length + classScheds.length + dayEvents.length) - 5} more
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

  const renderWeekView = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="week-view">
        <div className="week-header">
          {days.map(day => (
            <div key={day.toISOString()} className="week-day-header">
              <div className="week-day-name">{format(day, 'EEE')}</div>
              <div className={`week-day-number ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="week-content">
          {days.map(day => {
            const { personal, class: classScheds } = getSchedulesForDate(day);
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={day.toISOString()} className="week-day-column">
                {[...personal, ...classScheds, ...dayEvents].map((item, index) => (
                  <div
                    key={`${item.id || index}-${day.toISOString()}`}
                    className={`week-schedule-item ${item.type || 'event'}`}
                    onClick={() => {
                      if (item.type) {
                        handleScheduleClick(item);
                      } else {
                        handleEventClick(item);
                      }
                    }}
                  >
                    <div className="schedule-time">
                      {item.startTime ? format(new Date(item.startTime), 'HH:mm') : 
                       item.startDate ? format(new Date(item.startDate), 'HH:mm') : ''}
                    </div>
                    <div className="schedule-title">
                      {item.title || `${item.subjectId} - ${item.room}`}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const { personal, class: classScheds } = getSchedulesForDate(currentDate);
    const dayEvents = getEventsForDate(currentDate);
    const allItems = [...personal, ...classScheds, ...dayEvents].sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime) : new Date(a.startDate);
      const timeB = b.startTime ? new Date(b.startTime) : new Date(b.startDate);
      return timeA - timeB;
    });

    return (
      <div className="day-view">
        <div className="day-header">
          <h2>{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
        </div>
        
        <div className="day-schedule-list">
          {allItems.length === 0 ? (
            <div className="no-schedules">No schedules for today</div>
          ) : (
            allItems.map((item, index) => (
              <div
                key={`${item.id || index}-${currentDate.toISOString()}`}
                className={`day-schedule-item ${item.type || 'event'}`}
                onClick={() => {
                  if (item.type) {
                    handleScheduleClick(item);
                  } else {
                    handleEventClick(item);
                  }
                }}
              >
                <div className="schedule-time">
                  {item.startTime ? format(new Date(item.startTime), 'HH:mm') : 
                   item.startDate ? format(new Date(item.startDate), 'HH:mm') : ''}
                </div>
                <div className="schedule-content">
                  <div className="schedule-title">
                    {item.title || `${item.subjectId} - ${item.room}`}
                  </div>
                  <div className="schedule-location">
                    {item.location || item.room}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`calendar-container ${darkMode ? 'dark' : ''}`}>
        <div className="loading">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className={`calendar-container ${darkMode ? 'dark' : ''}`}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Calendar Controls */}
      <div className="calendar-controls">
        <div className="calendar-navigation">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            &lt;
          </button>
          <h2>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            &gt;
          </button>
        </div>

        <div className="calendar-view-toggle">
          <button 
            className={view === 'month' ? 'active' : ''} 
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button 
            className={view === 'week' ? 'active' : ''} 
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button 
            className={view === 'day' ? 'active' : ''} 
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>

        <div className="calendar-actions">
          <button 
            className="add-schedule-btn"
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedSchedule(null);
              setShowPersonalModal(true);
            }}
          >
            Add Schedule
          </button>
          <button 
            className="add-event-btn"
            onClick={() => {
              setSelectedEvent(null);
              setShowEventModal(true);
            }}
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="calendar-content">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Modals */}
      {showPersonalModal && (
        <PersonalScheduleModal
          isOpen={showPersonalModal}
          onClose={() => {
            setShowPersonalModal(false);
            setSelectedSchedule(null);
            setSelectedDate(null);
          }}
          schedule={selectedSchedule}
          selectedDate={selectedDate}
          onSave={() => {
            fetchSchedules();
            setShowPersonalModal(false);
          }}
        />
      )}

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

export default Calendar; 