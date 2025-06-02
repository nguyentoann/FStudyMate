import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL, EMERGENCY_URL } from '../services/config';

// Add API emergency URL
const API_EMERGENCY_URL = `${API_URL}/emergency`;

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30); // Timer for resending OTP
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false); // Track if verification is successful
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();
  const { darkMode } = useTheme();
  
  useEffect(() => {
    // Get email from location state or query params
    const params = new URLSearchParams(location.search);
    const emailFromState = location.state?.email;
    const emailFromParams = params.get('email');
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromParams) {
      setEmail(emailFromParams);
    } else {
      setError('Email not provided. Please go back to registration.');
    }
    
    // Start countdown timer
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [location, timer]);
  
  // Only redirect to login after successful verification and user confirmation
  useEffect(() => {
    let redirectTimeout;
    if (verified) {
      redirectTimeout = setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
    
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [verified, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!email) {
      setError('Email not provided. Please go back to registration.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Try all three endpoints in sequence
      let verificationSuccessful = false;
      let responseMessage = '';
      
      // 1. First try the regular API
      try {
        console.log('Trying regular API endpoint for verification');
        const apiResponse = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, otp }),
          credentials: 'omit'
        });
        
        const apiData = await apiResponse.json().catch(() => ({}));
        
        if (apiResponse.ok) {
          console.log('Regular API verification successful:', apiData);
          verificationSuccessful = true;
          responseMessage = apiData.message || 'Account verified successfully';
        } else {
          console.log('Regular API verification failed with status:', apiResponse.status, apiData);
        }
      } catch (apiError) {
        console.log('Error with regular verification API:', apiError);
      }
      
      // 2. If regular API failed, try API emergency endpoint
      if (!verificationSuccessful) {
        try {
          console.log('Trying API emergency endpoint for verification');
          const apiEmergencyResponse = await fetch(`${API_EMERGENCY_URL}/otp/verify`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp }),
            credentials: 'omit'
          });
          
          const apiEmergencyData = await apiEmergencyResponse.json().catch(() => ({}));
          
          if (apiEmergencyResponse.ok) {
            console.log('API emergency verification successful:', apiEmergencyData);
            verificationSuccessful = true;
            responseMessage = apiEmergencyData.message || 'Account verified successfully via API emergency endpoint';
          } else {
            console.log('API emergency verification failed with status:', apiEmergencyResponse.status, apiEmergencyData);
          }
        } catch (apiEmergencyError) {
          console.log('Error with API emergency verification:', apiEmergencyError);
        }
      }
      
      // 3. If both previous attempts failed, try direct emergency endpoint
      if (!verificationSuccessful) {
        try {
          console.log('Trying direct emergency endpoint for verification');
          const emergencyResponse = await fetch(`${EMERGENCY_URL}/verify-otp`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp }),
            credentials: 'omit'
          });
          
          const emergencyData = await emergencyResponse.json().catch(() => ({}));
          console.log('Emergency verification response:', emergencyData);
          
          if (emergencyResponse.ok || emergencyData.status === 'success') {
            const data = emergencyData || {};
            verificationSuccessful = true;
            responseMessage = data.message || 'Account verified successfully via emergency endpoint';
          } else {
            console.error('Emergency verification failed with status:', emergencyResponse.status, emergencyData);
          }
        } catch (emergencyError) {
          console.error('Error with emergency verification API:', emergencyError);
        }
      }
      
      // Handle result of verification attempts
      if (verificationSuccessful) {
        setSuccess(responseMessage);
        setVerified(true); // Set verified to true, which will trigger the redirect in useEffect
      } else {
        // All attempts failed
        setError('Invalid verification code. Please try again.');
        setOtp(''); // Clear the OTP input field
      }
    } catch (error) {
      // General error handling
      console.error('Verification error:', error);
      setError('Verification failed. Please check your code and try again.');
      setOtp(''); // Clear the OTP input field
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Try all three endpoints in sequence
      let resendSuccessful = false;
      let responseMessage = '';
      
      // 1. Try regular API first
      try {
        console.log('Trying regular API endpoint for OTP resend');
        const apiResponse = await fetch(`${API_URL}/auth/resend-otp`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email }),
          credentials: 'omit'
        });
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          console.log('Regular API OTP resend successful:', data);
          resendSuccessful = true;
          responseMessage = data.message || 'New verification code sent to your email';
        } else {
          console.log('Regular API OTP resend failed, trying API emergency endpoint');
        }
      } catch (apiError) {
        console.log('Error with regular API resend:', apiError);
      }
      
      // 2. If regular API failed, try API emergency endpoint
      if (!resendSuccessful) {
        try {
          console.log('Trying API emergency endpoint for OTP generation');
          const apiEmergencyResponse = await fetch(`${API_EMERGENCY_URL}/otp/generate`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            credentials: 'omit'
          });
          
          const apiEmergencyData = await apiEmergencyResponse.json().catch(() => ({}));
          
          if (apiEmergencyResponse.ok) {
            console.log('API emergency OTP generation successful:', apiEmergencyData);
            resendSuccessful = true;
            responseMessage = apiEmergencyData.message || 'New verification code sent via API emergency channel';
          } else {
            console.log('API emergency OTP generation failed, trying direct emergency endpoint');
          }
        } catch (apiEmergencyError) {
          console.log('Error with API emergency generation:', apiEmergencyError);
        }
      }
      
      // 3. If regular and API emergency endpoints failed, try direct emergency endpoint
      if (!resendSuccessful) {
        try {
          console.log('Trying direct emergency endpoint for OTP generation');
          const emergencyResponse = await fetch(`${EMERGENCY_URL}/generate-otp`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            credentials: 'omit'
          });
          
          const emergencyData = await emergencyResponse.json().catch(() => ({}));
          console.log('Emergency OTP generation response:', emergencyData);
          
          if (emergencyResponse.ok || emergencyData.status === 'success') {
            resendSuccessful = true;
            
            // If the emergency endpoint returned an OTP directly (for testing),
            // show it to the user for easier testing
            if (emergencyData.otp) {
              responseMessage = `New verification code sent via emergency channel. For testing purposes: ${emergencyData.otp}`;
            } else {
              responseMessage = emergencyData.message || 'New verification code sent via emergency channel';
            }
          } else {
            console.error('Emergency OTP generation failed with response:', emergencyData);
            // All APIs failed
            throw new Error('Failed to resend verification code. Please try again later.');
          }
        } catch (emergencyError) {
          console.error('Error with emergency OTP generation API:', emergencyError);
          throw new Error('Failed to resend verification code. Please try again later.');
        }
      }
      
      if (resendSuccessful) {
        setSuccess(responseMessage);
        
        // Reset timer
        setTimer(30);
        setCanResend(false);
      } else {
        throw new Error('Failed to resend verification code. Please try again later.');
      }
    } catch (error) {
      setError(error.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full space-y-8 ${darkMode ? 'bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700' : 'bg-white p-8 rounded-lg shadow-md'}`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Verify Your Account
          </h2>
          <p className={`mt-2 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We've sent a verification code to your email address. Please enter it below to verify your account.
          </p>
        </div>
        
        {error && (
          <div className={`rounded-md ${darkMode ? 'bg-red-900' : 'bg-red-50'} p-4`}>
            <div className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</div>
          </div>
        )}
        
        {success && (
          <div className={`rounded-md ${darkMode ? 'bg-green-900' : 'bg-green-50'} p-4`}>
            <div className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>{success}</div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                value={email}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="otp" className="sr-only">Verification Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-700 placeholder-gray-400 text-white' 
                    : 'border-gray-300 placeholder-gray-500 text-gray-900'
                } rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter 6-digit verification code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
            
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className={`group relative w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                !canResend || loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {canResend ? 'Resend Code' : `Resend Code (${timer}s)`}
            </button>
          </div>
          
          <div className="text-center">
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Already verified? <Link to="/login" className="font-medium text-indigo-500 hover:text-indigo-400" onClick={(e) => {
                // Only allow navigation if user confirms
                if (!verified && !window.confirm("Are you sure you want to go to login? Your verification process will be abandoned.")) {
                  e.preventDefault();
                }
              }}>Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp; 