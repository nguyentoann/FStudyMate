import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determine what dashboard to link to based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    const role = user.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'lecturer':
        return '/lecturer/dashboard';
      case 'student':
        return '/student/dashboard';
      case 'guest':
        return '/guest/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area requires different privileges.
          </p>
          
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-medium text-gray-700">Currently logged in as:</p>
              <div className="flex items-center mt-2">
                <img 
                  src={user.picture || 'https://via.placeholder.com/40'} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                    Role: {user.role || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate(getDashboardLink())} 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              Go to your dashboard
            </button>
            
            <Link 
              to="/" 
              className="block w-full py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md text-center"
            >
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 