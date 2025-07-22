import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
import './DeviceStyles.css';

const AddDevice = ({ roomId, onDeviceAdded }) => {
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [newCommand, setNewCommand] = useState({
    name: '',
    deviceType: '',
    brand: '',
    commandType: 'raw',
    commandData: '',
    description: '',
    category: '',
    acMode: '',
    acTemperature: '',
    acFanSpeed: '',
    tvInput: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCommand(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCommand.name || !newCommand.deviceType || !newCommand.brand || !newCommand.commandData || !newCommand.category) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare command data
      const commandData = {
        name: newCommand.name,
        deviceType: newCommand.deviceType.toUpperCase(),
        brand: newCommand.brand,
        commandType: newCommand.commandType,
        commandData: newCommand.commandData,
        description: newCommand.description || newCommand.name,
        category: newCommand.category
      };
      
      // Add optional fields if they are provided
      if (newCommand.acMode) commandData.acMode = newCommand.acMode;
      if (newCommand.acTemperature) commandData.acTemperature = parseInt(newCommand.acTemperature);
      if (newCommand.acFanSpeed) commandData.acFanSpeed = newCommand.acFanSpeed;
      if (newCommand.tvInput) commandData.tvInput = newCommand.tvInput;
      
      // Send to API
      await axios.post(
        `${API_URL}/ir-commands`,
        commandData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Show success message
      setSuccess('Command added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Reset form
      setNewCommand({
        name: '',
        deviceType: '',
        brand: '',
        commandType: 'raw',
        commandData: '',
        description: '',
        category: '',
        acMode: '',
        acTemperature: '',
        acFanSpeed: '',
        tvInput: ''
      });
      
      // Refresh devices in parent component
      if (onDeviceAdded) {
        onDeviceAdded();
      }
      
    } catch (err) {
      console.error('Error adding command:', err);
      setError(`Failed to add command: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-device-container">
      <h3 className="section-title">Add New IR Command</h3>
      
      <form onSubmit={handleSubmit} className="add-device-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deviceType">
              Device Type <span className="required">*</span>
            </label>
            <input
              type="text"
              id="deviceType"
              name="deviceType"
              value={newCommand.deviceType}
              onChange={handleChange}
              className="form-input"
              placeholder="AC, TV, DVD, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="brand">
              Brand <span className="required">*</span>
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={newCommand.brand}
              onChange={handleChange}
              className="form-input"
              placeholder="Samsung, Daikin, Sony, etc."
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="name">
            Command Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newCommand.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Power On, Volume Up, etc."
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="commandType">
              Command Type <span className="required">*</span>
            </label>
            <select
              id="commandType"
              name="commandType"
              value={newCommand.commandType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="raw">Raw</option>
              <option value="nec">NEC</option>
              <option value="samsung">Samsung</option>
              <option value="rc5">RC5</option>
              <option value="rc6">RC6</option>
              <option value="jvc">JVC</option>
              <option value="sony">Sony</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={newCommand.category}
              onChange={handleChange}
              className="form-input"
              placeholder="Power, Volume, Temperature, etc."
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="commandData">
            Command Data <span className="required">*</span>
          </label>
          <textarea
            id="commandData"
            name="commandData"
            value={newCommand.commandData}
            onChange={handleChange}
            className="form-textarea"
            rows="4"
            placeholder={newCommand.commandType === 'raw' ? '[9724,9776,...]' : '0xE0E040BF'}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={newCommand.description}
            onChange={handleChange}
            className="form-input"
            placeholder="What this command does"
          />
        </div>
        
        {/* Conditional fields based on device type */}
        {newCommand.deviceType.toUpperCase() === 'AC' && (
          <div className="device-specific-fields">
            <h4>AC Specific Fields</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="acMode">AC Mode</label>
                <select
                  id="acMode"
                  name="acMode"
                  value={newCommand.acMode}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Mode</option>
                  <option value="cool">Cool</option>
                  <option value="heat">Heat</option>
                  <option value="dry">Dry</option>
                  <option value="fan">Fan</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="acTemperature">Temperature</label>
                <input
                  type="number"
                  id="acTemperature"
                  name="acTemperature"
                  value={newCommand.acTemperature}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 24"
                  min="16"
                  max="30"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="acFanSpeed">Fan Speed</label>
                <select
                  id="acFanSpeed"
                  name="acFanSpeed"
                  value={newCommand.acFanSpeed}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Speed</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {newCommand.deviceType.toUpperCase() === 'TV' && (
          <div className="device-specific-fields">
            <h4>TV Specific Fields</h4>
            <div className="form-group">
              <label htmlFor="tvInput">Input Source</label>
              <select
                id="tvInput"
                name="tvInput"
                value={newCommand.tvInput}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Input</option>
                <option value="tv">Input</option>
                <option value="hdmi1">HDMI 1</option>
                <option value="hdmi2">HDMI 2</option>
                <option value="hdmi3">HDMI 3</option>
                <option value="av">AV</option>
                <option value="component">Component</option>
                <option value="usb">USB</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Command'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
    </div>
  );
};

export default AddDevice; 