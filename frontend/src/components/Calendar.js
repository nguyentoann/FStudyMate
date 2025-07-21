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
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, currentDate, view]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects and lecturers first
      const [subjectsResponse, lecturersResponse] = await Promise.all([
        fetch(`${API_URL}/subjects`),
        fetch(`${API_URL}/users/lecturers`)
      ]);
      
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
        console.log(`Loaded ${subjectsData.length} subjects`);
      }
      
      if (lecturersResponse.ok) {
        const lecturersData = await lecturersResponse.json();
        setLecturers(lecturersData);
        console.log(`Loaded ${lecturersData.length} lecturers`);
      }
      
      // Now fetch schedules and events
      await Promise.all([fetchSchedules(), fetchEvents()]);
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      console.log(`Fetching schedules for user ID: ${user.id}, class ID: ${user.classId}`);
      
      // Get class ID from user object or localStorage
      const classId = user.classId || localStorage.getItem('userClassId');
      console.log(`Using class ID for schedule fetch: ${classId}`);
      
      // For students, fetch all schedules and filter by their class ID on the client side
      const endpoints = {
        personal: `${API_URL}/schedule/personal/${user.id}`,
        class: user.role === 'student' 
          ? `${API_URL}/schedule/class/all` 
          : `${API_URL}/schedule/class/${classId || 'default'}`
      };
      
      console.log(`Fetching class schedules from: ${endpoints.class}`);
      
      const [personalResponse, classResponse] = await Promise.all([
        fetch(endpoints.personal),
        fetch(endpoints.class)
      ]);

      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        const personalArray = Array.isArray(personalData) ? personalData : [];
        console.log(`Received ${personalArray.length} personal schedules:`, personalArray);
        setPersonalSchedules(personalArray);
      } else {
        console.error(`Error fetching personal schedules: ${personalResponse.status} ${personalResponse.statusText}`);
        const errorText = await personalResponse.text();
        console.error(`Response body: ${errorText}`);
        setPersonalSchedules([]);
      }

      if (classResponse.ok) {
        let classData = await classResponse.json();
        const classArray = Array.isArray(classData) ? classData : [];
        console.log(`Received ${classArray.length} total class schedules`);
        
        // For students, filter schedules to only show their class's schedules
        if (user.role === 'student' && classId) {
          const filteredClassArray = classArray.filter(schedule => schedule.classId === classId);
          console.log(`Filtered to ${filteredClassArray.length} schedules for class ID ${classId}`);
          setClassSchedules(filteredClassArray);
        } else {
          setClassSchedules(classArray);
        }
      } else {
        console.error(`Error fetching class schedules: ${classResponse.status} ${classResponse.statusText}`);
        const errorText = await classResponse.text();
        console.error(`Response body: ${errorText}`);
        setClassSchedules([]);
      }
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error('Error fetching schedules:', err);
      setPersonalSchedules([]);
      setClassSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events/public`);
      if (response.ok) {
        const eventsData = await response.json();
        const eventsArray = Array.isArray(eventsData) ? eventsData : [];
        setEvents(eventsArray);
      } else {
        console.error(`Error fetching events: ${response.status} ${response.statusText}`);
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    }
  };

  const getSchedulesForDate = (date) => {
    if (!date) return { personal: [], class: [] };
    
    const dateStr = safeFormatDate(date, 'yyyy-MM-dd');
    console.log(`Getting schedules for date: ${dateStr}`);
    
    // Ensure personalSchedules is an array
    const personalArray = Array.isArray(personalSchedules) ? personalSchedules : [];
    
    const personalForDate = personalArray.filter(schedule => {
      if (!schedule || !schedule.startTime) return false;
      try {
        const scheduleDate = new Date(schedule.startTime);
        if (isNaN(scheduleDate.getTime())) return false;
        return isSameDay(scheduleDate, date);
      } catch (err) {
        console.error('Error comparing personal schedule dates:', err);
        return false;
      }
    });

    // Ensure classSchedules is an array
    const classArray = Array.isArray(classSchedules) ? classSchedules : [];
    
    // Filter class schedules by specific date
    const classForDate = classArray.filter(schedule => {
      if (!schedule || !schedule.specificDate) return false;
      
      try {
        // Compare the date strings (ignoring time)
        const scheduleDate = schedule.specificDate.split('T')[0];
        const isSameDate = scheduleDate === dateStr;
        
        console.log(`Class schedule: ID=${schedule.id}, specificDate=${scheduleDate}, current date=${dateStr}, matches=${isSameDate}`);
        return isSameDate;
      } catch (err) {
        console.error('Error comparing class schedule dates:', err);
        return false;
      }
    });
    
    console.log(`Found ${classForDate.length} class schedules for date ${dateStr}`);

    return { personal: personalForDate, class: classForDate };
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    // Ensure events is an array
    const eventsArray = Array.isArray(events) ? events : [];
    
    return eventsArray.filter(event => {
      if (!event || !event.startDate) return false;
      
      try {
        const eventDate = new Date(event.startDate);
        if (isNaN(eventDate.getTime())) return false;
        return isSameDay(eventDate, date);
      } catch (err) {
        console.error('Error comparing event dates:', err);
        return false;
      }
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowPersonalModal(true);
  };

  const handleScheduleClick = (schedule) => {
    try {
      if (!schedule) {
        console.error('Schedule is undefined or null');
        return;
      }
      
      // Create a safe copy of the schedule with validated dates
      const safeSchedule = { ...schedule };
      
      // Handle specificDate safely
      if (safeSchedule.specificDate) {
        try {
          const specificDate = new Date(safeSchedule.specificDate);
          if (isNaN(specificDate.getTime())) {
            // If date is invalid, set it to null
            safeSchedule.specificDate = null;
          }
        } catch (err) {
          console.error('Error parsing specificDate:', err);
          safeSchedule.specificDate = null;
        }
      }
      
      // Handle startTime and endTime safely
      if (safeSchedule.startTime && typeof safeSchedule.startTime === 'string') {
        if (safeSchedule.startTime.includes('T')) {
          try {
            const startDate = new Date(safeSchedule.startTime);
            if (!isNaN(startDate.getTime())) {
              safeSchedule.startTime = safeFormatDate(startDate, 'HH:mm:ss');
            }
          } catch (err) {
            console.error('Error parsing startTime:', err);
          }
        }
      }
      
      if (safeSchedule.endTime && typeof safeSchedule.endTime === 'string') {
        if (safeSchedule.endTime.includes('T')) {
          try {
            const endDate = new Date(safeSchedule.endTime);
            if (!isNaN(endDate.getTime())) {
              safeSchedule.endTime = safeFormatDate(endDate, 'HH:mm:ss');
            }
          } catch (err) {
            console.error('Error parsing endTime:', err);
          }
        }
      }
      
      setSelectedSchedule(safeSchedule);
      setShowPersonalModal(true);
    } catch (err) {
      console.error('Error in handleScheduleClick:', err);
    }
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
                <div className="day-number">{safeFormatDate(day, 'd')}</div>
                
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
                      {schedule.subjectId ? (
                        typeof schedule.subjectId === 'object' ? 
                          schedule.subjectId.code : 
                          getSubjectCode(schedule.subjectId)
                      ) : schedule.subject ? (
                        schedule.subject.code
                      ) : (
                        schedule.title || 'Class'
                      )}
                      {schedule.room && (
                        <div className="schedule-location">
                          {typeof schedule.room === 'object' ? schedule.room.name : schedule.room}
                        </div>
                      )}
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
              <div className="week-day-name">{safeFormatDate(day, 'EEE').toUpperCase()}</div>
              <div className={`week-day-number ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                {safeFormatDate(day, 'd')}
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
                {[...personal, ...classScheds, ...dayEvents].map((item, index) => {
                  const subjectCode = item.subjectId ? 
                    (typeof item.subjectId === 'object' ? item.subjectId.code : getSubjectCode(item.subjectId)) : 
                    (item.subject ? item.subject.code : (item.title || ''));
                  
                  const timeRange = item.startTime && item.endTime ? 
                    `(${safeFormatDate(item.startTime, 'HH:mm')}-${safeFormatDate(item.endTime, 'HH:mm')})` : 
                    (item.startDate ? `(${safeFormatDate(item.startDate, 'HH:mm')})` : '');
                  
                  const roomName = item.room ? 
                    (typeof item.room === 'object' ? item.room.name : item.room) : '';
                  
                  return (
                    <div
                      key={`${item.id || index}-${day.toISOString()}`}
                      className="week-schedule-item-compact"
                      onClick={() => {
                        if (item.type) {
                          handleScheduleClick(item);
                        } else {
                          handleEventClick(item);
                        }
                      }}
                    >
                      <div className="subject-code">{subjectCode}</div>
                      <div className="time-range">{timeRange}</div>
                      {roomName && <div className="room-info">At room {roomName}</div>}
                    </div>
                  );
                })}
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
          <h2>{safeFormatDate(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
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
                  {item.startTime ? safeFormatDate(item.startTime, 'HH:mm') : 
                   item.startDate ? safeFormatDate(item.startDate, 'HH:mm') : ''}
                </div>
                <div className="schedule-content">
                  <div className="schedule-title">
                    {item.subjectId ? (
                      typeof item.subjectId === 'object' ? 
                        `${item.subjectId.code} - ${item.subjectId.name}` : 
                        getSubjectName(item.subjectId)
                    ) : item.subject ? (
                      `${item.subject.code} - ${item.subject.name}`
                    ) : (
                      item.title || 'Class'
                    )}
                  </div>
                  <div className="schedule-location">
                    {item.location || (item.room ? 
                      (typeof item.room === 'object' ? item.room.name : item.room) : 
                      'No location')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Find a subject name by ID
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Unknown Subject';
    
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      return `${subject.code} - ${subject.name}`;
    }
    
    // If subject not found, check if we need to fetch it
    if (Array.isArray(subjects) && subjects.length === 0) {
      // We might need to fetch subjects if they're not loaded yet
      fetchSubjects();
    }
    
    // Just return the subject ID as temporary display
    return `Subject ${subjectId}`;
  };

  // Find a subject code by ID
  const getSubjectCode = (subjectId) => {
    if (!subjectId) return 'Unknown Code';

    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      return subject.code;
    }

    // If subject not found, check if we need to fetch it
    if (Array.isArray(subjects) && subjects.length === 0) {
      // We might need to fetch subjects if they're not loaded yet
      fetchSubjects();
    }

    // Just return the subject ID as temporary display
    return `Code ${subjectId}`;
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };
  
  // Find a lecturer name by ID
  const getLecturerName = (lecturerId) => {
    if (!lecturerId) return '';
    
    const lecturer = lecturers.find(l => l.id === parseInt(lecturerId));
    if (lecturer) {
      return lecturer.fullName;
    }
    
    // Don't show lecturer ID to students
    return user.role === 'student' ? '' : `Lecturer ${lecturerId}`;
  };

  // Safely format a date with the given format
  const safeFormatDate = (dateValue, formatString, defaultValue = '') => {
    if (!dateValue) return defaultValue;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateValue);
        return defaultValue;
      }
      
      return format(date, formatString);
    } catch (err) {
      console.error('Error formatting date:', err);
      return defaultValue;
    }
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