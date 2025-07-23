import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { PUBLIC_URL, API_URL } from '../services/config';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { gapi } from 'gapi-script';

// Google client ID from the demo project
const GOOGLE_CLIENT_ID = '924022397797-b984aj2nuiaovp4fgal60seubtslagik.apps.googleusercontent.com';

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

  const { login: loginFn, googleLogin } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Initialize Google API on component mount
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: 'email',
      });
    }
    
    gapi.load('client:auth2', start);
  }, []);

  // Add debounce function for API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Check if email exists
  const checkEmailExists = async (email) => {
    if (!email || !emailValid) return;
    
    setCheckingEmail(true);
    try {
      // Call the API to check if email exists
      const response = await fetch(`${API_URL.replace('/api', '')}/validation/email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {
        // Fallback to simulated check if API fails
        return new Promise(resolve => 
          setTimeout(() => resolve({ 
            ok: true,
            json: () => Promise.resolve({ exists: email === 'admin@example.com' || email === 'test@example.com' })
          }), 600)
        );
      });
      
      const data = await response.json();
      setEmailExists(data.exists);
    } catch (error) {
      console.error('Error checking email:', error);
      // Fallback to simulated check
      setEmailExists(email === 'admin@example.com' || email === 'test@example.com');
    } finally {
      setCheckingEmail(false);
    }
  };

  // Create debounced version of the check function
  const debouncedCheckEmail = debounce(checkEmailExists, 500);

  // Check if username exists
  const checkUsernameExists = async (username) => {
    if (!username) {
      setUsernameValid(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/validation/username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      setUsernameValid(data.exists);
    } catch (error) {
      setUsernameValid(false);
    } finally {
      setCheckingUsername(false);
    }
  };
  const debouncedCheckUsername = debounce(checkUsernameExists, 500);

  const checkLoginExists = async (value) => {
    if (!value) {
      setLoginValid(null);
      return;
    }
    setCheckingLogin(true);
    try {
      // Try username
      const usernameRes = await fetch(`${API_URL.replace('/api', '')}/validation/username?username=${encodeURIComponent(value)}`);
      const usernameData = await usernameRes.json();
      // Try email
      const emailRes = await fetch(`${API_URL.replace('/api', '')}/validation/email?email=${encodeURIComponent(value)}`);
      const emailData = await emailRes.json();
      setLoginValid(usernameData.exists || emailData.exists);
    } catch (error) {
      setLoginValid(false);
    } finally {
      setCheckingLogin(false);
    }
  };
  const debouncedCheckLogin = debounce(checkLoginExists, 500);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'login') {
      setLogin(value);
      setLoginValid(null);
      debouncedCheckLogin(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  // Handle paste events
  const handlePaste = (e) => {
    setTimeout(() => {
      const value = e.target.value;
      setLogin(value);
      setLoginValid(null);
      debouncedCheckLogin(value);
    }, 0);
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
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // Use the googleLogin function from AuthContext
      const response = await googleLogin(credentialResponse.credential);
      
      console.log('Google login successful, response:', response);
      
      // The response itself is the user object from AuthContext.googleLogin
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
      console.error('Google login error:', error);
      setError('Google login failed. Please try again or use email/password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again or use email/password.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} redirectUri="http://localhost:3000/login/oauth2/code/google">
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="relative w-full h-full">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ 
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 8,
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-52 h-52 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ 
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 10,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 12,
          }}
        />
            </div>

      <div className="z-10 w-full max-w-md">
        <motion.div 
          className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex">
            <button
              className={`w-1/2 py-4 text-center font-medium ${activeTab === 'login' ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
              <button
              className={`w-1/2 py-4 text-center font-medium ${activeTab === 'signup' ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              onClick={() => navigate('/register')}
              >
              Sign Up
              </button>
            </div>
          
          <div className="p-8">
            <motion.h2 
              className="text-3xl font-extrabold text-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome Back
            </motion.h2>
            
            <motion.form 
              className="space-y-6"
              onSubmit={handleLogin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {error && (
                <motion.div 
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {error}
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="min-h-[85px]"
              >
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {/* User icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <motion.input
                    type="text"
                    id="login"
                    name="login"
                    value={login}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className={`pl-10 pr-10 block w-full rounded-lg border h-[42px] ${login && loginValid === false ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : loginValid === true ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} shadow-sm transition-all duration-300`}
                    placeholder="Username or email"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                  {login && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {checkingLogin ? (
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : loginValid === true ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : loginValid === false ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                      ) : null}
              </div>
                  )}
            </div>
                {login && loginValid === false && (
                  <p className="text-sm text-red-600 mt-1">This username or email is not registered.</p>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="min-h-[85px]"
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
                  <motion.input
                    type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                    value={password}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[42px] transition-all duration-300"
                required
                    whileFocus={{ scale: 1.01 }}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
            </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </motion.div>
              
              <motion.button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                  disabled={loading}
              >
                  {loading ? 'Signing In...' : 'Sign In'}
              </motion.button>

                {/* Google Login Button */}
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'}`}>Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      useOneTap
                      theme={darkMode ? 'filled_black' : 'outline'}
                      text="signin_with"
                      shape="rectangular"
                      locale="en"
                    />
                  </div>
                </motion.div>
              
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
              >
                <Link
                  to="/" 
                  className="text-sm text-blue-600 hover:text-blue-800 flex justify-center items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go back home
                </Link>
              </motion.div>
            </motion.form>
            </div>
        </motion.div>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
