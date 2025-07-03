import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { API_URL } from '../services/config';

const NotificationSender = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form state
  const [notificationType, setNotificationType] = useState('SYSTEM');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sendOption, setSendOption] = useState('individual'); // individual, allStudents, class, all
  
  // Check user roles on mount
  useEffect(() => {
    if (user) {
      setIsAdmin(user.role?.toLowerCase() === 'admin');
      setIsLecturer(user.role?.toLowerCase() === 'lecturer');
      
      // Fetch users and classes if admin or lecturer
      if (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'lecturer') {
        fetchUsers();
        fetchClasses();
      }
    }
  }, [user]);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      // Filter users based on role if lecturer (only show students)
      if (user.role?.toLowerCase() === 'lecturer') {
        const students = response.data.filter(
          u => u.role?.toLowerCase() === 'student' || u.role?.toLowerCase() === 'outsrc_student'
        );
        setUsers(students);
      } else {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setErrorMessage('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate form
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Title and message are required');
      setLoading(false);
      return;
    }
    
    try {
      let response;
      const payload = {
        type: notificationType,
        title,
        message,
        link: link || null
      };
      
      // Different API endpoints based on send option
      switch (sendOption) {
        case 'individual':
          if (selectedRecipients.length === 0) {
            setErrorMessage('Please select at least one recipient');
            setLoading(false);
            return;
          }
          
          if (selectedRecipients.length === 1) {
            // Send to one user
            response = await axios.post(`${API_URL}/notification-management/send-to-user`, {
              ...payload,
              recipientId: selectedRecipients[0]
            });
          } else {
            // Send to multiple users
            response = await axios.post(`${API_URL}/notification-management/send-to-users`, {
              ...payload,
              recipientIds: selectedRecipients
            });
          }
          break;
          
        case 'allStudents':
          response = await axios.post(`${API_URL}/notification-management/send-to-all-students`, payload);
          break;
          
        case 'class':
          if (!selectedClass) {
            setErrorMessage('Please select a class');
            setLoading(false);
            return;
          }
          response = await axios.post(`${API_URL}/notification-management/send-to-class/${selectedClass}`, payload);
          break;
          
        case 'all':
          response = await axios.post(`${API_URL}/notification-management/send-to-all`, payload);
          break;
          
        default:
          setErrorMessage('Invalid send option');
          setLoading(false);
          return;
      }
      
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        // Clear form
        setTitle('');
        setMessage('');
        setLink('');
        setSelectedRecipients([]);
        setSelectedClass('');
      } else {
        setErrorMessage(response.data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };
  
  // If user is a student, show message that they don't have permission
  if (!isAdmin && !isLecturer) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Notification Center</h1>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
              <p>You don't have permission to send notifications.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Send Notifications</h1>
          
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{successMessage}</p>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Send Options */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Send To:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="individual"
                    name="sendOption"
                    value="individual"
                    checked={sendOption === 'individual'}
                    onChange={() => setSendOption('individual')}
                    className="mr-2"
                  />
                  <label htmlFor="individual">Selected Recipients</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="allStudents"
                    name="sendOption"
                    value="allStudents"
                    checked={sendOption === 'allStudents'}
                    onChange={() => setSendOption('allStudents')}
                    className="mr-2"
                  />
                  <label htmlFor="allStudents">All Students</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="class"
                    name="sendOption"
                    value="class"
                    checked={sendOption === 'class'}
                    onChange={() => setSendOption('class')}
                    className="mr-2"
                  />
                  <label htmlFor="class">Specific Class</label>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all"
                      name="sendOption"
                      value="all"
                      checked={sendOption === 'all'}
                      onChange={() => setSendOption('all')}
                      className="mr-2"
                    />
                    <label htmlFor="all">All Users</label>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recipients Selection - Only show if individual option is selected */}
            {sendOption === 'individual' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Select Recipients:</label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {loading ? (
                    <LoadingSpinner />
                  ) : users.length === 0 ? (
                    <p className="text-gray-500">No users found</p>
                  ) : (
                    users.map(user => (
                      <div key={user.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          value={user.id}
                          checked={selectedRecipients.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients([...selectedRecipients, user.id]);
                            } else {
                              setSelectedRecipients(selectedRecipients.filter(id => id !== user.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`user-${user.id}`}>
                          {user.fullName || user.username} ({user.role})
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Class Selection - Only show if class option is selected */}
            {sendOption === 'class' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Select Class:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required={sendOption === 'class'}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Notification Type */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Notification Type:</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="SYSTEM">System</option>
                <option value="SCHEDULE">Schedule</option>
                <option value="TEST">Test</option>
                <option value="MATERIAL">Material</option>
              </select>
            </div>
            
            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            {/* Message */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-32"
                required
              />
            </div>
            
            {/* Link (Optional) */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Link (Optional):</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="https://example.com"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationSender;