import React, { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import './DetailedTimeTable.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STATUS_COLORS = {
  NotYet: '#f87171',
  Attended: '#4ade80',
  Online: '#60a5fa',
  Absent: '#9ca3af',
};

const DetailedTimeTable = ({ 
  schedules, 
  timeSlots, 
  getSubjectName, 
  getLecturerName,
  onScheduleClick,
  userRole = 'student',
  selectedDate = null,
  subjects // Added subjects prop
}) => {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [currentDate, setCurrentDate] = useState(selectedDate && isValid(selectedDate) ? selectedDate : new Date());
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // If already in HH:MM format
    if (timeString.length === 5) return timeString;
    
    // If in HH:MM:SS format
    if (timeString.length === 8) return timeString.substring(0, 5);
    
    return timeString;
  };
  
  // Safely format a date string
  const safeFormatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return '';
      
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Handle date input change
  const handleDateChange = (e) => {
    try {
      const newDate = new Date(e.target.value);
      if (isValid(newDate)) {
        setCurrentDate(newDate);
      } else {
        console.error('Invalid date input:', e.target.value);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };
  
  // Create a matrix of schedules by day and time slot
  const createScheduleMatrix = () => {
    // Convert timeSlots object to array of slot numbers
    const slotNumbers = Object.keys(timeSlots).map(Number).sort((a, b) => a - b);
    
    // Create empty matrix
    const matrix = slotNumbers.map(() => Array(7).fill(null));
    
    // Create a date range for the current week
    const today = currentDate || new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday of current week
    
    // Ensure schedules is an array
    const schedulesArray = Array.isArray(schedules) ? schedules : [];
    
    // Fill matrix with schedules
    schedulesArray.forEach(schedule => {
      if (!schedule) return;
      
      // Get the schedule date
      let scheduleDate;
      if (schedule.specificDate) {
        try {
          scheduleDate = new Date(schedule.specificDate);
          if (isNaN(scheduleDate.getTime())) {
            console.error('Invalid schedule date:', schedule.specificDate);
            return;
          }
        } catch (error) {
          console.error('Error parsing schedule date:', error);
          return;
        }
      } else {
        return; // Skip schedules without specific dates
      }
      
      // Calculate day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = scheduleDate.getDay();
      // Convert to our format (0 = Monday, ..., 6 = Sunday)
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      // Find the time slot
      let slotIndex = -1;
      const scheduleStartTime = formatTime(schedule.startTime);
      const scheduleEndTime = formatTime(schedule.endTime);
      
      for (let i = 0; i < slotNumbers.length; i++) {
        const slotNumber = slotNumbers[i];
        const timeSlot = timeSlots[slotNumber];
        
        if (timeSlot && 
            scheduleStartTime === formatTime(timeSlot.start) && 
            scheduleEndTime === formatTime(timeSlot.end)) {
          slotIndex = i;
          break;
        }
      }
      
      if (slotIndex === -1) {
        console.warn(`Could not find matching time slot for schedule: ${schedule.id}, time: ${scheduleStartTime}-${scheduleEndTime}`);
        slotIndex = 0; // Default to first slot
      }
      
      // Add schedule to matrix
      if (!matrix[slotIndex][dayIndex]) {
        matrix[slotIndex][dayIndex] = [];
      }
      
      matrix[slotIndex][dayIndex].push({
        ...schedule,
        isSpecificDate: true
      });
    });
    
    return { matrix, slotNumbers };
  };
  
  const { matrix, slotNumbers } = createScheduleMatrix();
  
  // Get subject code only (without name)
  const getSubjectCode = (subjectId) => {
    if (!subjectId) return 'Unknown';
    
    // Try to get from subjects array if available
    if (subjects && Array.isArray(subjects)) {
      const subject = subjects.find(s => s.id === parseInt(subjectId));
      if (subject) {
        return subject.code;
      }
    }
    
    // Extract subject code from full name if available
    const fullName = getSubjectName(subjectId);
    if (fullName && fullName.includes(' - ')) {
      return fullName.split(' - ')[0];
    }
    
    return `${subjectId}`;
  };
  
  // Format date for header (e.g., "MON - 21/07")
  const formatDateHeader = (dayIndex) => {
    const date = new Date(currentDate);
    // Set to Monday of current week
    date.setDate(date.getDate() - date.getDay() + 1);
    // Add days to get to the target day
    date.setDate(date.getDate() + dayIndex);
    
    const dayName = WEEKDAYS[dayIndex].toUpperCase();
    const dayMonth = format(date, 'dd/MM');
    
    return `${dayName} - ${dayMonth}`;
  };
  
  return (
    <div className="detailed-timetable">
      <div className="timetable-controls">
        <div className="view-toggle">
          <button 
            className={viewMode === 'week' ? 'active' : ''} 
            onClick={() => setViewMode('week')}
          >
            Week View
          </button>
          <button 
            className={viewMode === 'day' ? 'active' : ''} 
            onClick={() => setViewMode('day')}
          >
            Day View
          </button>
        </div>
        
        {viewMode === 'day' && (
          <div className="date-selector">
            <input 
              type="date" 
              value={currentDate ? currentDate.toISOString().split('T')[0] : ''} 
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>
      
      <table className="timetable-grid modern-style">
        <thead>
          <tr>
            <th className="time-header">SLOT</th>
            {WEEKDAYS.map((day, index) => (
              <th key={day} className="day-header">{formatDateHeader(index)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, slotIndex) => {
            const slotNumber = slotNumbers[slotIndex];
            const timeSlot = timeSlots[slotNumber];
            
            return (
              <tr key={slotNumber} className="time-row">
                <td className="time-cell">
                  <div className="slot-number">Slot {slotNumber}</div>
                  <div className="slot-time">
                    {timeSlot ? `${formatTime(timeSlot.start)}-${formatTime(timeSlot.end)}` : ''}
                  </div>
                </td>
                
                {row.map((schedules, dayIndex) => (
                  <td key={dayIndex} className="schedule-cell">
                    {schedules && schedules.map(schedule => {
                      const subjectCode = getSubjectCode(schedule.subjectId);
                      const timeRange = `(${formatTime(schedule.startTime)}-${formatTime(schedule.endTime)})`;
                      const roomName = schedule.room ? 
                        (typeof schedule.room === 'object' ? schedule.room.name : schedule.room) : 
                        '';
                      
                      return (
                        <div 
                          key={schedule.id}
                          className="schedule-item-compact"
                          onClick={() => {
                            if (onScheduleClick) {
                              try {
                                const safeSchedule = {
                                  ...schedule,
                                  specificDate: schedule.specificDate ? safeFormatDate(schedule.specificDate) || null : null
                                };
                                onScheduleClick(safeSchedule);
                              } catch (error) {
                                console.error('Error handling schedule click:', error);
                              }
                            }
                          }}
                          style={{
                            borderLeftColor: userRole === 'student' ? '#3B82F6' : (STATUS_COLORS[schedule.status] || '#ccc')
                          }}
                        >
                          <div className="subject-code">{subjectCode}</div>
                          <div className="time-range">{timeRange}</div>
                          <div className="room-info">At room {roomName}</div>
                        </div>
                      );
                    })}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedTimeTable; 