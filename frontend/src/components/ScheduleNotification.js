import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  scheduleNotification, 
  getScheduledNotifications, 
  scheduleNotificationForRole, 
  scheduleNotificationForClass,
  getAllScheduledNotifications,
  cancelScheduledNotification
} from '../services/notificationService';

const ScheduleNotification = () => {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [targetType, setTargetType] = useState('user'); // 'user', 'role', 'class', 'all'
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedClass, setSelectedClass] = useState('');
  const [userId, setUserId] = useState('');
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user) {
      fetchScheduledNotifications();
    }
  }, [user]);

  const fetchScheduledNotifications = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (user.role.toLowerCase() === 'admin') {
        response = await getAllScheduledNotifications();
      } else {
        response = await getScheduledNotifications();
      }
      
      if (response && response.length) {
        setScheduledNotifications(response);
      }
    } catch (error) {
      setError('Failed to load scheduled notifications');
      console.error('Error loading scheduled notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject || !message || !scheduledDate || !scheduledTime) {
      setError('Subject, message, and scheduled date/time are required');
      return;
    }

    // Combine date and time into ISO format
    const isoDateTime = `${scheduledDate}T${scheduledTime}:00`;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      let response;
      
      switch (targetType) {
        case 'user':
          if (!userId) {
            setError('User ID is required');
            setIsLoading(false);
            return;
          }
          response = await scheduleNotification(userId, subject, message, isoDateTime);
          break;
          
        case 'role':
          if (!selectedRole) {
            setError('Role is required');
            setIsLoading(false);
            return;
          }
          response = await scheduleNotificationForRole(selectedRole, subject, message, isoDateTime);
          break;
          
        case 'class':
          if (!selectedClass) {
            setError('Class ID is required');
            setIsLoading(false);
            return;
          }
          response = await scheduleNotificationForClass(selectedClass, subject, message, isoDateTime);
          break;
          
        default:
          setError('Invalid target type');
          setIsLoading(false);
          return;
      }
      
      if (response.success) {
        setSuccess('Notification scheduled successfully');
        setSubject('');
        setMessage('');
        setScheduledDate('');
        setScheduledTime('');
        fetchScheduledNotifications();
      } else {
        setError(response.error || 'Failed to schedule notification');
      }
    } catch (error) {
      setError('Failed to schedule notification: ' + (error.message || 'Unknown error'));
      console.error('Error scheduling notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled notification?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await cancelScheduledNotification(id);
      
      if (response.success) {
        setSuccess('Notification canceled successfully');
        fetchScheduledNotifications();
      } else {
        setError(response.error || 'Failed to cancel notification');
      }
    } catch (error) {
      setError('Failed to cancel notification');
      console.error('Error canceling notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Check user role for permissions
  const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';
  const isLecturer = user && user.role && user.role.toLowerCase() === 'lecturer';
  const canSelectRole = isAdmin;
  const canSelectClass = isAdmin || isLecturer;
  const canSelectUser = isAdmin || isLecturer;

  return (
    <div className="card p-4 shadow-sm">
      <h3 className="mb-4">Schedule a Notification</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="targetType" className="form-label">Send To</label>
          <select
            id="targetType"
            className="form-select"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            {canSelectUser && <option value="user">Specific User</option>}
            {canSelectRole && <option value="role">All Users by Role</option>}
            {canSelectClass && <option value="class">All Students in a Class</option>}
          </select>
        </div>
        
        {targetType === 'user' && (
          <div className="mb-3">
            <label htmlFor="userId" className="form-label">User ID</label>
            <input
              type="text"
              className="form-control"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
        )}
        
        {targetType === 'role' && (
          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
            >
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
            </select>
          </div>
        )}
        
        {targetType === 'class' && (
          <div className="mb-3">
            <label htmlFor="classId" className="form-label">Class ID</label>
            <input
              type="text"
              className="form-control"
              id="classId"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="mb-3">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input
            type="text"
            className="form-control"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea
            className="form-control"
            id="message"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        
        <div className="row mb-3">
          <div className="col">
            <label htmlFor="scheduledDate" className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              id="scheduledDate"
              min={today}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>
          
          <div className="col">
            <label htmlFor="scheduledTime" className="form-label">Time</label>
            <input
              type="time"
              className="form-control"
              id="scheduledTime"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Notification'}
        </button>
      </form>
      
      {scheduledNotifications.length > 0 && (
        <div className="mt-5">
          <h4>Scheduled Notifications</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Scheduled For</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {scheduledNotifications.map(notification => (
                  <tr key={notification.id}>
                    <td>{notification.subject}</td>
                    <td>{new Date(notification.scheduledDate).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${notification.sent ? 'bg-success' : 'bg-warning'}`}>
                        {notification.sent ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                    {isAdmin && !notification.sent && (
                      <td>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancel(notification.id)}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </td>
                    )}
                    {isAdmin && notification.sent && <td>-</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleNotification; 