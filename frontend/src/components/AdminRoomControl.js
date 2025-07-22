import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import IRRemoteControl from './IRRemoteControl';
import { toast } from 'react-toastify';
import { API_URL } from '../services/config';

const AdminRoomControl = () => {
  const { authToken, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'lecturer')) {
      setError('Only admins and lecturers can access this control panel');
      setLoading(false);
      return;
    }
    
    fetchRooms();
  }, [user]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      // Filter rooms that have IR control capability
      const irRooms = response.data.filter(room => room.hasIrControl);
      setRooms(irRooms);
      
      if (irRooms.length > 0) {
        setSelectedRoom(irRooms[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
      setLoading(false);
      toast.error('Failed to load rooms with IR control');
    }
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(parseInt(e.target.value));
  };

  if (loading) {
    return <div className="p-4">Loading room controls...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-gray-50">
        <h2 className="text-xl font-bold mb-2">IR Remote Control</h2>
        <p className="text-yellow-600">No rooms with IR control capability have been set up. Please add rooms with IR control in the Room Management section.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-gray-50">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Select Room:</label>
        <select 
          value={selectedRoom || ''} 
          onChange={handleRoomChange}
          className="w-full md:w-1/3 px-3 py-2 border rounded-md"
        >
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name} {room.location ? `(${room.location})` : ''}
            </option>
          ))}
        </select>
      </div>
      
      {selectedRoom && (
        <div className="mt-4">
          <IRRemoteControl roomId={selectedRoom} userRole={user?.role} />
        </div>
      )}
    </div>
  );
};

export default AdminRoomControl; 