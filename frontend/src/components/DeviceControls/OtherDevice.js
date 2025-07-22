import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
import './DeviceStyles.css';

const OtherDevice = ({ roomId, onSendCommand }) => {
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [commands, setCommands] = useState([]);
  
  // Fetch available device types and commands
  useEffect(() => {
    fetchCommands();
  }, [roomId]);
  
  const fetchCommands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ir-control/room/${roomId}/commands`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.data && response.data.commands) {
        // Only filter out AC which has a dedicated tab
        // Keep TV and all other devices (include Samsung TVs, etc.)
        const otherDevices = { ...response.data.commands };
        
        // Only remove AC as it has its own dedicated tab
        if (otherDevices.AC) delete otherDevices.AC;
        
        // Keep TV brands - we want them in the Other Devices tab now
        // Special case for multiple TVs - separate them by brand in the dropdown
        if (otherDevices.TV) {
          const tvBrands = Object.keys(otherDevices.TV);
          
          // If there's only the main TV brand (TCL), let's keep it in its tab
          // and don't show it in Other Devices
          if (tvBrands.length === 1 && tvBrands[0] === 'TCL') {
            // Remove the main TV brand that has a dedicated tab
            delete otherDevices.TV;
          } else if (tvBrands.length > 0) {
            // Multiple TV brands - keep them all here in Other Devices
            console.log(`Found ${tvBrands.length} TV brands`);
          }
        }
        
        setDeviceTypes(otherDevices);
        
        // Auto-select first device type if available
        const deviceTypeKeys = Object.keys(otherDevices);
        if (deviceTypeKeys.length > 0) {
          const firstType = deviceTypeKeys[0];
          setSelectedType(firstType);
          
          // Auto-select first brand
          const brands = Object.keys(otherDevices[firstType]);
          if (brands.length > 0) {
            setSelectedBrand(brands[0]);
            // Set commands for this brand
            setCommands(otherDevices[firstType][brands[0]]);
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching IR commands:', err);
      setError('Failed to load device commands');
      setLoading(false);
    }
  };
  
  const handleDeviceTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    
    // Reset brand and commands
    const brands = Object.keys(deviceTypes[type]);
    if (brands.length > 0) {
      setSelectedBrand(brands[0]);
      setCommands(deviceTypes[type][brands[0]]);
    } else {
      setSelectedBrand(null);
      setCommands([]);
    }
  };
  
  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    
    // Update commands for this brand
    setCommands(deviceTypes[selectedType][brand]);
  };
  
  const handleSendCommand = (commandId) => {
    // Find the command by ID
    const command = commands.find(cmd => cmd.id === commandId);
    
    if (command) {
      // Instead of trying to send a partial command object,
      // tell the DeviceSelector to use the command ID endpoint directly
      onSendCommand({
        id: command.id,
        useCommandId: true,  // Signal to use the ID-based endpoint
        description: command.description || command.name,
        // Include these required fields in case they're needed
        type: command.type || 'command',
        value: command.name
      });
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading device controls...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  
  if (Object.keys(deviceTypes).length === 0) {
    return (
      <div className="p-4 text-center text-yellow-600">
        No other device types available. Add devices in the admin panel.
      </div>
    );
  }
  
  // Group commands by category
  const groupedCommands = {};
  if (commands.length > 0) {
    commands.forEach(cmd => {
      const category = cmd.category || 'Other';
      if (!groupedCommands[category]) {
        groupedCommands[category] = [];
      }
      groupedCommands[category].push(cmd);
    });
  }
  
  return (
    <div className="other-device-control">
      <div className="device-selector-filters">
        <div className="form-group">
          <label htmlFor="deviceTypeSelect">Device Type</label>
          <select
            id="deviceTypeSelect"
            value={selectedType || ''}
            onChange={handleDeviceTypeChange}
            className="form-select"
          >
            <option value="" disabled>Select a device type</option>
            {Object.keys(deviceTypes).map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="brandSelect">Brand</label>
          <select
            id="brandSelect"
            value={selectedBrand || ''}
            onChange={handleBrandChange}
            className="form-select"
            disabled={!selectedType}
          >
            <option value="" disabled>Select a brand</option>
            {selectedType && 
              Object.keys(deviceTypes[selectedType]).map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))
            }
          </select>
        </div>
      </div>
      
      <div className="other-device-commands">
        {selectedType && selectedBrand ? (
          Object.keys(groupedCommands).length > 0 ? (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="command-category">
                <h3 className="category-title">{category}</h3>
                <div className="command-buttons">
                  {categoryCommands.map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSendCommand(cmd.id)}
                      className="other-device-btn"
                    >
                      {cmd.name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-yellow-600">
              No commands available for this device and brand.
            </p>
          )
        ) : (
          <p className="text-center">Please select a device type and brand above.</p>
        )}
      </div>
    </div>
  );
};

export default OtherDevice; 