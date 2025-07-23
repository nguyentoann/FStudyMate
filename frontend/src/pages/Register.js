import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    phoneNumber: '',
    role: 'Student',
    gender: 'Male',
    dateOfBirth: '',
    academicMajor: 'Software Engineering'
  });
  
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Handle form field changes
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
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Create user object
      const userData = {
        email: formData.email,
        passwordHash: formData.password,
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        academicMajor: formData.academicMajor
      };
      
      // Call register API
      const response = await register(userData);
      console.log('Registration successful:', response);
      
      // Navigate to verification page
      navigate('/verify-otp', { 
        state: { email: userData.email } 
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      darkMode ? 'bg-[#111827]' : 'bg-gradient-to-br from-blue-500 to-blue-600'
    }`}>
      {/* Decorative circles - only visible in dark mode */}
      {darkMode && (
        <>
          <div className="absolute top-[10%] right-[10%] w-32 h-32 rounded-full bg-white opacity-5"></div>
          <div className="absolute bottom-[15%] left-[5%] w-40 h-40 rounded-full bg-white opacity-5"></div>
          <div className="absolute top-[35%] left-[15%] w-24 h-24 rounded-full bg-white opacity-3"></div>
          <div className="absolute bottom-[10%] right-[15%] w-36 h-36 rounded-full bg-white opacity-4"></div>
          <div className="absolute top-[60%] right-[25%] w-20 h-20 rounded-full bg-white opacity-3"></div>
        </>
      )}
      
      {/* Main content container */}
      <div className="max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden flex z-10">
        {/* Left side with illustration - EXACT SAME in both light and dark mode */}
        <div className="hidden md:block w-2/5 bg-cover bg-center relative" 
             style={{ 
               backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')",
               backgroundPosition: 'center'
             }}>
          {/* Gradient overlay - only in light mode */}
          {!darkMode ? (
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-purple-800/50 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                <p className="text-lg opacity-90">Create an account to start your learning journey</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                <p className="text-lg opacity-90">Create an account to start your learning journey</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side with registration form */}
        <div className={`w-full md:w-3/5 py-6 px-8 overflow-y-auto ${
          darkMode ? 'bg-[#1E293B]' : 'bg-white'
        } ${darkMode ? 'text-white' : 'text-gray-800'}`} style={{ maxHeight: "90vh", minHeight: "600px" }}>
          {/* Login/Sign up Tabs */}
          <div className="flex mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`pb-4 px-4 text-base font-medium ${
                activeTab === 'login'
                  ? `text-blue-600 border-b-2 border-blue-500`
                  : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
              }`}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className={`pb-4 px-4 text-base font-medium ${
                activeTab === 'register'
                  ? `text-blue-600 border-b-2 border-blue-500`
                  : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
              }`}
            >
              Sign up
            </button>
          </div>
          
          {/* Form content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email and Username in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className={`pl-10 pr-3 py-2 block w-full rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Username field */}
              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`pl-10 pr-3 py-2 block w-full rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Full Name and Phone Number in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name field */}
              <div>
                <label htmlFor="fullName" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className={`block w-full rounded-lg border py-2 px-3 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              
              {/* Phone Number field */}
              <div>
                <label htmlFor="phoneNumber" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Phone Number
                </label>
                <div className="flex">
                  <div 
                    className={`flex items-center justify-center px-3 rounded-l-lg ${
                      darkMode ? 'bg-gray-600 text-white border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-300'
                    } border`}
                    style={{ minWidth: "70px", height: "40px" }}
                  >
                    <img src="https://flagcdn.com/w20/vn.png" alt="Vietnam" className="mr-1" />
                    <span className="text-sm font-medium">+84</span>
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    placeholder="123456789"
                    className={`block w-full rounded-r-lg border px-3 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    style={{ height: "40px" }}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Password and Confirm Password in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password field */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`pl-10 pr-10 py-2 block w-full rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`pl-10 pr-10 py-2 block w-full rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Role, Gender and Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Role dropdown */}
              <div>
                <label htmlFor="role" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className={`block w-full rounded-lg border py-2 px-3 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Guest">Guest</option>
                  <option value="Outsrc_student">Outsource Student</option>
                </select>
              </div>
              
              {/* Gender dropdown */}
              <div>
                <label htmlFor="gender" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`block w-full rounded-lg border py-2 px-3 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    className={`block w-full rounded-lg border py-2 px-3 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    placeholder="mm/dd/yyyy"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Academic Major field */}
            {(formData.role === 'Student' || formData.role === 'Outsrc_student') && (
              <div>
                <label htmlFor="academicMajor" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Academic Major
                </label>
                <input
                  id="academicMajor"
                  name="academicMajor"
                  type="text"
                  className={`block w-full rounded-lg border py-2 px-3 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={formData.academicMajor}
                  onChange={handleChange}
                />
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className={`rounded-md p-4 ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-700'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${darkMode ? 'text-red-300' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Go Back and Register Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')} 
                className={`flex-1 flex justify-center py-3 px-4 border rounded-lg shadow-sm text-sm font-medium ${
                  darkMode 
                    ? 'border-gray-600 text-white bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Go Back Home
              </button>
              <button
                type="submit"
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 uppercase"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'REGISTER'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 