import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';
import NotificationForm from '../components/NotificationForm';
import DashboardLayout from '../components/DashboardLayout';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'create'
  
  // Check if user can create notifications
  const canCreateNotifications = user && (user.role === 'admin' || user.role === 'lecturer');
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your notifications
          </p>
        </div>
        
        {/* Tabs */}
        {canCreateNotifications && (
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('view')}
                className={`${
                  activeTab === 'view'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                View Notifications
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`${
                  activeTab === 'create'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Create Notification
              </button>
            </nav>
          </div>
        )}
        
        {/* Content */}
        <div className="mt-6">
          {activeTab === 'view' && <NotificationCenter />}
          {activeTab === 'create' && canCreateNotifications && <NotificationForm />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage; 