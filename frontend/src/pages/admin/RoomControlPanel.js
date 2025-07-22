import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AdminRoomControl from '../../components/AdminRoomControl';
import { useAuth } from '../../context/AuthContext';

const RoomControlPanel = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Room Control Panel</h1>
        <p className="text-gray-600 mb-6">
          Use this panel to control IR devices in {isAdmin ? 'any room' : 'classrooms'} equipped with IR control capability.
        </p>
        
        <AdminRoomControl />
      </div>
    </DashboardLayout>
  );
};

export default RoomControlPanel; 