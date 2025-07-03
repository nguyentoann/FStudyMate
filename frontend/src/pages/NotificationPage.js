import React from 'react';
import NotificationCenter from '../components/NotificationCenter';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationPage = () => {
  const { user } = useAuth();
  const canSendNotifications = user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'lecturer');

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          {canSendNotifications && (
            <Link 
              to="/notifications/send" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <i className="fas fa-paper-plane mr-2"></i> Send Notifications
            </Link>
          )}
        </div>
        <NotificationCenter />
      </div>
    </DashboardLayout>
  );
};

export default NotificationPage; 