import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './TeachingScheduleManager.css';
import api from '../../services/api';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const STATUS_OPTIONS = ['NotYet', 'Attended', 'Online', 'Absent'];
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

function TeachingScheduleManager() {
  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLecturerId, setFilterLecturerId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [userRole, setUserRole] = useState('admin'); // TODO: Get from auth context
  const initialFetchDone = React.useRef(false);

  // Get current user role from localStorage or context
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUserRole(parsedUser.role || 'guest');
    }
  }, []);

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [roomsRes, subjectsRes, classesRes, lecturersRes, termsRes] = await Promise.all([
          api.get('/api/rooms'),
          api.get('/api/subjects'),
          api.get('/api/classes'),
          api.get('/api/users/lecturers'),
          api.get('/api/schedule/terms')
        ]);
        
        // Check if rooms data exists
        const roomsData = roomsRes.data || [];
        if (roomsData.length === 0) {
          toast.warn('No rooms available. Please add rooms first.');
        }
        setRooms(roomsData);
        
        setSubjects(subjectsRes.data || []);
        setClasses(classesRes.data || []);
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
        
        // After setting all the data, fetch the schedules
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

  // Fetch schedules when term or filters change
  useEffect(() => {
    if (selectedTerm && !loading) {
      // Only respond to filter changes after initial load
      if (initialFetchDone.current) {
        console.log(`Filters changed, fetching schedules with filters...`);
        fetchSchedules();
      }
    }
  }, [selectedTerm, filterLecturerId, filterClassId]);

  // Explicitly call fetchSchedules after initial data load
  useEffect(() => {
    // This ensures we fetch schedules once on component mount
    if (selectedTerm && !loading && subjects.length > 0 && !initialFetchDone.current) {
      console.log('Initial component setup complete, fetching schedules...');
      initialFetchDone.current = true;
      fetchSchedules();
    }
  }, [selectedTerm, loading, subjects.length]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let url = `/api/schedule/class/all`;
      
      // Apply filters if specified
      if (filterLecturerId && selectedTerm) {
        url = `/api/schedule/class/lecturer/${filterLecturerId}/term/${selectedTerm}`;
      } else if (filterClassId && selectedTerm) {
        url = `/api/schedule/class/${filterClassId}/term/${selectedTerm}`;
      }
      
      console.log(`Fetching schedules from: ${url}`);
      
      // Use direct fetch API for debugging
      const response = await fetch(`http://localhost:8080${url}`);
      const data = await response.json();
      console.log('Raw schedule data from API:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('First schedule item:', data[0]);
        console.log('Schedule time format example:', 
          `startTime: ${data[0].startTime}, endTime: ${data[0].endTime}`);
      } else {
        console.warn('No schedule data returned from API');
      }
      
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (dayOfWeek, slot) => {
    const timeSlot = TIME_SLOTS[slot];
    setEditData({
      dayOfWeek,
      slot,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      isEdit: false,
      termId: selectedTerm
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setEditData({ ...schedule, isEdit: true });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.delete(`/api/schedule/class/${id}`);
        toast.success('Schedule deleted successfully');
      fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  const handleModalSave = async (formData) => {
    try {
      // Make sure roomId is a number
      const roomId = parseInt(formData.roomId);
      
      if (isNaN(roomId)) {
        toast.error('Please select a valid room');
        return;
      }
      
      // Get the full room object
      const roomObject = rooms.find(r => r.id === roomId);
      
      if (!roomObject) {
        toast.error('Invalid room selected');
        return;
      }
      
      // Normalize time formats to ensure consistent format (HH:MM)
      const normalizedStartTime = normalizeTime(formData.startTime);
      const normalizedEndTime = normalizeTime(formData.endTime);
      
      // Create a complete payload that matches what the backend expects
      const payload = {
        subjectId: parseInt(formData.subjectId),
        classId: formData.classId,
        lecturerId: parseInt(formData.lecturerId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        status: formData.status || 'NotYet',
        building: formData.building || '',
        termId: parseInt(formData.termId || selectedTerm),
        room: roomObject
      };
      
      // Include ID only when editing
      if (formData.isEdit && formData.id) {
        payload.id = formData.id;
      }
      
      console.log('Payload to save:', JSON.stringify(payload));
      
      // Validate conflicts first
      console.log('Checking conflicts...');
      const conflictResponse = await api.post('/api/schedule/class/validate-conflicts', payload);
      console.log('Conflict check response:', conflictResponse.data);
      const conflicts = conflictResponse.data;
      
      if (conflicts.lecturerConflict || conflicts.classConflict || conflicts.roomConflict) {
        let conflictMessages = [];
        if (conflicts.lecturerConflict) conflictMessages.push('Lecturer has a schedule conflict');
        if (conflicts.classConflict) conflictMessages.push('Class has a schedule conflict');
        if (conflicts.roomConflict) conflictMessages.push('Room is already occupied at this time');
        
        toast.error(`Schedule conflicts detected: ${conflictMessages.join(', ')}`);
        return;
      }
      
      // Save the schedule
      if (formData.isEdit && formData.id) {
        console.log('Updating schedule...');
        await api.put(`/api/schedule/class/${formData.id}`, payload);
        toast.success('Schedule updated successfully');
    } else {
        console.log('Creating new schedule...');
        // For creating a new schedule, format payload with room_id
        const createPayload = {
          ...payload,
          room_id: roomObject.id,
          room: undefined // Remove room object for create
        };
        await api.post('/api/schedule/class', createPayload);
        toast.success('New schedule created successfully');
    }
    setShowModal(false);
    fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      if (error.response && error.response.status === 409) {
        toast.error('Schedule conflict detected. Please check the time and resources.');
      } else {
        toast.error('Failed to save schedule: ' + (error.response?.data?.message || error.message));
      }
    }
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

  // Helper to normalize time format (HH:MM:SS -> HH:MM)
  const normalizeTime = (timeString) => {
    if (!timeString) return '';
    // If it's already in HH:MM format
    if (timeString.length === 5) return timeString;
    // If it's in HH:MM:SS format
    if (timeString.length === 8) return timeString.substring(0, 5);
    return timeString;
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

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="teaching-schedule-manager">
      <h2 className="page-title">Teaching Schedule Manager</h2>
      
      <div className="schedule-controls">
        <div className="filter-section">
          <div className="filter-item">
            <label>Term:</label>
            <select 
              value={selectedTerm || ''} 
              onChange={(e) => setSelectedTerm(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Lecturer:</label>
            <select 
              value={filterLecturerId} 
              onChange={(e) => setFilterLecturerId(e.target.value)}
            >
              <option value="">All Lecturers</option>
              {lecturers.map(lecturer => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.fullName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Class:</label>
            <select 
              value={filterClassId} 
              onChange={(e) => setFilterClassId(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setFilterLecturerId('');
              setFilterClassId('');
            }}
          >
            Clear Filters
          </button>
          
          {/* Debug button */}
          <button 
            className="debug-btn"
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:8080/api/schedule/class/all');
                const data = await response.json();
                console.log('Debug - Raw schedule data:', data);
                if (Array.isArray(data) && data.length > 0) {
                  alert(`Found ${data.length} schedules. Check console for details.`);
                  setSchedules(data);
                } else {
                  alert('No schedules found in API response');
                }
              } catch (error) {
                console.error('Debug fetch error:', error);
                alert(`Error fetching schedules: ${error.message}`);
              }
            }}
          >
            Debug: Fetch Schedules
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
                            <div className="schedule-class">Class: {schedule.classId}</div>
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
                            {(userRole === 'admin' || userRole === 'lecturer') && (
                              <div className="schedule-actions">
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEdit(schedule)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleDelete(schedule.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                        )}
                      </div>
                        ))
                      ) : (
                        (userRole === 'admin' || userRole === 'lecturer') && (
                          <button 
                            className="add-schedule-btn"
                            onClick={() => handleAdd(dayIdx + 1, slot)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {showModal && (
        <ScheduleModal 
          rooms={rooms}
          subjects={subjects}
          classes={classes}
          lecturers={lecturers}
          data={editData}
          onSave={handleModalSave}
          onClose={() => setShowModal(false)}
          timeSlots={TIME_SLOTS}
          terms={terms}
        />
      )}

      {/* Debug display */}
      <div className="debug-section" style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Debug Information</h3>
        <p>Schedules loaded: {schedules.length}</p>
        <details>
          <summary>Raw Schedule Data</summary>
          <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(schedules, (key, value) => {
              // Handle circular references
              if (typeof value === 'object' && value !== null) {
                return { ...value };
              }
              return value;
            }, 2)}
          </pre>
        </details>
        <details>
          <summary>Week Matrix Data</summary>
          <div>
            {weekMatrix.map((row, rowIdx) => (
              <div key={rowIdx}>
                <strong>Slot {SLOTS[rowIdx]}</strong>: 
                {row.map((cell, cellIdx) => (
                  <span key={cellIdx} style={{marginLeft: '10px'}}>
                    {WEEKDAYS[cellIdx]}: {cell ? cell.length : 0} schedules
                  </span>
                ))}
              </div>
            ))}
          </div>
        </details>
        <details>
          <summary>Room Data</summary>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {rooms.map((room, idx) => (
              <div key={idx}>
                Room {idx+1}: {room.name} - {room.location} (Capacity: {room.capacity})
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

function ScheduleModal({ rooms, subjects, classes, lecturers, data, onSave, onClose, timeSlots, terms }) {
  const [form, setForm] = useState({
    id: data.id || null,
    subjectId: data.subjectId || '',
    classId: data.classId || '',
    lecturerId: data.lecturerId || '',
    roomId: data.room?.id || '',
    status: data.status || 'NotYet',
    startTime: data.startTime || '',
    endTime: data.endTime || '',
    dayOfWeek: data.dayOfWeek || 1,
    slot: data.slot || 1,
    building: data.building || '',
    termId: data.termId || 1,
    isEdit: data.isEdit || false,
  });

  const [conflicts, setConflicts] = useState({
    lecturerConflict: false,
    classConflict: false,
    roomConflict: false
  });

  const [isChecking, setIsChecking] = useState(false);

  // Apply slot time when slot changes
  const handleSlotChange = (e) => {
    const slotValue = parseInt(e.target.value);
    const slotTime = timeSlots[slotValue];
    
    setForm({
      ...form,
      slot: slotValue,
      startTime: slotTime?.start || form.startTime,
      endTime: slotTime?.end || form.endTime
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const checkForConflicts = async () => {
    if (!form.subjectId || !form.classId || !form.lecturerId || !form.roomId) {
      // Clear any previous conflicts if we don't have all required fields
      setConflicts({
        lecturerConflict: false,
        classConflict: false,
        roomConflict: false
      });
      return;
    }
    
    setIsChecking(true);
    try {
      // Get the room object from the roomId
      const roomObject = rooms.find(r => r.id === parseInt(form.roomId));
      
      if (!roomObject) {
        console.error('Room not found with id:', form.roomId);
        return;
      }
      
      // Create a complete payload that matches exactly what the backend expects
      const payload = {
        subjectId: parseInt(form.subjectId),
        classId: form.classId,
        lecturerId: parseInt(form.lecturerId),
        dayOfWeek: parseInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        status: form.status || 'NotYet',
        building: form.building || '',
        termId: parseInt(form.termId),
        room: roomObject
      };
      
      // If we're editing, include the id
      if (form.isEdit && form.id) {
        payload.id = form.id;
      }
      
      console.log('Sending validation payload:', JSON.stringify(payload));
      
      // Direct API call to validate conflicts
      const response = await api.post('/api/schedule/class/validate-conflicts', payload);
      console.log('Validation response:', response.data);
      setConflicts(response.data);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      // Don't show toast for validation errors to avoid UI clutter during typing
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check for conflicts when form values change (debounced)
    const timer = setTimeout(checkForConflicts, 500);
    return () => clearTimeout(timer);
  }, [form.subjectId, form.classId, form.lecturerId, form.roomId, form.dayOfWeek, form.startTime, form.endTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if there are any conflicts
    if (conflicts.lecturerConflict || conflicts.classConflict || conflicts.roomConflict) {
      toast.error('Please resolve scheduling conflicts before saving');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{data.isEdit ? 'Edit Schedule' : 'Add New Schedule'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Subject:</label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Class:</label>
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.className}
                  </option>
                ))}
              </select>
              {conflicts.classConflict && (
                <div className="conflict-warning">
                  <i className="fas fa-exclamation-triangle"></i> This class has another schedule at this time
                </div>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Lecturer:</label>
              <select
                name="lecturerId"
                value={form.lecturerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Lecturer</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.fullName}
                  </option>
                ))}
              </select>
              {conflicts.lecturerConflict && (
                <div className="conflict-warning">
                  <i className="fas fa-exclamation-triangle"></i> This lecturer has another schedule at this time
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Room:</label>
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                required
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} {room.location ? `(${room.location})` : ''} - Capacity: {room.capacity}
                  </option>
                ))}
              </select>
              {conflicts.roomConflict && (
                <div className="conflict-warning">
                  <i className="fas fa-exclamation-triangle"></i> This room is already booked at this time
                </div>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Day:</label>
              <select
                name="dayOfWeek"
                value={form.dayOfWeek}
                onChange={handleChange}
                required
              >
                {WEEKDAYS.map((day, idx) => (
                  <option key={day} value={idx + 1}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Slot:</label>
              <select
                name="slot"
                value={form.slot}
                onChange={handleSlotChange}
                required
              >
                {SLOTS.map(slot => (
                  <option key={slot} value={slot}>
                    Slot {slot} ({timeSlots[slot]?.start || ''} - {timeSlots[slot]?.end || ''})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>
        </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Building:</label>
              <input
                type="text"
                name="building"
                value={form.building}
                onChange={handleChange}
                placeholder="Building name/code"
              />
        </div>
            
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
        </div>
        </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Term:</label>
              <select
                name="termId"
                value={form.termId}
                onChange={handleChange}
                required
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term.id} value={term.id}>{term.name}</option>
                ))}
              </select>
        </div>
        </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={isChecking || conflicts.lecturerConflict || conflicts.classConflict || conflicts.roomConflict}
            >
              {isChecking ? 'Checking Conflicts...' : 'Save Schedule'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default TeachingScheduleManager; 