import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL } from '../services/config';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { darkMode } = useTheme();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profileImageUrl: '',
    // Role-specific fields will be conditionally rendered
    department: '',
    specializations: '',
    academicMajor: '',
    gender: '',
    dateOfBirth: '',
    organization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user data into form
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profileImageUrl: user.profileImageUrl || '',
        // Role-specific fields
        department: user.department || '',
        specializations: user.specializations || '',
        academicMajor: user.academicMajor || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        organization: user.organization || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create the payload with only the fields that should be updated
      const payload = {
        userId: user.id,
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        profileImageUrl: profileData.profileImageUrl
      };

      // Add role-specific fields
      if (user.role === 'lecturer') {
        payload.department = profileData.department;
        payload.specializations = profileData.specializations;
      } else if (user.role === 'student') {
        payload.academicMajor = profileData.academicMajor;
        payload.gender = profileData.gender;
        payload.dateOfBirth = profileData.dateOfBirth;
      } else if (user.role === 'outsrc_student') {
        payload.organization = profileData.organization;
        payload.dateOfBirth = profileData.dateOfBirth;
      }

      const response = await fetch(`${API_URL}/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local user data
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      // If setUser is available in AuthContext, update it
      if (setUser) {
        setUser(newUserData);
      }

      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      setError(error.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>

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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Profile Image Section */}
            <div className="md:w-1/3 bg-indigo-50 p-8 flex flex-col items-center justify-center">
              <img
                src={profileData.profileImageUrl || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="h-48 w-48 rounded-full object-cover border-4 border-white shadow-md"
              />
              
              {editing && (
                <div className="mt-4 w-full">
                  <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                  <input
                    type="text"
                    name="profileImageUrl"
                    value={profileData.profileImageUrl}
                    onChange={handleInputChange}
                    className="mt-1 p-2 w-full border rounded-md"
                    placeholder="Image URL"
                  />
                </div>
              )}
              
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                <p className="text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="md:w-2/3 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <div>
                  {!editing ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Edit Profile
                      </button>
                      <a
                        href="/change-password"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                      >
                        Change Password
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="mt-1 p-2 w-full border rounded-md"
                        required
                      />
                    ) : (
                      <p className="mt-1">{profileData.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1">{profileData.email}</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    {editing ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 p-2 w-full border rounded-md"
                      />
                    ) : (
                      <p className="mt-1">{profileData.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 capitalize">{user?.role}</p>
                  </div>

                  {/* Conditional Fields based on Role */}
                  {user?.role === 'lecturer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        {editing ? (
                          <input
                            type="text"
                            name="department"
                            value={profileData.department}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          />
                        ) : (
                          <p className="mt-1">{profileData.department || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Specializations</label>
                        {editing ? (
                          <input
                            type="text"
                            name="specializations"
                            value={profileData.specializations}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          />
                        ) : (
                          <p className="mt-1">{profileData.specializations || 'Not provided'}</p>
                        )}
                      </div>
                    </>
                  )}

                  {user?.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Academic Major</label>
                        {editing ? (
                          <input
                            type="text"
                            name="academicMajor"
                            value={profileData.academicMajor}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          />
                        ) : (
                          <p className="mt-1">{profileData.academicMajor || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        {editing ? (
                          <select
                            name="gender"
                            value={profileData.gender}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <p className="mt-1">{profileData.gender || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        {editing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={profileData.dateOfBirth}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          />
                        ) : (
                          <p className="mt-1">{profileData.dateOfBirth || 'Not provided'}</p>
                        )}
                      </div>
                    </>
                  )}

                  {user?.role === 'outsrc_student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                        {editing ? (
                          <input
                            type="text"
                            name="organization"
                            value={profileData.organization}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          />
                        ) : (
                          <p className="mt-1">{profileData.organization || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        {editing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={profileData.dateOfBirth}
                            onChange={handleInputChange}
                            className="mt-1 p-2 w-full border rounded-md"
                          />
                        ) : (
                          <p className="mt-1">{profileData.dateOfBirth || 'Not provided'}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {editing && (
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 