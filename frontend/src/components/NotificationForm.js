import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createNotification } from '../services/notificationService';

const NotificationForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notificationType: 'ALL',
    targetRole: '',
    classId: '',
    userIds: []
  });
  const [availableRoles, setAvailableRoles] = useState(['student', 'lecturer', 'admin', 'guest', 'outsrc_student']);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch available classes
  useEffect(() => {
    // This would normally fetch from an API
    // For now, we'll just use some dummy data
    setAvailableClasses(['CLASS001', 'CLASS002', 'CLASS003', 'CLASS004', 'CLASS005']);
  }, []);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validate form data based on notification type
      if (formData.notificationType === 'ROLE' && !formData.targetRole) {
        throw new Error('Please select a target role');
      }
      
      if (formData.notificationType === 'CLASS' && !formData.classId) {
        throw new Error('Please select a class');
      }
      
      // Create notification
      const response = await createNotification(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          message: '',
          notificationType: 'ALL',
          targetRole: '',
          classId: '',
          userIds: []
        });
      } else {
        throw new Error(response.error || 'Failed to create notification');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has permission to create notifications
  if (!user || (user.role !== 'admin' && user.role !== 'lecturer')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        You don't have permission to create notifications.
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Notification</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          Notification created successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          {/* Notification Type */}
          <div>
            <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700">
              Notification Type
            </label>
            <select
              id="notificationType"
              name="notificationType"
              value={formData.notificationType}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="ALL">All Users</option>
              <option value="ROLE">By Role</option>
              <option value="CLASS">By Class</option>
            </select>
          </div>
          
          {/* Target Role (only if notificationType is ROLE) */}
          {formData.notificationType === 'ROLE' && (
            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">
                Target Role
              </label>
              <select
                id="targetRole"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a role</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Class ID (only if notificationType is CLASS) */}
          {formData.notificationType === 'CLASS' && (
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                Class
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a class</option>
                {availableClasses.map(classId => (
                  <option key={classId} value={classId}>
                    {classId}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NotificationForm; 