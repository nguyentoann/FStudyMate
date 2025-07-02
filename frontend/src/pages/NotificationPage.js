import React from 'react';
import NotificationCenter from '../components/NotificationCenter';
import DashboardLayout from '../components/DashboardLayout';

const NotificationPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <NotificationCenter />
      </div>
    </DashboardLayout>
  );
};

export default NotificationPage; 