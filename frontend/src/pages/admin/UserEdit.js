import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { API_URL } from '../../services/config';
import { getAuthToken } from '../../utils/AuthUtils';

const UserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    profileImageUrl: '',
    role: '',
    newPassword: '', // Only for admin to set new password
    // Role specific fields will be conditionally shown
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles] = useState(['admin', 'lecturer', 'student', 'outsrc_student', 'guest']);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData({
        ...data,
        newPassword: '',
      });
    } catch (error) {
      setError(error.message || 'An error occurred while fetching user data');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Create a payload with only fields that should be updated
      const payload = {};
      
      // Basic user fields
      if (userData.username) payload.username = userData.username;
      if (userData.email) payload.email = userData.email;
      if (userData.fullName) payload.fullName = userData.fullName;
      if (userData.phoneNumber) payload.phoneNumber = userData.phoneNumber;
      if (userData.profileImageUrl) payload.profileImageUrl = userData.profileImageUrl;
      if (userData.role) payload.role = userData.role;
      if (userData.newPassword) payload.newPassword = userData.newPassword;
      
      // Add role-specific fields based on selected role
      switch (userData.role) {
        case 'student':
          if (userData.academicMajor) payload.academicMajor = userData.academicMajor;
          if (userData.gender) payload.gender = userData.gender;
          if (userData.dateOfBirth) payload.dateOfBirth = userData.dateOfBirth;
          if (userData.classId !== undefined) payload.classId = userData.classId;
          break;
        case 'lecturer':
          if (userData.department) payload.department = userData.department;
          if (userData.specializations) payload.specializations = userData.specializations;
          break;
        case 'outsrc_student':
          if (userData.organization) payload.organization = userData.organization;
          if (userData.dateOfBirth) payload.dateOfBirth = userData.dateOfBirth;
          break;
        case 'guest':
          if (userData.institutionName) payload.institutionName = userData.institutionName;
          if (userData.accessReason) payload.accessReason = userData.accessReason;
          break;
        case 'admin':
          if (userData.permissionsLevel) payload.permissionsLevel = userData.permissionsLevel;
          break;
      }

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setSuccess('User updated successfully');
      
      // Refresh user data
      fetchUserData();
    } catch (error) {
      setError(error.message || 'An error occurred while updating the user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  // Render role-specific fields based on selected role
  const renderRoleSpecificFields = () => {
    switch (userData.role) {
      case 'student':
        return (
          <div className="mt-4 p-4 border rounded-md bg-green-50">
            <h3 className="text-md font-medium mb-4">Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <div className="mt-1 text-sm text-gray-500">{userData.studentId || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class ID</label>
                <input
                  type="text"
                  name="classId"
                  value={userData.classId || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                  placeholder="e.g. SE18D99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Major</label>
                <input
                  type="text"
                  name="academicMajor"
                  value={userData.academicMajor || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={userData.gender || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={userData.dateOfBirth || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
            </div>
          </div>
        );
      
      case 'lecturer':
        return (
          <div className="mt-4 p-4 border rounded-md bg-blue-50">
            <h3 className="text-md font-medium mb-4">Lecturer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lecturer ID</label>
                <div className="mt-1 text-sm text-gray-500">{userData.lecturerId || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={userData.department || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Specializations</label>
                <input
                  type="text"
                  name="specializations"
                  value={userData.specializations || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                  placeholder="e.g. Computer Science, Data Science, AI"
                />
              </div>
            </div>
          </div>
        );
      
      case 'outsrc_student':
        return (
          <div className="mt-4 p-4 border rounded-md bg-yellow-50">
            <h3 className="text-md font-medium mb-4">Outsource Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Outsource ID</label>
                <div className="mt-1 text-sm text-gray-500">{userData.outsrcId || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={userData.organization || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={userData.dateOfBirth || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
            </div>
          </div>
        );
      
      case 'guest':
        return (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-md font-medium mb-4">Guest Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Guest ID</label>
                <div className="mt-1 text-sm text-gray-500">{userData.guestId || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                <input
                  type="text"
                  name="institutionName"
                  value={userData.institutionName || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Access Reason</label>
                <input
                  type="text"
                  name="accessReason"
                  value={userData.accessReason || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="mt-4 p-4 border rounded-md bg-purple-50">
            <h3 className="text-md font-medium mb-4">Admin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin ID</label>
                <div className="mt-1 text-sm text-gray-500">{userData.adminId || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Permissions Level</label>
                <select
                  name="permissionsLevel"
                  value={userData.permissionsLevel || ''}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md"
                >
                  <option value="">Select Permissions Level</option>
                  <option value="ContentManager">Content Manager</option>
                  <option value="UserManager">User Manager</option>
                  <option value="SystemAdmin">System Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit User</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Users
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{success}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic User Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={userData.username || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={userData.fullName || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={userData.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                    <input
                      type="text"
                      name="profileImageUrl"
                      value={userData.profileImageUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      value={userData.role || ''}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role === 'outsrc_student' ? 'Outsource Student' : 
                            role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Password change section */}
                  <div className="md:col-span-2">
                    <div className="p-4 border rounded-md bg-orange-50">
                      <h3 className="text-md font-medium mb-2">Set New Password</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        As an admin, you can set a new password for this user. Leave blank to keep current password.
                      </p>
                      <input
                        type="password"
                        name="newPassword"
                        value={userData.newPassword || ''}
                        onChange={handleInputChange}
                        className="mt-1 p-2 w-full border rounded-md"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Role-specific fields */}
                {renderRoleSpecificFields()}
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mr-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserEdit; 