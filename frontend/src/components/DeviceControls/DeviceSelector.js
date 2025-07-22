import React, { useState, useEffect } from 'react';
import AirConditioner from './AirConditioner';
import Television from './Television';
import OtherDevice from './OtherDevice';
import CustomCommand from './CustomCommand';
import AddDevice from './AddDevice';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
import './DeviceStyles.css';

const DeviceSelector = ({ roomId, userRole }) => {
  const { authToken, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('ac');
  const [deviceCommands, setDeviceCommands] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is admin
  const isAdmin = userRole === 'admin' || (user && user.role === 'admin');
  const role = userRole || (user && user.role);
  
  useEffect(() => {
    fetchDeviceCommands();
  }, [roomId]);
  
  const fetchDeviceCommands = async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ir-control/room/${roomId}/commands`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.data && response.data.commands) {
        setDeviceCommands(response.data.commands);
        
        // Auto-select first available device type
        const availableDevices = Object.keys(response.data.commands);
        if (availableDevices.length > 0) {
          setSelectedTab(availableDevices[0].toLowerCase());
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching IR commands:', err);
      setError('Failed to load IR commands');
      setLoading(false);
    }
  };
  
  const sendCommand = async (command) => {
    try {
      // Find command in database if it exists
      let commandToSend = command;
      let endpoint = `${API_URL}/ir-control/room/${roomId}/command`;
      
      // Add brand information to the command payload
      if (!commandToSend.brand && selectedTab === 'tv') {
        commandToSend = {
          ...commandToSend,
          brand: 'TCL' // Default to TCL for the TV tab
        };
      }
      
      // Check if we should use the command ID endpoint directly
      // This is used by the OtherDevice component
      if (command.useCommandId && command.id) {
        endpoint = `${API_URL}/ir-control/room/${roomId}/command/${command.id}`;
        commandToSend = {}; // Empty body since the ID is in URL
        console.log(`Using command ID endpoint for command ${command.id}: ${endpoint}`);
      }
      // If this is a standard command that exists in our database, use its ID
      else if (command.type && deviceCommands[selectedTab.toUpperCase()]) {
        const brandKeys = Object.keys(deviceCommands[selectedTab.toUpperCase()]);
        
        // Look for matching command in all brands of this device type
        for (const brand of brandKeys) {
          const commands = deviceCommands[selectedTab.toUpperCase()][brand];
          const matchingCommand = commands.find(cmd => {
            // Match by type + value (for temperature/fan speed/etc)
            if (command.type === 'temperature' && cmd.acTemperature === command.value) {
              return true;
            }
            
            if (command.type === 'mode' && cmd.acMode === command.value) {
              return true;
            }
            
            if (command.type === 'power') {
              return cmd.name.toLowerCase().includes(command.value);
            }
            
            return false;
          });
          
          if (matchingCommand) {
            // Use the command ID to call the endpoint directly
            endpoint = `${API_URL}/ir-control/room/${roomId}/command/${matchingCommand.id}`;
            commandToSend = {}; // Empty body since the ID is in URL
            break;
          }
        }
      }
      
      await axios.post(endpoint, commandToSend, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Success notification could be added here
      
    } catch (err) {
      console.error('Error sending IR command:', err);
      setError(`Failed to send command: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };
  
  const renderDeviceControl = () => {
    if (selectedTab === 'ac') {
      return (
        <AirConditioner
          brand="Daikin"
          model="FTXM-N"
          initialPower={false}
          onSendCommand={sendCommand}
        />
      );
    }
    
    if (selectedTab === 'tv') {
      return (
        <Television
          brand="TCL"
          model="55P615"
          initialPower={false}
          onSendCommand={sendCommand}
        />
      );
    }
    
    if (selectedTab === 'other') {
      return <OtherDevice roomId={roomId} onSendCommand={sendCommand} />;
    }
    
    if (selectedTab === 'custom' && isAdmin) {
      return <CustomCommand roomId={roomId} onSendCommand={sendCommand} />;
    }
    
    if (selectedTab === 'add-device' && isAdmin) {
      return <AddDevice roomId={roomId} onDeviceAdded={fetchDeviceCommands} />;
    }
    
    return <div className="p-4">Select a device type to control</div>;
  };
  
  if (loading) {
    return <div className="p-4">Loading device controls...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  if (!deviceCommands || Object.keys(deviceCommands).length === 0) {
    return (
      <div className="p-4">
        <p>No device commands available for this room.</p>
        {isAdmin && (
          <button 
            className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={fetchDeviceCommands}
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  // Filter tabs based on user role
  const renderTabs = () => {
    return (
      <div className="device-selector-tabs mb-4 flex flex-wrap">
        {/* Always show AC and TV tabs for all users */}
        {Object.keys(deviceCommands)
          .filter(deviceType => {
            if (deviceType === 'AC') return true;
            if (deviceType === 'TV') {
              return Object.keys(deviceCommands[deviceType]).includes('TCL');
            }
            return false;
          })
          .map(deviceType => (
            <button
              key={deviceType}
              className={`device-tab ${selectedTab === deviceType.toLowerCase() ? 'active' : ''}`}
              onClick={() => setSelectedTab(deviceType.toLowerCase())}
            >
              {deviceType === 'AC' ? '❄️ Air Conditioner' :
               deviceType === 'TV' ? '📺 Television' : deviceType}
            </button>
          ))
        }
        
        {/* Other devices tab - only for admins */}
        {isAdmin && (
          <button
            className={`device-tab ${selectedTab === 'other' ? 'active' : ''}`}
            onClick={() => setSelectedTab('other')}
          >
            🔌 Other Devices
          </button>
        )}
        
        {/* Admin-only tabs */}
        {isAdmin && (
          <>
            <button
              className={`device-tab ${selectedTab === 'custom' ? 'active' : ''}`}
              onClick={() => setSelectedTab('custom')}
            >
              ⚙️ Custom Command
            </button>
            
            <button
              className={`device-tab ${selectedTab === 'add-device' ? 'active' : ''}`}
              onClick={() => setSelectedTab('add-device')}
            >
              ➕ Add Device
            </button>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="device-selector">
      {renderTabs()}
      
      <div className="device-controls-wrapper">
        {renderDeviceControl()}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default DeviceSelector; 