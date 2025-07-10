import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createAllUsersNotification,
  createRoleNotification,
  createClassNotification,
  createMultiClassNotification,
  createGroupNotification,
  createOutsourceStudentsNotification,
  createIndividualNotification,
  createNotificationWithUserId
} from '../services/notificationService';
import apiHelper from '../services/apiHelper';

const AdvancedNotificationForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notificationType: 'ALL',
    targetRole: 'STUDENT',
    classId: '',
    classIds: [],
    userIds: [],
    recipientId: ''
  });
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(['STUDENT', 'LECTURER', 'ADMIN']);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch classes and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const classesResponse = await apiHelper.get('/api/classes');
        if (classesResponse.data && classesResponse.data.success) {
          setClasses(classesResponse.data.classes || []);
        }

        // Fetch users
        const usersResponse = await apiHelper.get('/api/users');
        if (usersResponse.data && usersResponse.data.success) {
          setUsers(usersResponse.data.users || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load classes and users data');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUserSelect = (e) => {
    const userId = parseInt(e.target.value, 10);
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user && !selectedUsers.some(u => u.id === userId)) {
        setSelectedUsers([...selectedUsers, user]);
        setFormData({
          ...formData,
          userIds: [...formData.userIds, userId]
        });
      }
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    setFormData({
      ...formData,
      userIds: formData.userIds.filter(id => id !== userId)
    });
  };

  const handleClassSelect = (e) => {
    const classId = e.target.value;
    if (classId && !selectedClasses.some(c => c.id === classId)) {
      const classObj = classes.find(c => c.id === classId);
      if (classObj) {
        setSelectedClasses([...selectedClasses, classObj]);
        setFormData({
          ...formData,
          classIds: [...formData.classIds, classId]
        });
      }
    }
  };

  const handleRemoveClass = (classId) => {
    setSelectedClasses(selectedClasses.filter(c => c.id !== classId));
    setFormData({
      ...formData,
      classIds: formData.classIds.filter(id => id !== classId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      let response;

      switch (formData.notificationType) {
        case 'ALL':
          response = await createAllUsersNotification(formData.title, formData.message);
          break;
        case 'ROLE':
          response = await createRoleNotification(formData.title, formData.message, formData.targetRole);
          break;
        case 'CLASS':
          response = await createClassNotification(formData.title, formData.message, formData.classId);
          break;
        case 'MULTI_CLASS':
          response = await createMultiClassNotification(formData.title, formData.message, formData.classIds);
          break;
        case 'GROUP':
          response = await createGroupNotification(formData.title, formData.message, formData.userIds);
          break;
        case 'OUTSOURCE_STUDENTS':
          response = await createOutsourceStudentsNotification(formData.title, formData.message);
          break;
        case 'INDIVIDUAL':
          response = await createIndividualNotification(formData.title, formData.message, parseInt(formData.recipientId, 10));
          break;
        default:
          throw new Error('Invalid notification type');
      }

      if (response && response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          message: '',
          notificationType: 'ALL',
          targetRole: 'STUDENT',
          classId: '',
          classIds: [],
          userIds: [],
          recipientId: ''
        });
        setSelectedUsers([]);
        setSelectedClasses([]);
      } else {
        setError(response.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Send Notification</h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Notification sent successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Notification Type
          </label>
          <select
            name="notificationType"
            value={formData.notificationType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="ALL">All Users</option>
            <option value="ROLE">By Role</option>
            <option value="CLASS">Single Class</option>
            <option value="MULTI_CLASS">Multiple Classes</option>
            <option value="GROUP">Group of Users</option>
            <option value="OUTSOURCE_STUDENTS">Outsource Students</option>
            <option value="INDIVIDUAL">Individual User</option>
          </select>
        </div>

        {formData.notificationType === 'ROLE' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Target Role
            </label>
            <select
              name="targetRole"
              value={formData.targetRole}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        )}

        {formData.notificationType === 'CLASS' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Class
            </label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select a class</option>
              {classes.map(classObj => (
                <option key={classObj.id} value={classObj.id}>
                  {classObj.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.notificationType === 'MULTI_CLASS' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Classes
            </label>
            <div className="flex items-center">
              <select
                onChange={handleClassSelect}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select classes to add</option>
                {classes.map(classObj => (
                  <option key={classObj.id} value={classObj.id}>
                    {classObj.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              {selectedClasses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedClasses.map(classObj => (
                    <div key={classObj.id} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                      <span className="text-sm">{classObj.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(classObj.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No classes selected</p>
              )}
            </div>
          </div>
        )}

        {formData.notificationType === 'GROUP' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Users
            </label>
            <div className="flex items-center">
              <select
                onChange={handleUserSelect}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select users to add</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              {selectedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                      <span className="text-sm">{user.fullName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No users selected</p>
              )}
            </div>
          </div>
        )}

        {formData.notificationType === 'INDIVIDUAL' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Recipient
            </label>
            <select
              name="recipientId"
              value={formData.recipientId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select a recipient</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
            placeholder="Notification title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            rows="4"
            required
            placeholder="Notification message"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedNotificationForm; 