import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './StudentScheduleView.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const STATUS_COLORS = {
  NotYet: '#f87171',
  Attended: '#4ade80',
  Online: '#60a5fa',
  Absent: '#9ca3af',
};
const TIME_SLOTS = {
  1: { start: '07:00', end: '09:15' },
  2: { start: '09:30', end: '11:45' },
  3: { start: '12:30', end: '14:45' },
  4: { start: '15:00', end: '17:15' },
  5: { start: '17:30', end: '19:45' },
  6: { start: '19:30', end: '21:00' },
  7: { start: '21:15', end: '23:30' },
  8: { start: '19:30', end: '21:00' },
};

function StudentScheduleView() {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState(null);
  const initialFetchDone = React.useRef(false);

  // Get current user info from localStorage
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setStudentClass(parsedUser.classId || null);
    }
  }, []);

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [subjectsRes, lecturersRes, termsRes] = await Promise.all([
          api.get('/api/subjects'),
          api.get('/api/users/lecturers'),
          api.get('/api/schedule/terms')
        ]);
        
        setSubjects(subjectsRes.data || []);
        setLecturers(lecturersRes.data || []);
        
        // Handle terms data
        let termsData = termsRes.data || [];
        if (termsData.length === 0) {
          // Create default terms for the UI if none are returned from the backend
          termsData = [
            { id: 1, name: 'Term 1' },
            { id: 2, name: 'Term 2' },
            { id: 3, name: 'Term 3' }
          ];
          console.log('No terms found in the backend, using default terms');
        }
        
        setTerms(termsData);
        
        // Set the selected term at the end to trigger only one fetch
        const defaultTermId = termsData.length > 0 ? termsData[0].id : 1;
        console.log(`Setting default term ID: ${defaultTermId}`);
        setSelectedTerm(defaultTermId);
        
        console.log('Initial data loaded, ready for schedule fetch');
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load necessary data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Fetch schedules when term changes
  useEffect(() => {
    if (selectedTerm && !loading && studentClass) {
      // Only fetch once on initial load
      if (!initialFetchDone.current) {
        console.log('Initial component setup complete, fetching schedules...');
        initialFetchDone.current = true;
        fetchSchedules();
      }
    }
  }, [selectedTerm, loading, studentClass]);

  const fetchSchedules = async () => {
    if (!studentClass) {
      toast.error('No class assigned to student');
      return;
    }
    
    setLoading(true);
    try {
      const url = `/api/schedule/class/${studentClass}/term/${selectedTerm}`;
      
      console.log(`Fetching schedules from: ${url}`);
      const response = await fetch(`http://localhost:8080${url}`);
      const data = await response.json();
      console.log('Raw schedule data from API:', data);
      
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize time format (HH:MM:SS -> HH:MM)
  const normalizeTime = (timeString) => {
    if (!timeString) return '';
    // If it's already in HH:MM format
    if (timeString.length === 5) return timeString;
    // If it's in HH:MM:SS format
    if (timeString.length === 8) return timeString.substring(0, 5);
    return timeString;
  };

  // Find a subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : `Subject ${subjectId}`;
  };

  // Find a lecturer name by ID
  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? lecturer.fullName : `Lecturer ${lecturerId}`;
  };

  // Create weekly schedule matrix
  const generateWeekMatrix = useCallback(() => {
    console.log('Generating week matrix with schedules:', schedules);
    
    // First try to match schedules to specific time slots
    const matrix = SLOTS.map(slot => 
      WEEKDAYS.map((_, dayIdx) => {
        // Match schedules for this day and slot
        const daySchedules = schedules.filter(s => {
          // Match by day of week (1-based index)
          const dayMatches = s.dayOfWeek === dayIdx + 1;
          
          if (!dayMatches) return false;
          
          // Match by time slot
          const timeSlot = TIME_SLOTS[slot];
          if (!timeSlot) return false;
          
          // Normalize time formats for comparison
          const normalizedStartTime = normalizeTime(s.startTime);
          const normalizedEndTime = normalizeTime(s.endTime);
          
          // First try exact match
          const exactStartMatch = normalizedStartTime === timeSlot.start;
          const exactEndMatch = normalizedEndTime === timeSlot.end;
          
          if (exactStartMatch && exactEndMatch) return true;
          
          // If not exact match, try fuzzy match (startsWith)
          const fuzzyStartMatch = normalizedStartTime.startsWith(timeSlot.start) || 
                                 timeSlot.start.startsWith(normalizedStartTime);
          const fuzzyEndMatch = normalizedEndTime.startsWith(timeSlot.end) ||
                               timeSlot.end.startsWith(normalizedEndTime);
          
          return fuzzyStartMatch && fuzzyEndMatch;
        });
        
        return daySchedules.length > 0 ? daySchedules : null;
      })
    );
    
    // Check if we have any schedules in the matrix
    const hasSchedules = matrix.some(row => row.some(cell => cell !== null));
    
    // If no schedules matched by time slots, use a fallback approach
    if (!hasSchedules && schedules.length > 0) {
      console.log('No schedules matched time slots, using fallback display');
      
      // Group schedules by day of week
      const schedulesByDay = {};
      schedules.forEach(s => {
        const day = s.dayOfWeek - 1; // Convert to 0-based index
        if (!schedulesByDay[day]) {
          schedulesByDay[day] = [];
        }
        schedulesByDay[day].push(s);
      });
      
      // Place schedules in the first few slots based on their day
      return SLOTS.map((slot, slotIdx) => 
        WEEKDAYS.map((_, dayIdx) => {
          // Only use the first few slots for the fallback
          if (slotIdx < 3 && schedulesByDay[dayIdx] && schedulesByDay[dayIdx].length > 0) {
            // Get schedules for this day and distribute them across slots
            const daySchedules = schedulesByDay[dayIdx];
            const startIdx = slotIdx * 2;
            const endIdx = startIdx + 2;
            const slotSchedules = daySchedules.slice(startIdx, endIdx);
            
            // Remove used schedules
            schedulesByDay[dayIdx] = daySchedules.slice(endIdx);
            
            return slotSchedules.length > 0 ? slotSchedules : null;
          }
          return null;
        })
      );
    }
    
    return matrix;
  }, [schedules]);

  const weekMatrix = generateWeekMatrix();

  const handleTermChange = (e) => {
    const newTermId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedTerm(newTermId);
    if (newTermId) {
      initialFetchDone.current = false; // Reset to force a fetch with the new term
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="student-schedule-view">
      <h2 className="page-title">My Class Schedule</h2>
      
      <div className="schedule-controls">
        <div className="filter-section">
          <div className="filter-item">
            <label>Term:</label>
            <select 
              value={selectedTerm || ''} 
              onChange={handleTermChange}
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={() => {
              initialFetchDone.current = false;
              fetchSchedules();
            }}
          >
            Refresh Schedule
          </button>
        </div>
      </div>
      
      <div className="schedule-grid-container">
        <table className="schedule-grid">
          <thead>
            <tr>
              <th>Slot</th>
              {WEEKDAYS.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, i) => (
              <tr key={slot}>
                <td className="slot-info">
                  <div>Slot {slot}</div>
                  <div className="time-range">
                    {TIME_SLOTS[slot] && (
                      <small>{TIME_SLOTS[slot].start} - {TIME_SLOTS[slot].end}</small>
                    )}
                  </div>
                </td>
                {WEEKDAYS.map((_, dayIdx) => {
                  const cellSchedules = weekMatrix[i][dayIdx];
                  
                  return (
                    <td key={dayIdx} className="schedule-cell">
                      {cellSchedules ? (
                        cellSchedules.map(schedule => (
                          <div 
                            key={schedule.id} 
                            className="schedule-item"
                            style={{ 
                              borderColor: STATUS_COLORS[schedule.status] || '#ccc',
                              borderLeftWidth: '4px'
                            }}
                          >
                            <div className="schedule-subject">{getSubjectName(schedule.subjectId)}</div>
                            <div className="schedule-lecturer">
                              <i className="fas fa-user-tie"></i> {getLecturerName(schedule.lecturerId)}
                            </div>
                            <div className="schedule-room">
                              <i className="fas fa-door-open"></i> {schedule.room ? schedule.room.name : 'No Room'}
                              {schedule.building && ` (${schedule.building})`}
                            </div>
                            <div className="schedule-time">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="schedule-status" style={{ color: STATUS_COLORS[schedule.status] }}>
                              {schedule.status}
                            </div>
                          </div>
                        ))
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentScheduleView; 