import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { PUBLIC_URL, API_URL } from '../services/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState(null); // null = not checked, true = exists, false = doesn't exist
  const [loginFailed, setLoginFailed] = useState(false);

  const { login: loginFn } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Add debounce function for API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Check if username/email exists
  const checkUserExists = async (userInput) => {
    if (!userInput || userInput.length < 3) return;
    
    setCheckingUser(true);
    setUserExists(null);
    try {
      // Call the API to check if username/email exists
      const response = await fetch(`${API_URL.replace('/api', '')}/validation/user?input=${encodeURIComponent(userInput)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {
        // Fallback to simulated check if API fails
        return new Promise(resolve => 
          setTimeout(() => resolve({ 
            ok: true,
            json: () => Promise.resolve({ exists: userInput === 'admin@example.com' || userInput === 'admin' || userInput === 'test@example.com' || userInput === 'test' })
          }), 600)
        );
      });
      
      const data = await response.json();
      setUserExists(data.exists);
    } catch (error) {
      console.error('Error checking user:', error);
      // Fallback to simulated check
      setUserExists(userInput === 'admin@example.com' || userInput === 'admin' || userInput === 'test@example.com' || userInput === 'test');
    } finally {
      setCheckingUser(false);
    }
  };

  // Create debounced version of the check function
  const debouncedCheckUser = debounce(checkUserExists, 500);

  // Handle username/email input changes
  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setLoginFailed(false);
    
    if (value && value.length >= 3) {
      debouncedCheckUser(value);
    } else {
      setUserExists(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoginFailed(false);
    
    try {
      await loginFn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
      setLoginFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      
      <motion.div 
        className={`rounded-lg shadow-xl w-full max-w-md overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Tabs */}
        <div className="flex">
          <button 
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'login' 
                ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}` 
                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <Link 
            to="/register"
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab !== 'login' 
                ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}` 
                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`
            }`}
          >
            Sign Up
          </Link>
        </div>

        <div className="p-8">
          <motion.h2 
            className={`text-2xl font-bold mb-8 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}
            variants={itemVariants}
          >
            Welcome Back
          </motion.h2>

          {/* Login error message */}
          {loginFailed && (
            <motion.div 
              className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg"
              variants={itemVariants}
            >
              Login failed. Please check your credentials and try again.
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <motion.div className="mb-6" variants={itemVariants}>
              <label 
                className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} 
                htmlFor="email"
              >
                Username or Email
              </label>
              <div className="relative">
                <input 
                  className={`w-full px-4 py-2 rounded-lg border ${
                    userExists === false 
                      ? 'border-red-500' 
                      : userExists === true 
                        ? 'border-green-500' 
                        : darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
                  id="email"
                  type="text"
                  value={email}
                  onChange={handleUserInputChange}
                  placeholder="Username or email"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUser && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  )}
                  {!checkingUser && userExists === false && (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  {!checkingUser && userExists === true && (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </div>
              </div>
              {userExists === false && (
                <p className="mt-1 text-sm text-red-500">This username or email is not registered.</p>
              )}
            </motion.div>

            <motion.div className="mb-6" variants={itemVariants}>
              <label 
                className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input 
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'} 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginFailed(false);
                  }}
                  placeholder="Password"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div className="flex items-center justify-between mb-6" variants={itemVariants}>
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 rounded border-gray-300 ${darkMode ? 'bg-gray-700' : 'bg-white'} text-blue-600 focus:ring-blue-500`}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </motion.div>

            {error && !loginFailed && (
              <motion.div 
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
                variants={itemVariants}
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all focus:outline-none ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </motion.div>
            
            <motion.div className="mt-8 text-center" variants={itemVariants}>
              <Link to="/" className="inline-flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go back home
              </Link>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
