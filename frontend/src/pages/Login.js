import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [unverifiedAccount, setUnverifiedAccount] = useState(null);
  const { login } = useAuth();
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

  const handleGoogleLogin = () => {
    // Implement Google login logic
    console.log('Google login clicked');
    // This would typically redirect to your OAuth endpoint
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden flex">
        {/* Left side with mountain image */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}>
        </div>
        
        {/* Right side with login form */}
        <div className="w-full md:w-1/2 py-8 px-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Login into account
          </h2>
          
          {error && !unverifiedAccount && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          {unverifiedAccount && (
            <div className="rounded-md bg-yellow-50 p-4 mb-4">
              <div className="text-sm text-yellow-700 mb-3">
                {unverifiedAccount.message || 'Your account needs to be verified before logging in.'}
              </div>
              <button
                type="button"
                onClick={handleVerifyAccount}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Verify Account
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="loginIdentifier"
                name="loginIdentifier"
                type="text"
                required
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Email Address"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 uppercase"
              >
                Login
              </button>
            </div>
            
            <div className="text-center">
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </a>
            </div>
            
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-600 text-sm">or login with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path 
                    fill="#EA4335" 
                    d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2363636,5.50909091 16.4527273,6.5L19.3454545,3.60727273 C17.3527273,1.79909091 14.7727273,0.727272727 12,0.727272727 C7.31818182,0.727272727 3.325,3.70454545 1.5,8.09090909 L5.26620003,9.76452941 Z"
                  />
                  <path 
                    fill="#34A853" 
                    d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.5,15.9318182 C3.30095093,20.2824545 7.30629921,23.2727273 12,23.2727273 C15.4355,23.2727273 18.1660046,21.8595905 20.0126236,19.5699642 L16.3439644,17.0074196 C15.675591,17.4299901 14.8823307,17.8071406 16.0407269,18.0125889 Z"
                  />
                  <path 
                    fill="#4285F4" 
                    d="M19.834192,9.55636364 C19.9431211,10.0468182 20,10.54 20,11.0454545 C20,11.6772727 19.9286364,12.2881818 19.7945455,12.8727273 L19.7818182,12.9818182 L16.0407269,10.4318182 C15.8152439,9.55636364 15.4900003,8.82334355 15.0126236,8.18181818 L19.834192,9.55636364 Z"
                  />
                  <path 
                    fill="#FBBC05" 
                    d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.5,8.09090909 C0.815811142,9.27984637 0.408181818,10.6317308 0.408181818,12 C0.408181818,13.3682692 0.815811142,14.7201536 1.5,15.9318182 L5.27698177,14.2678769 Z"
                  />
                </svg>
                google
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 