import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverifiedAccount, setUnverifiedAccount] = useState(null);
  const { login } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setUnverifiedAccount(null); // Reset unverified state
    
    try {
      const result = await login(loginIdentifier, password);
      
      // Check if result indicates unverified account
      if (result.requiresVerification) {
        console.log('Account requires verification:', result);
        setUnverifiedAccount(result);
        return; // Don't proceed with normal login flow
      }
      
      // Normal login success - redirect based on role
      switch (result.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'lecturer':
          navigate('/lecturer/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'outsrc_student':
          navigate('/outsource/dashboard');
          break;
        case 'guest':
          navigate('/guest/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login submit error:', error);
      // Show the actual error message from the server if available
      setError(error.message || 'Invalid login credentials');
    }
  };

  const handleVerifyAccount = () => {
    if (unverifiedAccount && unverifiedAccount.email) {
      // Navigate to verification page with email
      navigate('/verify-otp', { 
        state: { 
          email: unverifiedAccount.email
        }
      });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full space-y-8 ${darkMode ? 'bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700' : ''}`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && !unverifiedAccount && (
            <div className={`rounded-md ${darkMode ? 'bg-red-900' : 'bg-red-50'} p-4`}>
              <div className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</div>
            </div>
          )}
          
          {unverifiedAccount && (
            <div className={`rounded-md ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} p-4`}>
              <div className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'} mb-3`}>
                {unverifiedAccount.message || 'Your account needs to be verified before logging in.'}
              </div>
              <button
                type="button"
                onClick={handleVerifyAccount}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  darkMode ? 'bg-yellow-700 hover:bg-yellow-800' : 'bg-yellow-600 hover:bg-yellow-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
              >
                Verify Account
              </button>
            </div>
          )}
          
          <div>
            <div>
              <label htmlFor="loginIdentifier" className="sr-only">
                Username or Email
              </label>
              <input
                id="loginIdentifier"
                name="loginIdentifier"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Username or Email address"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
            </div>
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
                } rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Sign in
            </button>
          </div>
          
          <div className="text-center">
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-500 hover:text-indigo-400">
                Register now
              </Link>
            </p>
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Try these credentials: admin@example.com / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 