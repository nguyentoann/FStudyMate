import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import IRRemoteControl from './IRRemoteControl';
import { toast } from 'react-toastify';
import { API_URL } from '../services/config';

const ClassroomControls = ({ classId }) => {
  const { authToken, user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(false);
  
  useEffect(() => {
    if (!user || user.role !== 'LECTURER') {
      setError('Only lecturers can access classroom controls');
      setLoading(false);
      return;
    }
    
    fetchSchedules();
  }, [user, classId]);
  
  const fetchSchedules = async () => {
    if (!classId || !user?.id) return;
    
    try {
      setLoading(true);
      
      // Get current date and time
      const now = new Date();
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Convert to 1-7 format (Monday-Sunday)
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
      
      // Get all class schedules for this class and lecturer
      const response = await axios.get(`${API_URL}/schedule/class/${classId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      setSchedules(response.data);
      
      // Find current schedule based on day and time
      const currentSchedule = response.data.find(schedule => {
        if (schedule.dayOfWeek !== dayOfWeek) return false;
        
        const startMinutes = schedule.startTime.hour * 60 + schedule.startTime.minute;
        const endMinutes = schedule.endTime.hour * 60 + schedule.endTime.minute;
        
        // Consider 15 minutes before class starts and 15 minutes after class ends
        return currentTime >= (startMinutes - 15) && currentTime <= (endMinutes + 15);
      });
      
      if (currentSchedule && currentSchedule.room) {
        setCurrentSchedule(currentSchedule);
        
        // Look up the room by name to get its IR control capabilities
        fetchRoomByName(currentSchedule.room);
      } else {
        setCurrentSchedule(null);
        setCurrentRoom(null);
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Error fetching class schedules:', err);
      setError('Failed to load class schedule information');
      setLoading(false);
    }
  };
  
  const fetchRoomByName = async (roomName) => {
    try {
      const response = await axios.get(`${API_URL}/rooms/name/${encodeURIComponent(roomName)}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      setCurrentRoom(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching room details:', err);
      
      // If room not found, create a default room object with no IR control
      setCurrentRoom({
        id: null,
        name: roomName,
        hasIrControl: false
      });
      
      setLoading(false);
    }
  };
  
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  if (loading) {
    return <div className="p-4">Loading classroom controls...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  if (!currentSchedule || !currentRoom) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-gray-50">
        <h2 className="text-xl font-bold mb-2">Classroom Controls</h2>
        <p>You are not currently in a scheduled class or the room does not support controls.</p>
      </div>
    );
  }
  
  if (!currentRoom.hasIrControl) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-gray-50">
        <h2 className="text-xl font-bold mb-2">Classroom Controls - {currentRoom.name}</h2>
        <p>This room does not have IR control capabilities.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg shadow-md bg-gray-50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Classroom Controls - {currentRoom.name}</h2>
        <button 
          onClick={toggleControls}
          className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>
      
      {showControls && (
        <div className="mt-4">
          <IRRemoteControl roomId={currentRoom.id} />
        </div>
      )}
    </div>
  );
};

export default ClassroomControls; 