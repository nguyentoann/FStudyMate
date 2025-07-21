import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DetailedTimeTable from '../../components/DetailedTimeTable';
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

// Schedule Detail Modal Component
const ScheduleDetailModal = ({ schedule, subjects, lecturers, onClose }) => {
  if (!schedule) return null;
  
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Unknown Subject';
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject ? `${subject.code} - ${subject.name}` : `Subject ${subjectId}`;
  };
  
  const getLecturerName = (lecturerId) => {
    if (!lecturerId) return 'Unknown Lecturer';
    const lecturer = lecturers.find(l => l.id === parseInt(lecturerId));
    return lecturer ? lecturer.fullName : `Lecturer ${lecturerId}`;
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // If it's already in HH:MM format
    if (timeString.length === 5) return timeString;
    // If it's in HH:MM:SS format
    if (timeString.length === 8) return timeString.substring(0, 5);
    return timeString;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get subject code
  const getSubjectCode = (subjectId) => {
    if (!subjectId) return '';
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject ? subject.code : '';
  };
  
  // Get subject name only (without code)
  const getSubjectNameOnly = (subjectId) => {
    if (!subjectId) return 'Unknown Subject';
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject ? subject.name : `Subject ${subjectId}`;
  };

  const subjectCode = getSubjectCode(schedule.subjectId);
  const subjectName = getSubjectNameOnly(schedule.subjectId);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{subjectCode}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="schedule-detail-item subject-name">
            {subjectName}
          </div>
          <div className="schedule-detail-item">
            <strong>Class:</strong> {schedule.classId || 'N/A'}
          </div>
          <div className="schedule-detail-item">
            <strong>Room:</strong> {schedule.room || 'N/A'}
          </div>
          <div className="schedule-detail-item">
            <strong>Lecturer:</strong> {getLecturerName(schedule.lecturerId)}
          </div>
          <div className="schedule-detail-item">
            <strong>Time:</strong> {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
          </div>
          {schedule.specificDate && (
            <div className="schedule-detail-item">
              <strong>Date:</strong> {formatDate(schedule.specificDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 6); // Default to one week
    return {
      startDate: today,
      endDate: endDate
    };
  });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Handle date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    try {
      // Create a new date object from the input value
      const newDate = value ? new Date(value) : new Date();
      
      // Validate the date
      if (isNaN(newDate.getTime())) {
        console.error('Invalid date:', value);
        return; // Don't update state with invalid date
      }
      
      setDateRange(prev => ({
        ...prev,
        [name]: newDate
      }));
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

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
    if (studentClass) {
      fetchAllData();
    }
  }, [studentClass]);

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
      
      // No need to set selected term as we'll fetch all schedules
      console.log('Initial data loaded, ready for schedule fetch');
      
      // Fetch schedules once we have the necessary data
      fetchSchedules();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load necessary data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules when term changes
  useEffect(() => {
    if (selectedTerm && studentClass && !loading) {
      fetchSchedules();
    }
  }, [selectedTerm]);

  const fetchSchedules = async () => {
    if (!studentClass) {
      toast.error('No class assigned to student');
      return;
    }
    
    setLoading(true);
    try {
      // Get the current date
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay() + 1); // Monday of current week
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday of current week
      
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch schedules for date range
      const url = `/api/schedule/class/date-range?classId=${studentClass}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      
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
    if (!subjectId) return 'Unknown Subject';
    
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      return `${subject.code} - ${subject.name}`;
    }
    
    // If we don't have subject details, just show the ID
    return `Subject ${subjectId}`;
  };
  
  // Find a lecturer name by ID
  const getLecturerName = (lecturerId) => {
    if (!lecturerId) return '';
    
    const lecturer = lecturers.find(l => l.id === parseInt(lecturerId));
    if (lecturer) {
      return lecturer.fullName;
    }
    
    // Don't show lecturer ID to students
    return '';
  };

  // Create weekly schedule matrix
  const generateWeekMatrix = useCallback(() => {
    console.log('Generating week matrix with schedules:', schedules);
    
    // Ensure schedules is an array
    const schedulesArray = Array.isArray(schedules) ? schedules : [];
    
    // Create a date range for the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday of current week
    
    // Create a matrix with days as columns and time slots as rows
    const timeSlotKeys = Object.keys(TIME_SLOTS).map(Number);
    const matrix = timeSlotKeys.map(slot => 
      WEEKDAYS.map((_, dayIdx) => {
        // Calculate the date for this day
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + dayIdx);
        const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Match schedules for this day and slot
        const daySchedules = schedulesArray.filter(s => {
          if (!s) return false;
          
          // Match by specific date if available
          let dayMatches = false;
          if (s.specificDate) {
            // Compare the date strings
            const scheduleDate = s.specificDate.split('T')[0];
            dayMatches = scheduleDate === dateStr;
          }
          
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
    
    return matrix;
  }, [schedules]);

  const weekMatrix = generateWeekMatrix();

  const handleTermChange = (e) => {
    const newTermId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedTerm(newTermId);
    
    if (newTermId && studentClass) {
      // Fetch schedules for the selected term
      fetchSchedulesForTerm(studentClass, newTermId);
    }
  };
  
  const fetchSchedulesForTerm = async (classId, termId) => {
    setLoading(true);
    try {
      const url = `/api/schedule/class/${classId}/term/${termId}`;
      
      console.log(`Fetching schedules for term ${termId} from: ${url}`);
      const response = await fetch(`http://localhost:8080${url}`);
      const data = await response.json();
      console.log(`Received ${data.length} schedules for term ${termId}`);
      
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules for term:', error);
      toast.error('Failed to load schedules for the selected term');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedulesForDateRange = async (classId, startDate, endDate) => {
    setLoading(true);
    try {
      // Ensure we have valid dates
      const validStartDate = startDate instanceof Date && !isNaN(startDate) ? startDate : new Date();
      const validEndDate = endDate instanceof Date && !isNaN(endDate) ? endDate : new Date();
      
      // Format dates for API
      const formattedStartDate = validStartDate.toISOString().split('T')[0];
      const formattedEndDate = validEndDate.toISOString().split('T')[0];
      
      const url = `/api/schedule/class/date-range?classId=${classId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      
      console.log(`Fetching schedules for date range from: ${url}`);
      const response = await fetch(`http://localhost:8080${url}`);
      const data = await response.json();
      console.log(`Received ${data.length} schedules for date range`);
      
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules for date range:', error);
      toast.error('Failed to load schedules for the selected date range');
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule click
  const handleScheduleClick = (schedule) => {
    try {
      if (!schedule) {
        console.error('Schedule is undefined or null');
        return;
      }
      
      // Set the selected schedule and show the modal
      setSelectedSchedule(schedule);
      setShowScheduleModal(true);
    } catch (error) {
      console.error('Error handling schedule click:', error);
      toast.info('Schedule details not available');
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
          
          <div className="date-range-selector">
            <div className="filter-item">
              <label>Start Date:</label>
              <input 
                type="date" 
                name="startDate"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={handleDateRangeChange}
              />
            </div>
            
            <div className="filter-item">
              <label>End Date:</label>
              <input 
                type="date" 
                name="endDate"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={handleDateRangeChange}
              />
            </div>
            
            <button 
              className="date-range-btn"
              onClick={() => fetchSchedulesForDateRange(studentClass, dateRange.startDate, dateRange.endDate)}
            >
              View Date Range
            </button>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={() => {
              fetchSchedules();
            }}
          >
            Refresh Schedule
          </button>
        </div>
      </div>
      
      <div className="schedule-grid-container">
        <DetailedTimeTable
          schedules={schedules}
          timeSlots={TIME_SLOTS}
          getSubjectName={getSubjectName}
          getLecturerName={getLecturerName}
          userRole="student"
          onScheduleClick={handleScheduleClick}
          subjects={subjects}
        />
      </div>

      {/* Schedule Detail Modal */}
      {showScheduleModal && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          subjects={subjects}
          lecturers={lecturers}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
}

export default StudentScheduleView; 