import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { API_URL } from '../../services/config';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Device item component for drag and drop
const DeviceItem = ({ device, isDraggable = true }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'device',
    item: { deviceId: device.deviceId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isDraggable,
  }));

  return (
    <div
      ref={drag}
      className={`device-item px-2 py-1 rounded border ${isDragging ? 'opacity-50' : 'opacity-100'} 
      ${device.online ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'} 
      ${isDraggable ? 'cursor-move' : 'cursor-default'}`}
      style={{ width: 'fit-content' }}
    >
      <span className="whitespace-nowrap">
        {device.deviceId}
        <span className={`ml-1 inline-block w-2 h-2 rounded-full ${device.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
      </span>
    </div>
  );
};

// Room card component with drop target for devices
const RoomCard = ({ room, onEdit, onDelete, onAssignDevice, onRemoveDevice, availableDevices, gradientClass }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'device',
    drop: (item) => onAssignDevice(room.id, item.deviceId),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    // All rooms can now accept devices
  }));

  // Generate a unique gradient class if not provided
  const cardGradient = gradientClass || 'bg-gradient-to-br from-blue-50 to-indigo-100';

  return (
    <div 
      ref={drop}
      className={`room-card relative p-4 rounded-lg shadow-md transition-all 
      ${isOver ? 'ring-2 ring-indigo-400 shadow-lg scale-105' : ''} 
      ${cardGradient}`}
    >
      <div className="absolute top-2 right-2 flex space-x-1">
        <button
          onClick={() => onEdit(room)}
          className="p-1 text-blue-600 hover:text-blue-800"
          title="Edit Room"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(room.id)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete Room"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <h3 className="font-bold text-lg mb-1">{room.name}</h3>
      <p className="text-sm text-gray-600 mb-1">Capacity: {room.capacity || '-'}</p>
      
      <div className="flex flex-col space-y-1 mt-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">IR Control:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${room.hasIrControl ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {room.hasIrControl ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-medium">Device:</span>
          <div className="flex items-center space-x-1">
            {room.deviceId ? (
              <>
                <DeviceItem 
                  device={{ 
                    deviceId: room.deviceId, 
                    online: availableDevices.some(d => d.deviceId === room.deviceId && d.online) 
                  }} 
                  isDraggable={room.hasIrControl}
                />
                {room.hasIrControl && (
                  <button
                    onClick={() => onRemoveDevice(room.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Device"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">
                {isOver ? 'Drop to assign & enable IR' : 'Drop device here'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Show visual hint when hovering a device over a non-IR control room */}
      {isOver && !room.hasIrControl && (
        <div className="absolute inset-0 bg-green-100 bg-opacity-30 flex items-center justify-center rounded-lg">
          <div className="bg-white p-2 rounded shadow text-sm font-medium text-green-600">
            Will enable IR control
          </div>
        </div>
      )}
    </div>
  );
};

const RoomManagement = () => {
  const { authToken, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [groupedRooms, setGroupedRooms] = useState({});
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [filteredGroupedRooms, setFilteredGroupedRooms] = useState({});

  // Form states
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    floor: '',
    capacity: '',
    hasIrControl: false,
    deviceId: '',
  });

  // Gradient colors for room cards
  const gradientClasses = [
    'bg-gradient-to-br from-blue-50 to-indigo-100',
    'bg-gradient-to-br from-green-50 to-emerald-100',
    'bg-gradient-to-br from-purple-50 to-violet-100',
    'bg-gradient-to-br from-yellow-50 to-amber-100',
    'bg-gradient-to-br from-red-50 to-rose-100',
    'bg-gradient-to-br from-pink-50 to-fuchsia-100',
    'bg-gradient-to-br from-indigo-50 to-blue-100',
    'bg-gradient-to-br from-emerald-50 to-green-100',
  ];

  // Function to get gradient class based on location name
  const getGradientClass = (locationName) => {
    // Use a hash function to consistently assign the same gradient to the same location
    const hash = locationName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return gradientClasses[Math.abs(hash) % gradientClasses.length];
  };

  useEffect(() => {
    fetchRooms();
    fetchDevices();
  }, []);

  useEffect(() => {
    // Group rooms by location and then by floor
    if (rooms && rooms.length > 0) {
      const grouped = rooms.reduce((acc, room) => {
        const location = room.location || 'No Location';
        const floor = room.floor || 'No Floor';
        
        if (!acc[location]) {
          acc[location] = {};
        }
        
        if (!acc[location][floor]) {
          acc[location][floor] = [];
        }
        
        acc[location][floor].push(room);
        return acc;
      }, {});
      
      // Sort locations alphabetically
      const sortedGrouped = {};
      Object.keys(grouped).sort().forEach(locationKey => {
        sortedGrouped[locationKey] = {};
        
        // Sort floors
        const floors = Object.keys(grouped[locationKey]).sort((a, b) => {
          // Try to compare as numbers if possible
          const numA = parseInt(a);
          const numB = parseInt(b);
          
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          
          // Fall back to string comparison
          return a.localeCompare(b);
        });
        
        floors.forEach(floorKey => {
          sortedGrouped[locationKey][floorKey] = grouped[locationKey][floorKey];
        });
      });
      
      setGroupedRooms(sortedGrouped);
    } else {
      setGroupedRooms({});
    }
  }, [rooms]);

  // Filter rooms based on search query and field
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGroupedRooms(groupedRooms);
      return;
    }

    const filtered = {};
    const query = searchQuery.toLowerCase();

    Object.entries(groupedRooms).forEach(([location, floors]) => {
      const filteredFloors = {};

      Object.entries(floors).forEach(([floor, roomsList]) => {
        const filteredRooms = roomsList.filter(room => {
          if (searchField === 'name' || searchField === 'all') {
            if (room.name.toLowerCase().includes(query)) return true;
          }
          if (searchField === 'deviceId' || searchField === 'all') {
            if (room.deviceId && room.deviceId.toLowerCase().includes(query)) return true;
          }
          if (searchField === 'floor' || searchField === 'all') {
            if (room.floor && room.floor.toLowerCase().includes(query)) return true;
          }
          return false;
        });

        if (filteredRooms.length > 0) {
          filteredFloors[floor] = filteredRooms;
        }
      });

      if (Object.keys(filteredFloors).length > 0) {
        filtered[location] = filteredFloors;
      }
    });

    setFilteredGroupedRooms(filtered);
  }, [groupedRooms, searchQuery, searchField]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setRooms(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
      setLoading(false);
      toast.error('Failed to load rooms');
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_URL}/ir-control/devices`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setDevices(response.data);
    } catch (err) {
      console.error('Error fetching devices:', err);
      toast.error('Failed to load IR devices');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      floor: '',
      capacity: '',
      hasIrControl: false,
      deviceId: '',
    });
    setFormMode('add');
    setSelectedRoom(null);
    setIsModalOpen(false);
  };

  const selectRoomForEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      location: room.location || '',
      floor: room.floor || '',
      capacity: room.capacity || '',
      hasIrControl: room.hasIrControl || false,
      deviceId: room.deviceId || '',
    });
    setFormMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create a room object from form data
      const roomData = {
        name: formData.name,
        location: formData.location,
        floor: formData.floor,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        hasIrControl: formData.hasIrControl,
        deviceId: formData.deviceId || null,
      };

      let response;
      if (formMode === 'add') {
        response = await axios.post(`${API_URL}/rooms`, roomData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        toast.success('Room created successfully');
      } else {
        response = await axios.put(`${API_URL}/rooms/${selectedRoom.id}`, roomData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        toast.success('Room updated successfully');
      }

      resetForm();
      fetchRooms();
    } catch (err) {
      console.error('Error saving room:', err);
      toast.error(err.response?.data?.message || 'Failed to save room');
      setLoading(false);
    }
  };

  // Add a function to find the current room for a device directly from the backend
  const getCurrentDeviceRoom = async (deviceId) => {
    try {
      // Get all rooms to make sure we have the latest state
      const response = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      const currentRooms = response.data;
      return currentRooms.find(room => room.deviceId === deviceId);
    } catch (err) {
      console.error('Error getting current device room:', err);
      return null;
    }
  };

  // Update the handleAssignDevice function to handle already assigned devices
  const handleAssignDevice = async (roomId, deviceId) => {
    try {
      setLoading(true);
      
      // Get fresh data from backend to avoid stale state issues
      const targetRoom = await axios.get(`${API_URL}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }).then(res => res.data);
      
      if (!targetRoom) {
        toast.error('Target room not found');
        setLoading(false);
        return;
      }
      
      // Get the current room assignment directly from the backend
      const currentRoom = await getCurrentDeviceRoom(deviceId);
      
      // If device is already assigned to another room, remove it first
      if (currentRoom && currentRoom.id !== targetRoom.id) {
        console.log(`Device ${deviceId} is currently assigned to room ${currentRoom.name} (ID: ${currentRoom.id}). Removing...`);
        
        try {
          await axios.put(`${API_URL}/rooms/${currentRoom.id}/remove-device`, {}, {
            headers: { 
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });
          toast.info(`Device unlinked from ${currentRoom.name}`);
          
          // Wait a moment to ensure the backend has processed the remove request
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (removeErr) {
          console.error('Error removing device from current room:', removeErr);
          toast.error(`Failed to unlink device: ${removeErr.response?.data || removeErr.message}`);
          setLoading(false);
          return;
        }
      }
      
      // Enable IR control if needed
      if (!targetRoom.hasIrControl) {
        try {
          await axios.put(`${API_URL}/rooms/${roomId}`, 
            { ...targetRoom, hasIrControl: true },
            {
              headers: { 
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          toast.info(`IR control enabled for ${targetRoom.name}`);
        } catch (irErr) {
          console.error('Error enabling IR control:', irErr);
          toast.error(`Failed to enable IR control: ${irErr.response?.data || irErr.message}`);
          setLoading(false);
          return;
        }
      }
      
      // Now assign the device to the new room
      try {
        await axios.put(`${API_URL}/rooms/${roomId}/assign-device/${deviceId}`, {}, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json', 
          },
        });
        toast.success(`Device assigned to ${targetRoom.name}`);
      } catch (assignErr) {
        console.error('Error assigning device to new room:', assignErr);
        toast.error(`Failed to assign device: ${assignErr.response?.data || assignErr.message}`);
        setLoading(false);
        return;
      }
      
      // Finally, refresh the rooms data
      await fetchRooms();
      setLoading(false);
    } catch (err) {
      console.error('Error in device assignment process:', err);
      toast.error(`Assignment process failed: ${err.response?.data || err.message}`);
      setLoading(false);
    }
  };

  // Update the handleRemoveDevice function with correct endpoint
  const handleRemoveDevice = async (roomId) => {
    try {
      setLoading(true);
      // Use the correct endpoint for removing a device
      await axios.put(`${API_URL}/rooms/${roomId}/remove-device`, {}, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Device removed successfully');
      fetchRooms();
    } catch (err) {
      console.error('Error removing device:', err);
      toast.error('Failed to remove device');
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        toast.success('Room deleted successfully');
        fetchRooms();
      } catch (err) {
        console.error('Error deleting room:', err);
        toast.error('Failed to delete room');
        setLoading(false);
      }
    }
  };

  // Get unassigned devices
  const getUnassignedDevices = () => {
    const assignedDeviceIds = rooms
      .filter(room => room.deviceId)
      .map(room => room.deviceId);
    
    return devices.filter(device => !assignedDeviceIds.includes(device.deviceId));
  };

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Room Management</h1>

          {/* Add Room Button */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <button
              onClick={() => {
                resetForm();
                setFormMode('add');
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add New Room
            </button>

            {/* Search Box */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="py-2 px-3 border rounded-md"
              >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="floor">Floor</option>
                <option value="deviceId">Device ID</option>
              </select>
              <div className="relative flex-grow md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-full py-2 px-3 pr-10 border rounded-md"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Room Modal Form */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={resetForm}
            title={formMode === 'add' ? 'Add New Room' : 'Edit Room'}
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Room Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Floor</label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g. 1, 2, B1, G"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="hasIrControl"
                    checked={formData.hasIrControl}
                    onChange={handleInputChange}
                    id="hasIrControl"
                    className="mr-2"
                  />
                  <label htmlFor="hasIrControl" className="text-gray-700">
                    Has IR Control
                  </label>
                </div>
                
                {formData.hasIrControl && (
                  <div>
                    <label className="block text-gray-700 mb-2">IR Device ID</label>
                    <select
                      name="deviceId"
                      value={formData.deviceId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select a device</option>
                      {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.deviceId} - {device.online ? 'Online' : 'Offline'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {formMode === 'add' ? 'Add Room' : 'Update Room'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>

          {/* Available Devices Section */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-3">Available Devices</h2>
            <p className="text-sm text-gray-600 mb-2">Drag and drop to assign devices to rooms</p>
            <div className="flex flex-wrap gap-2">
              {getUnassignedDevices().length > 0 ? (
                getUnassignedDevices().map(device => (
                  <DeviceItem key={device.deviceId} device={device} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No available devices</p>
              )}
            </div>
          </div>

          {/* Rooms List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Rooms</h2>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {loading && <div className="text-center py-4">Loading rooms...</div>}
            
            {!loading && rooms.length === 0 && (
              <div className="text-center py-4">No rooms found</div>
            )}
            
            {Object.keys(filteredGroupedRooms).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(filteredGroupedRooms).map(([location, floors]) => {
                  const locationGradient = getGradientClass(location);
                  
                  return (
                    <div key={location} className="location-group mb-8">
                      <h3 className="text-xl font-medium text-gray-800 mb-3 pb-2 border-b flex items-center">
                        <span className={`w-4 h-4 rounded mr-2 ${locationGradient}`}></span>
                        {location}
                      </h3>
                      
                      {Object.entries(floors).map(([floor, floorRooms]) => (
                        <div key={`${location}-${floor}`} className="floor-group mb-6">
                          <h4 className="text-lg font-medium text-gray-700 mb-3 pl-2 border-l-4 border-indigo-500">
                            Floor: {floor}
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {floorRooms.map((room) => (
                              <RoomCard
                                key={room.id}
                                room={room}
                                onEdit={selectRoomForEdit}
                                onDelete={handleDeleteRoom}
                                onAssignDevice={handleAssignDevice}
                                onRemoveDevice={handleRemoveDevice}
                                availableDevices={devices}
                                gradientClass={`${locationGradient} bg-opacity-50`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              searchQuery ? (
                <div className="text-center py-4">No rooms match your search</div>
              ) : (
                <div className="text-center py-4">No rooms available</div>
              )
            )}
          </div>
        </div>
      </DndProvider>
    </DashboardLayout>
  );
};

export default RoomManagement; 