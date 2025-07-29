import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  
  // The bypassProtection state might be passed from OAuthCallback
  const bypassProtection = location.state?.bypassProtection;

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('Dashboard component - User:', user);
    console.log('Dashboard component - User role:', user.role);
    console.log('Dashboard component - Bypass protection:', bypassProtection);
    
    // Don't auto-redirect if we're explicitly bypassing protection
    if (bypassProtection) {
      console.log('Dashboard - Bypassing automatic redirect');
      return;
    }

    // Delay redirect to specific dashboard by user role
    const timer = setTimeout(() => {
      if (user.role) {
        setRedirecting(true);
        const role = user.role.toLowerCase();
        console.log(`Dashboard - Redirecting to role-specific dashboard for: ${role}`);
        
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'lecturer':
            navigate('/lecturer/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard', { replace: true }); // Use replace to avoid browser history issues
            break;
          case 'guest':
            navigate('/guest/dashboard');
            break;
          default:
            // Stay on generic dashboard
            console.log('Dashboard - Unknown role, staying on generic dashboard');
            break;
        }
      }
    }, 500); // Short delay to show this screen

    return () => clearTimeout(timer);
  }, [user, navigate, bypassProtection]);

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h1>
        <div className="mb-4">
          <img 
            src={user.picture || 'https://via.placeholder.com/150'} 
            alt="Profile" 
            className="w-20 h-20 rounded-full mx-auto mb-2"
          />
          <p className="text-gray-600 text-center">{user.email}</p>
        </div>
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">User Information</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">ID:</div>
            <div className="font-medium">{user.id}</div>
            
            <div className="text-gray-600">Role:</div>
            <div className="font-medium">{user.role || 'Not specified'}</div>
            
            <div className="text-gray-600">Auth Type:</div>
            <div className="font-medium">{user.authType || 'Standard'}</div>
          </div>
        </div>
        
        {redirecting ? (
          <p className="text-center text-sm text-gray-500">Redirecting to your dashboard...</p>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/student/dashboard', { replace: true })}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Go to Student Dashboard
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              View/Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 