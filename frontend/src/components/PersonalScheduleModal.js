import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/config';
import './Modal.css';

const PersonalScheduleModal = ({ isOpen, onClose, schedule, selectedDate, onSave }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'OTHER',
    location: '',
    color: '#3B82F6',
    isRecurring: false,
    recurrencePattern: '',
    reminderMinutes: 15
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schedule) {
      // Editing existing schedule
      setFormData({
        title: schedule.title || '',
        description: schedule.description || '',
        startTime: schedule.startTime ? format(new Date(schedule.startTime), "yyyy-MM-dd'T'HH:mm") : '',
        endTime: schedule.endTime ? format(new Date(schedule.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        type: schedule.type || 'OTHER',
        location: schedule.location || '',
        color: schedule.color || '#3B82F6',
        isRecurring: schedule.isRecurring || false,
        recurrencePattern: schedule.recurrencePattern || '',
        reminderMinutes: schedule.reminderMinutes || 15
      });
    } else if (selectedDate) {
      // Creating new schedule with selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setFormData({
        title: '',
        description: '',
        startTime: `${dateStr}T09:00`,
        endTime: `${dateStr}T10:00`,
        type: 'OTHER',
        location: '',
        color: '#3B82F6',
        isRecurring: false,
        recurrencePattern: '',
        reminderMinutes: 15
      });
    } else {
      // Creating new schedule with current date
      const now = new Date();
      const dateStr = format(now, 'yyyy-MM-dd');
      setFormData({
        title: '',
        description: '',
        startTime: `${dateStr}T09:00`,
        endTime: `${dateStr}T10:00`,
        type: 'OTHER',
        location: '',
        color: '#3B82F6',
        isRecurring: false,
        recurrencePattern: '',
        reminderMinutes: 15
      });
    }
  }, [schedule, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        userId: user.id
      };

      const url = schedule 
        ? `${API_URL}/schedule/pensrsonal/schedule/${schedule.id}`
        : `${API_URL}/schedule/personal`;
      
      const method = schedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save schedule');
      }

      const savedSchedule = await response.json();
      onSave(savedSchedule);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;

    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/schedule/personal/schedule/${schedule.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${darkMode ? 'dark' : ''}`}>
      <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
        <div className="modal-header">
          <h2>{schedule ? 'Edit Schedule' : 'Add New Schedule'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter schedule title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter schedule description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="datetime-local"
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
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="CLASS">Class</option>
                <option value="EXAM">Exam</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="MEETING">Meeting</option>
                <option value="PERSONAL">Personal</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reminderMinutes">Reminder (minutes before)</label>
            <select
              id="reminderMinutes"
              name="reminderMinutes"
              value={formData.reminderMinutes}
              onChange={handleInputChange}
            >
              <option value="0">No reminder</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="1440">1 day</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
              />
              Recurring Schedule
            </label>
          </div>

          {formData.isRecurring && (
            <div className="form-group">
              <label htmlFor="recurrencePattern">Recurrence Pattern</label>
              <select
                id="recurrencePattern"
                name="recurrencePattern"
                value={formData.recurrencePattern}
                onChange={handleInputChange}
              >
                <option value="">Select pattern</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            {schedule && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            )}
            
            <div className="btn-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (schedule ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalScheduleModal; 