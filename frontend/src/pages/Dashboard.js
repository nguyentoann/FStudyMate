import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Delay redirect to specific dashboard by user role
    const timer = setTimeout(() => {
      if (user.role) {
        const role = user.role.toLowerCase();
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
          default:
            // Stay on generic dashboard
            break;
        }
      }
    }, 1500); // Short delay to show this screen

    return () => clearTimeout(timer);
  }, [user, navigate]);

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
        <p className="mb-4">You are logged in as a {user.role || 'User'}</p>
        <p className="text-center text-sm text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard; 