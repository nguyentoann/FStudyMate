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
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-600 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-xl overflow-hidden flex">
        {/* Left side with mountain image */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}>
        </div>
        
        {/* Right side with registration form */}
        <div className="w-full md:w-1/2 py-6 px-8 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create an account
          </h2>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="guest">Guest</option>
                <option value="outsrc_student">Outsource Student</option>
              </select>
            </div>
            
            {/* Render role-specific fields */}
            {renderRoleSpecificFields()}
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 uppercase"
              >
                Register
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 