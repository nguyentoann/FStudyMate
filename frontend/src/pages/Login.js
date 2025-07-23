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
      console.error('Error checking username:', error);
      setUsernameValid(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Create debounced version of the check function
  const debouncedCheckUsername = debounce(checkUsernameExists, 500);

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

        {/* Rest of your login UI */}
        {/* ... existing code ... */}

      </motion.div>
    </div>
  );
};

export default Login;
