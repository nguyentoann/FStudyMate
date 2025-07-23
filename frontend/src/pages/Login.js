import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [emailExists, setEmailExists] = useState(null); // null = not checked, true = exists, false = doesn't exist
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(null); // null = not checked, true = exists, false = not found
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [login, setLogin] = useState('');
  const [loginValid, setLoginValid] = useState(null); // null = not checked, true = exists, false = not found
  const [checkingLogin, setCheckingLogin] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!login) {
      setError('Please enter your username or email');
      return;
    }
    
    if (loginValid === false) {
      setError('This username or email is not registered');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Pass login as both username and email, let backend decide
      const response = await loginFn(login, password); // loginFn should handle username/email
      
      // Use navigate to redirect based on role
      console.log('Login successful, response:', response);
      
      // The response itself is the user object from AuthContext.login
      if (response && response.role) {
        const role = response.role.toLowerCase();
        console.log(`User authenticated with role: ${role}, redirecting to dashboard`);
        
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'lecturer':
            navigate('/lecturer/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'guest':
            navigate('/guest/dashboard');
            break;
          case 'outsrc_student':
            navigate('/outsource/dashboard');
            break;
          default:
            // Default to student dashboard if role is unknown
            console.log(`Unknown role: ${role}, redirecting to default dashboard`);
            navigate('/dashboard');
            break;
        }
      } else {
        // Fallback to generic dashboard if no specific role found
        console.log('User authenticated but no role found, redirecting to default dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
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
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${darkMode 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      
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
      
      <motion.div 
        className={`rounded-lg shadow-xl w-full max-w-md p-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}
          variants={itemVariants}
        >
          Welcome to FStudyMate
        </motion.h2>
        
        {/* Login/Register Tabs */}
        <motion.div className={`flex mb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} variants={itemVariants}>
          <button
            className={`flex-1 py-2 font-medium ${
              activeTab === 'login'
                ? `text-blue-600 border-b-2 border-blue-500 ${darkMode ? 'border-blue-400' : ''}`
                : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 font-medium ${
              activeTab === 'register'
                ? `text-blue-600 border-b-2 border-blue-500 ${darkMode ? 'border-blue-400' : ''}`
                : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
            }`}
            onClick={() => navigate('/register')}
          >
            Sign up
          </button>
        </motion.div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <motion.form 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleLogin}
          >
            {/* Login or Email field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="login" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Username or Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    loginValid === false ? 'border-red-300' : darkMode ? 'border-gray-600' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 ${
                    darkMode 
                      ? 'bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'focus:ring-blue-500 focus:border-blue-500'
                  } sm:text-sm`}
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                    setLoginValid(null);
                  }}
                />
                {checkingLogin && (
                  <div className="absolute right-3 top-2">
                    <svg className={`animate-spin h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {login && loginValid === false && (
                <p className="text-sm text-red-600 mt-1">This username or email is not registered.</p>
              )}
            </motion.div>

            {/* Password field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                  Forgot your password?
                </Link>
              </div>
            </motion.div>

            {/* Error display */}
            {error && (
              <motion.div 
                variants={itemVariants}
                className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-50 border-red-400 text-red-700'} border-l-4 p-4`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${darkMode ? 'text-red-300' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${darkMode ? 'text-red-100' : 'text-red-700'}`}>{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Login button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
