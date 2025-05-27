import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { PUBLIC_URL, OPEN_URL, EMERGENCY_URL, API_URL } from '../services/config';

// Add API emergency URL
const API_EMERGENCY_URL = `${API_URL}/emergency`;

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    phoneNumber: '',
    role: 'student',
    // Student-specific fields
    dateOfBirth: '',
    gender: 'Male',
    academicMajor: 'Software Engineering',
    // Lecturer-specific fields
    department: '',
    specializations: '',
    // Guest-specific fields
    institutionName: '',
    accessReason: '',
    // Outsource student fields
    organization: ''
  });
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const { register } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebug('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setDebug('Submitting registration data...');
      
      // Create user object with correct field mapping
      const userData = {
        email: formData.email,
        passwordHash: formData.password, // This will be hashed on the server
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
      };
      
      // Add role-specific fields based on selected role
      switch(formData.role) {
        case 'student':
          userData.dateOfBirth = formData.dateOfBirth;
          userData.gender = formData.gender;
          userData.academicMajor = formData.academicMajor;
          break;
        case 'lecturer':
          userData.department = formData.department;
          userData.specializations = formData.specializations;
          break;
        case 'guest':
          userData.institutionName = formData.institutionName;
          userData.accessReason = formData.accessReason;
          break;
        case 'outsrc_student':
          userData.dateOfBirth = formData.dateOfBirth;
          userData.organization = formData.organization;
          break;
        default:
          // No additional fields needed
          break;
      }
      
      setDebug(prev => prev + '\nSending data: ' + JSON.stringify(userData));
      
      // Call register API
      const response = await register(userData);
      setDebug(prev => prev + '\nRegistration successful! Response: ' + JSON.stringify(response));
      
      // After successful registration, generate OTP using a separate call
      setDebug(prev => prev + '\n\nAttempting to generate OTP using multiple endpoints...');

      // Try all three possible OTP generation endpoints
      let otpGenerationSuccessful = false;

      // 1. Try API endpoint first
      try {
        setDebug(prev => prev + '\nTrying API endpoint for OTP generation...');
        const otpResponse = await fetch(`${API_URL}/auth/generate-otp`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userData.email }),
          credentials: 'omit'
        });
        
        const otpData = await otpResponse.json().catch(() => ({}));
        
        if (otpResponse.ok) {
          setDebug(prev => prev + '\nAPI OTP generation successful: ' + JSON.stringify(otpData));
          otpGenerationSuccessful = true;
        } else {
          setDebug(prev => prev + '\nAPI OTP generation failed, trying API emergency endpoint...');
        }
      } catch (apiError) {
        setDebug(prev => prev + '\nError with API OTP generation: ' + apiError.message);
      }

      // 2. Try API emergency endpoint if needed
      if (!otpGenerationSuccessful) {
        try {
          setDebug(prev => prev + '\nTrying API emergency endpoint for OTP generation...');
          const apiEmergencyResponse = await fetch(`${API_EMERGENCY_URL}/otp/generate`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userData.email }),
            credentials: 'omit'
          });
          
          const apiEmergencyData = await apiEmergencyResponse.json().catch(() => ({}));
          
          if (apiEmergencyResponse.ok) {
            setDebug(prev => prev + '\nAPI emergency OTP generation successful: ' + JSON.stringify(apiEmergencyData));
            otpGenerationSuccessful = true;
          } else {
            setDebug(prev => prev + '\nAPI emergency OTP generation failed, trying direct emergency endpoint...');
          }
        } catch (apiEmergencyError) {
          setDebug(prev => prev + '\nError with API emergency OTP generation: ' + apiEmergencyError.message);
        }
      }

      // 3. Try direct emergency endpoint as final fallback
      if (!otpGenerationSuccessful) {
        try {
          setDebug(prev => prev + '\nTrying direct emergency endpoint for OTP generation...');
          const emergencyResponse = await fetch(`${EMERGENCY_URL}/generate-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userData.email }),
            credentials: 'omit'
          });
          
          const emergencyData = await emergencyResponse.json().catch(() => ({}));
          
          if (emergencyResponse.ok) {
            // Check if emergency OTP endpoint returned the OTP directly (for testing)
            if (emergencyData.otp) {
              setDebug(prev => prev + '\nEmergency OTP generation successful. For testing use: ' + emergencyData.otp);
            } else {
              setDebug(prev => prev + '\nEmergency OTP generation successful: ' + JSON.stringify(emergencyData));
            }
            otpGenerationSuccessful = true;
          } else {
            setDebug(prev => prev + '\nAll OTP generation attempts failed: ' + JSON.stringify(emergencyData));
          }
        } catch (emergencyError) {
          setDebug(prev => prev + '\nError with emergency OTP endpoint: ' + emergencyError.message);
        }
      }

      // Navigate to verification page regardless of OTP generation success
      navigate('/verify-otp', { 
        state: { email: userData.email } 
      });
      
    } catch (error) {
      setDebug(prev => prev + '\nRegistration error: ' + error.message);
      setError('Registration failed: ' + error.message);
    }
  };

  // Test the public endpoint
  const testPublicEndpoint = async () => {
    setDebug('Testing public endpoint...');
    try {
      const response = await fetch(`${PUBLIC_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
      
      setDebug(prev => prev + '\nPublic endpoint status: ' + response.status);
      
      if (response.ok) {
        const data = await response.json();
        setDebug(prev => prev + '\nPublic endpoint response: ' + JSON.stringify(data));
      } else {
        setDebug(prev => prev + '\nPublic endpoint error: ' + response.statusText);
      }
    } catch (error) {
      setDebug(prev => prev + '\nPublic endpoint error: ' + error.message);
    }
  };

  // Test the emergency endpoint
  const testEmergencyEndpoint = async () => {
    setDebug('Testing emergency endpoint...');
    try {
      const response = await fetch(`${EMERGENCY_URL}/test`, {
        method: 'GET'
      });
      
      setDebug(prev => prev + '\nEmergency endpoint status: ' + response.status);
      
      if (response.ok) {
        const data = await response.json();
        setDebug(prev => prev + '\nEmergency endpoint response: ' + JSON.stringify(data));
      } else {
        setDebug(prev => prev + '\nEmergency endpoint error: ' + response.statusText);
      }
    } catch (error) {
      setDebug(prev => prev + '\nEmergency endpoint error: ' + error.message);
    }
  };

  // Test the open endpoint
  const testOpenEndpoint = async () => {
    setDebug('Testing open endpoint...');
    try {
      const response = await fetch(`${OPEN_URL}/test`, {
        method: 'GET'
      });
      
      setDebug(prev => prev + '\nOpen endpoint status: ' + response.status);
      
      if (response.ok) {
        const data = await response.json();
        setDebug(prev => prev + '\nOpen endpoint response: ' + JSON.stringify(data));
      } else {
        setDebug(prev => prev + '\nOpen endpoint error: ' + response.statusText);
      }
    } catch (error) {
      setDebug(prev => prev + '\nOpen endpoint error: ' + error.message);
    }
  };

  // Function to conditionally render role-specific fields
  const renderRoleSpecificFields = () => {
    const inputClassName = `appearance-none rounded-none relative block w-full px-3 py-2 border ${
      darkMode 
        ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
        : 'border-gray-300 placeholder-gray-500 text-gray-900'
    } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`;
    
    switch(formData.role) {
      case 'student':
        return (
          <>
            <div>
              <label htmlFor="dateOfBirth" className="sr-only">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className={inputClassName}
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="gender" className="sr-only">Gender</label>
              <select
                id="gender"
                name="gender"
                required
                className={inputClassName}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="academicMajor" className="sr-only">Academic Major</label>
              <input
                id="academicMajor"
                name="academicMajor"
                type="text"
                required
                className={inputClassName}
                placeholder="Academic Major"
                value={formData.academicMajor}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 'lecturer':
        return (
          <>
            <div>
              <label htmlFor="department" className="sr-only">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                required
                className={inputClassName}
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="specializations" className="sr-only">Specializations</label>
              <input
                id="specializations"
                name="specializations"
                type="text"
                required
                className={inputClassName}
                placeholder="Specializations (comma separated)"
                value={formData.specializations}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 'guest':
        return (
          <>
            <div>
              <label htmlFor="institutionName" className="sr-only">Institution Name</label>
              <input
                id="institutionName"
                name="institutionName"
                type="text"
                required
                className={inputClassName}
                placeholder="Institution Name"
                value={formData.institutionName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="accessReason" className="sr-only">Access Reason</label>
              <textarea
                id="accessReason"
                name="accessReason"
                required
                className={inputClassName}
                placeholder="Reason for access"
                value={formData.accessReason}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </>
        );
      case 'outsrc_student':
        return (
          <>
            <div>
              <label htmlFor="dateOfBirth" className="sr-only">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className={inputClassName}
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="organization" className="sr-only">Organization</label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                className={inputClassName}
                placeholder="Organization"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full space-y-8 ${darkMode ? 'bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700' : ''}`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`rounded-md ${darkMode ? 'bg-red-900' : 'bg-red-50'} p-4`}>
              <div className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</div>
            </div>
          )}
          {debug && (
            <div className={`rounded-md ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-4 whitespace-pre-wrap`}>
              <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} break-words`}>{debug}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="sr-only">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="outsrc_student">Outsource Student</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            
            {/* Render role-specific fields */}
            {renderRoleSpecificFields()}
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={testPublicEndpoint}
              className={`flex-1 py-2 px-2 text-xs border border-transparent font-medium rounded-md text-white ${
                darkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none`}
            >
              Test Public API
            </button>
            
            <button
              type="button"
              onClick={testEmergencyEndpoint}
              className={`flex-1 py-2 px-2 text-xs border border-transparent font-medium rounded-md text-white ${
                darkMode ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'
              } focus:outline-none`}
            >
              Test Emergency
            </button>
            
            <button
              type="button"
              onClick={testOpenEndpoint}
              className={`flex-1 py-2 px-2 text-xs border border-transparent font-medium rounded-md text-white ${
                darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none`}
            >
              Test Open
            </button>
          </div>
          
          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Register
            </button>
          </div>
          
          <div className="text-center">
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-500 hover:text-indigo-400">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 