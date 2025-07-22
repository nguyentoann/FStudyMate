import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/config';
import DeviceSelector from './DeviceControls/DeviceSelector';

const IRRemoteControl = ({ classId, roomId, userRole }) => {
  const { authToken } = useAuth();
  const [room, setRoom] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load room and device status on component mount
  useEffect(() => {
    if (roomId) {
      fetchRoomInfo();
      const intervalId = setInterval(() => {
        fetchDeviceStatus();
      }, 20000); // Refresh status every 20 seconds

      return () => clearInterval(intervalId);
    }
  }, [roomId]);

  const fetchRoomInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setRoom(response.data);
      fetchDeviceStatus();
    } catch (err) {
      console.error('Error fetching room information:', err);
      setError('Failed to load room information');
      setLoading(false);
    }
  };

  const fetchDeviceStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/ir-control/room/${roomId}/device-status`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setDeviceStatus(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching device status:', err);
      setDeviceStatus({ online: false });
      setLoading(false);
    }
  };

  if (loading && !room && !deviceStatus) {
    return <div className="p-4">Loading IR remote controls...</div>;
  }

  if (!room) {
    return <div className="p-4 text-red-500">Error: Room information not found</div>;
  }

  if (!deviceStatus) {
    return <div className="p-4">Loading device status...</div>;
  }

  if (!deviceStatus.online) {
    return (
      <div className="p-4">
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
          <p className="font-bold">Device Offline</p>
          <p>The IR device for this room is currently offline. Please check the device connection.</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-bold">Room: {room.name}</h2>
          <p>Device ID: {room.deviceId}</p>
        </div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
          onClick={fetchDeviceStatus}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="ir-remote-container">
      <div className="device-status-indicator mb-4">
        <div className={`status-dot ${deviceStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="ml-2 text-sm">
          {deviceStatus.online ? 'Device Online' : 'Device Offline'}
        </span>
      </div>
      
      <DeviceSelector roomId={roomId} userRole={userRole} />
    </div>
  );
};

export default IRRemoteControl; 