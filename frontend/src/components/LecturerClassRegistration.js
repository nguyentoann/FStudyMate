import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './LecturerClassRegistration.css';

const LecturerClassRegistration = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    subjectId: '',
    classId: '',
    termId: '',
    roomId: '',
    slot: '1',
    status: 'NotYet',
    specificDate: today
  });

  // Time slots configuration
  const TIME_SLOTS = {
    1: { start: '07:00', end: '09:15' },
    2: { start: '09:30', end: '11:45' },
    3: { start: '12:30', end: '14:45' },
    4: { start: '15:00', end: '17:15' },
    5: { start: '17:30', end: '19:45' },
    6: { start: '19:30', end: '21:00' },
    7: { start: '21:15', end: '23:30' },
    8: { start: '19:30', end: '21:00' }
  };

  const WEEKDAYS = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' }
  ];

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsRes, classesRes, termsRes, roomsRes] = await Promise.all([
          api.get('/api/subjects'),
          api.get('/api/classes'),
          api.get('/api/schedule/terms'),
          api.get('/api/rooms')
        ]);
        
        setSubjects(subjectsRes.data || []);
        setClasses(classesRes.data || []);
        setTerms(termsRes.data || []);
        setRooms(roomsRes.data || []);
        
        // Also fetch the lecturer's registrations
        if (user && user.id) {
          const registrationsRes = await api.get(`/api/schedule/lecturer/${user.id}`);
          setMyRegistrations(registrationsRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load necessary data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle slot selection
  const handleSlotChange = (e) => {
    const { value } = e.target;
    const timeSlot = TIME_SLOTS[value];
    
    setFormData({
      ...formData,
      slot: value,
      startTime: timeSlot?.start || '',
      endTime: timeSlot?.end || ''
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get the selected room
      const roomObject = rooms.find(r => r.id === parseInt(formData.roomId));
      
      // Prepare the payload
      const payload = {
        subjectId: parseInt(formData.subjectId),
        classId: formData.classId,
        lecturerId: user.id,
        slot: parseInt(formData.slot),
        startTime: TIME_SLOTS[formData.slot].start,
        endTime: TIME_SLOTS[formData.slot].end,
        status: formData.status,
        termId: parseInt(formData.termId),
        roomId: parseInt(formData.roomId),
        specificDate: formData.specificDate
      };
      
      if (selectedRegistration) {
        // Update existing registration
        payload.id = selectedRegistration.id;
        await api.put(`/api/schedule/class/${selectedRegistration.id}`, payload);
        toast.success('Class registration updated successfully!');
      } else {
        // Create new registration
        await api.post('/api/schedule/class', payload);
        toast.success('Class registered successfully!');
      }
      
      // Refresh the registrations list
      const registrationsRes = await api.get(`/api/schedule/lecturer/${user.id}`);
      setMyRegistrations(registrationsRes.data || []);
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error submitting registration:', error);
      
      // Display more specific error messages
      if (error.response && error.response.data) {
        if (error.response.data.lecturerConflict) {
          toast.error('You already have a class at this time!');
        } else if (error.response.data.classConflict) {
          toast.error('This class already has a schedule at this time!');
        } else if (error.response.data.roomConflict) {
          toast.error('This room is already booked at this time!');
        } else {
          toast.error('Failed to register class: ' + (error.response.data.message || 'Unknown error'));
        }
      } else {
        toast.error('Failed to register class. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Edit registration
  const handleEdit = (registration) => {
    setSelectedRegistration(registration);
    
    setFormData({
      subjectId: registration.subjectId.toString(),
      classId: registration.classId,
      termId: registration.termId.toString(),
      roomId: registration.room?.id.toString() || '',
      slot: registration.slot ? registration.slot.toString() : '1',
      status: registration.status,
      specificDate: registration.specificDate || today
    });
  };
  
  // Delete registration
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/api/schedule/class/${id}`);
      toast.success('Registration deleted successfully!');
      
      // Refresh the registrations list
      const registrationsRes = await api.get(`/api/schedule/lecturer/${user.id}`);
      setMyRegistrations(registrationsRes.data || []);
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast.error('Failed to delete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setSelectedRegistration(null);
    setFormData({
      subjectId: '',
      classId: '',
      termId: '',
      roomId: '',
      slot: '1',
      status: 'NotYet',
      specificDate: today
    });
  };

  // Helper functions to get names from IDs
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Unknown Subject';
    
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      return `${subject.code} - ${subject.name}`;
    }
    
    return `Subject ${subjectId}`;
  };
  
  const getClassName = (classId) => {
    const cls = classes.find(c => c.classId === classId);
    return cls ? cls.className : classId;
  };
  
  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.name} - ${room.location}` : `Room ${roomId}`;
  };
  
  const getTermName = (termId) => {
    const term = terms.find(t => t.id === termId);
    return term ? term.name : `Term ${termId}`;
  };
  
  // Get day name from date
  const getDayNameFromDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    } catch (error) {
      console.error('Error getting day name:', error);
      return '';
    }
  };
  
  const getTimeSlot = (slot) => {
    const timeSlot = TIME_SLOTS[slot];
    return timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : `Slot ${slot}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="lecturer-class-registration">
      <h2 className="section-title">
        {selectedRegistration ? 'Edit Class Registration' : 'Register to Teach a Class'}
      </h2>
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="termId">Term:</label>
          <select
            id="termId"
            name="termId"
            value={formData.termId}
            onChange={handleChange}
            required
          >
            <option value="">Select Term</option>
            {terms.map(term => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="subjectId">Subject:</label>
          <select
            id="subjectId"
            name="subjectId"
            value={formData.subjectId}
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
          <label htmlFor="classId">Class:</label>
          <select
            id="classId"
            name="classId"
            value={formData.classId}
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
        </div>
        
        <div className="form-group">
          <label htmlFor="specificDate">Date:</label>
          <input
            type="date"
            id="specificDate"
            name="specificDate"
            value={formData.specificDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="slot">Time Slot:</label>
          <select
            id="slot"
            name="slot"
            value={formData.slot}
            onChange={handleSlotChange}
            required
          >
            {Object.keys(TIME_SLOTS).map(slot => (
              <option key={slot} value={slot}>
                Slot {slot}: {TIME_SLOTS[slot].start} - {TIME_SLOTS[slot].end}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="roomId">Room:</label>
          <select
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
          >
            <option value="">Select Room</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} - {room.location} (Capacity: {room.capacity})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="NotYet">Not Yet</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="form-actions">
          {selectedRegistration && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button type="submit" className="submit-btn">
            {selectedRegistration ? 'Update Registration' : 'Register Class'}
          </button>
        </div>
      </form>
      
      <div className="my-registrations">
        <h3>My Class Registrations</h3>
        
        {myRegistrations.length === 0 ? (
          <p className="no-data">You have not registered any classes yet.</p>
        ) : (
          <div className="registrations-list">
            {myRegistrations.map(registration => (
              <div key={registration.id} className="registration-card">
                <div className="registration-header">
                  <h4>{getSubjectName(registration.subjectId)}</h4>
                  <span className={`status-badge ${registration.status.toLowerCase()}`}>
                    {registration.status}
                  </span>
                </div>
                
                <div className="registration-details">
                  <p><strong>Class:</strong> {getClassName(registration.classId)}</p>
                  <p><strong>Term:</strong> {getTermName(registration.termId)}</p>
                  <p><strong>Date:</strong> {formatDate(registration.specificDate)} ({getDayNameFromDate(registration.specificDate)})</p>
                  <p><strong>Time:</strong> {getTimeSlot(registration.slot)}</p>
                  <p><strong>Room:</strong> {registration.room ? `${registration.room.name} - ${registration.room.location}` : 'No Room'}</p>
                </div>
                
                <div className="registration-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(registration)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(registration.id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerClassRegistration; 