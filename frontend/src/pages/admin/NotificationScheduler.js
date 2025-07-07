import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ScheduleNotification from '../../components/ScheduleNotification';
import DashboardLayout from '../../components/DashboardLayout';

const NotificationScheduler = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.id) {
    return (
      <DashboardLayout>
        <div className="container mt-4">
          <div className="alert alert-warning">
            Please log in to access the notification scheduler.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <h2 className="mb-4">Notification Scheduler</h2>
            <p className="text-muted mb-4">
              Use this page to schedule future notifications for users. 
              Notifications will be delivered automatically at the specified date and time.
            </p>
            
            <ScheduleNotification />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationScheduler; 