import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import './ClassManagement.css';

const ClassScheduleManagement = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classInfo, setClassInfo] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [formMode, setFormMode] = useState('create');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    lecturerId: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: '',
    building: '',
    semester: '',
    academicYear: '',
    isActive: true
  });
  
  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
  ];
  
  useEffect(() => {
    fetchClassInfo();
    fetchSchedules();
    fetchSubjects();
    fetchLecturers();
  }, [classId]);
  
  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/classes/${classId}`);
      
      if (response.ok) {
        const data = await response.json();
        setClassInfo(data);
        // Cập nhật form data với semester và academic year từ thông tin lớp
        setFormData(prev => ({
          ...prev,
          semester: data.semester,
          academicYear: data.academicYear
        }));
      } else {
        setError('Failed to fetch class information');
      }
    } catch (err) {
      setError('An error occurred while fetching class information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/classes/${classId}/schedule`);
      
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        setError('Failed to fetch schedules');
      }
    } catch (err) {
      setError('An error occurred while fetching schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/classes/subjects`);
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        console.error('Failed to fetch subjects');
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };
  
  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${API_URL}/classes/lecturers`);
      
      if (response.ok) {
        const data = await response.json();
        setLecturers(data);
      } else {
        console.error('Failed to fetch lecturers');
      }
    } catch (err) {
      console.error('Error fetching lecturers:', err);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Đặt classId vào formData
      const scheduleData = { ...formData, classId };
      
      const url = formMode === 'create'
        ? `${API_URL}/classes/${classId}/schedule`
        : `${API_URL}/classes/schedule/${selectedSchedule.id}`;
      
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Cập nhật danh sách lịch học
        fetchSchedules();
        
        // Reset form
        if (formMode === 'create') {
          resetForm();
        } else {
          setFormMode('create');
          resetForm();
        }
        
        setError('');
        alert(formMode === 'create' ? 'Schedule created successfully' : 'Schedule updated successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save schedule');
      }
    } catch (err) {
      setError('An error occurred while saving the schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedSchedule) return;
    
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/classes/schedule/${selectedSchedule.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Cập nhật danh sách lịch học
        fetchSchedules();
        
        // Reset form
        setFormMode('create');
        resetForm();
        
        alert('Schedule deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete schedule');
      }
    } catch (err) {
      setError('An error occurred while deleting the schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setFormMode('edit');
    
    // Parse time from the display format to HTML time input format
    const startTime = schedule.startTime ? schedule.startTime.slice(0, 5) : '08:00';
    const endTime = schedule.endTime ? schedule.endTime.slice(0, 5) : '09:30';
    
    // Convert day of week from string to integer
    let dayOfWeek;
    switch (schedule.dayOfWeek) {
      case 'Monday': dayOfWeek = 1; break;
      case 'Tuesday': dayOfWeek = 2; break;
      case 'Wednesday': dayOfWeek = 3; break;
      case 'Thursday': dayOfWeek = 4; break;
      case 'Friday': dayOfWeek = 5; break;
      case 'Saturday': dayOfWeek = 6; break;
      case 'Sunday': dayOfWeek = 7; break;
      default: dayOfWeek = 1;
    }
    
    // Populate form with schedule data
    setFormData({
      subjectId: schedule.subjectId || '',
      lecturerId: schedule.lecturerId || '',
      dayOfWeek,
      startTime,
      endTime,
      room: schedule.room || '',
      building: schedule.building || '',
      semester: schedule.semester || classInfo?.semester || '',
      academicYear: schedule.academicYear || classInfo?.academicYear || '',
      isActive: schedule.isActive !== false
    });
  };
  
  const resetForm = () => {
    setSelectedSchedule(null);
    setFormData({
      subjectId: '',
      lecturerId: '',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      room: '',
      building: '',
      semester: classInfo?.semester || '',
      academicYear: classInfo?.academicYear || '',
      isActive: true
    });
  };
  
  const getDayName = (dayNumber) => {
    const day = days.find(d => d.value === dayNumber);
    return day ? day.label : 'Unknown';
  };
  
  return (
    <DashboardLayout>
      <div className="class-management-container">
        <div className="header-with-actions">
          <h1>Class Schedule Management</h1>
          <button className="btn-secondary" onClick={() => navigate('/admin/classes')}>
            Back to Classes
          </button>
        </div>
        
        {loading && <LoadingSpinner />}
        {error && <div className="error-message">{error}</div>}
        
        {classInfo && (
          <div className="class-info-box">
            <h2>{classInfo.className}</h2>
            <div className="class-details-grid">
              <div>
                <strong>Class ID:</strong> {classInfo.classId}
              </div>
              <div>
                <strong>Academic Year:</strong> {classInfo.academicYear}
              </div>
              <div>
                <strong>Semester:</strong> {classInfo.semester}
              </div>
              <div>
                <strong>Students:</strong> {classInfo.currentStudents}/{classInfo.maxStudents}
              </div>
            </div>
          </div>
        )}
        
        <div className="schedule-management-content">
          <div className="schedule-form-section">
            <h2>{formMode === 'create' ? 'Add New Schedule' : 'Edit Schedule'}</h2>
            
            <form onSubmit={handleSubmit} className="schedule-form">
              <div className="form-group">
                <label htmlFor="subjectId">Subject</label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="lecturerId">Lecturer</label>
                <select
                  id="lecturerId"
                  name="lecturerId"
                  value={formData.lecturerId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.fullName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dayOfWeek">Day</label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  required
                >
                  {days.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="room">Room</label>
                  <input
                    type="text"
                    id="room"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="building">Building</label>
                  <input
                    type="text"
                    id="building"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="semester">Semester</label>
                  <input
                    type="text"
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="academicYear">Academic Year</label>
                  <input
                    type="text"
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              
              <div className="form-actions">
                {formMode === 'edit' && (
                  <>
                    <button 
                      type="button" 
                      className="btn-danger" 
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                <button type="submit" className="btn-primary">
                  {formMode === 'create' ? 'Add Schedule' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="schedule-list-section">
            <h2>Class Schedules</h2>
            
            {schedules.length === 0 ? (
              <p className="no-data-message">No schedules found for this class.</p>
            ) : (
              <div className="schedules-table-wrapper">
                <table className="schedules-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Room</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.sort((a, b) => {
                      // Sort by day of week first
                      const dayOrder = {
                        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
                        'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
                      };
                      
                      const dayDiff = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
                      if (dayDiff !== 0) return dayDiff;
                      
                      // Then sort by start time
                      return a.startTime.localeCompare(b.startTime);
                    }).map(schedule => (
                      <tr key={schedule.id} className={!schedule.isActive ? 'inactive' : ''}>
                        <td>{schedule.dayOfWeek}</td>
                        <td>{schedule.startTime} - {schedule.endTime}</td>
                        <td>{schedule.subject}</td>
                        <td>{schedule.room}</td>
                        <td>
                          <button
                            className="btn-secondary btn-small"
                            onClick={() => handleEdit(schedule)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassScheduleManagement; 