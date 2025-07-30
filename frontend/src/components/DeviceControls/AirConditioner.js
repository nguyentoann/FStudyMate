import React, { useState, useEffect } from 'react';
import './DeviceStyles.css';

const AirConditioner = ({ 
  brand = "DAIKIN", 
  model = "FCNQ30MV1", 
  initialTemp = 26, 
  initialMode = "cool",
  signalStrength = 3,
  onSendCommand = () => {} 
}) => {
  const [temperature, setTemperature] = useState(initialTemp);
  const [mode, setMode] = useState(initialMode); // cool, heat, fan, dry
  const [power, setPower] = useState(true);
  const [fanSpeed, setFanSpeed] = useState(2); // 1-4
  
  // This function sends the complete state as one command
  const sendCompleteState = () => {
    onSendCommand({
      type: 'ac_complete',
      value: {
        power: power,
        mode: mode,
        temperature: temperature,
        fanSpeed: fanSpeed
      },
      description: `AC ${power ? 'On' : 'Off'}, Mode: ${mode}, Temp: ${temperature}°C, Fan: ${fanSpeed}`,
      brand: brand
    });
  };
  
  const handleTemperatureChange = (direction) => {
    let newTemp = temperature;
    if (direction === 'up' && temperature < 30) {
      newTemp = temperature + 1;
    } else if (direction === 'down' && temperature > 16) {
      newTemp = temperature - 1;
    }
    
    setTemperature(newTemp);
    // Instead of sending just the temperature change, send complete state
    setTimeout(() => {
      sendCompleteState();
    }, 100);
  };
  
  const handlePowerToggle = () => {
    const newPowerState = !power;
    setPower(newPowerState);
    
    // Send direct raw IR command for power on/off instead of using the complete state
    if (newPowerState) {
      // Power ON command
      onSendCommand({
        type: 'raw',
        value: '[9672, 9750, 9698, 9698, 4550, 2470, 364, 364, 364, 936, 364, 936, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 936, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 936, 364, 936, 364, 936, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 936, 364, 936, 364, 364, 364, 364, 364, 936, 364, 19942, 4576, 19942]',
        description: 'AC Power On'
      });
    } else {
      // Power OFF command
      onSendCommand({
        type: 'raw',
        value: '[9672, 9750, 9698, 9698, 4550, 2470, 364, 364, 364, 936, 364, 936, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 936, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 936, 364, 936, 364, 936, 364, 364, 364, 936, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 364, 936, 364, 936, 364, 936, 364, 364, 364, 364, 364, 936, 364, 19942, 4576, 19942]',
        description: 'AC Power Off'
      });
    }
    
    // Also update other components after a small delay to keep UI consistent
    setTimeout(() => {
      sendCompleteState();
    }, 300);
  };
  
  const handleFanSpeed = () => {
    // Ensure the fan speed cycles correctly: 1->2->3->4->1
    const newSpeed = fanSpeed < 4 ? fanSpeed + 1 : 1;
    setFanSpeed(newSpeed);
    // Send complete state with updated fan speed
    setTimeout(() => {
      sendCompleteState();
    }, 100);
  };
  
  // Helper function to render fan speed bars correctly
  const renderFanSpeedBars = () => {
    // Map the fan speed to the correct number of bars (1->1 bar, 4->4 bars)
    const bars = [];
    for (let i = 0; i < fanSpeed; i++) {
      bars.push(<div key={i} className="fan-bar"></div>);
    }
    return bars;
  };
  
  const handleModeChange = () => {
    const modes = ['cool', 'heat', 'dry', 'fan'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    
    setMode(newMode);
    // Send complete state with updated mode
    setTimeout(() => {
      sendCompleteState();
    }, 100);
  };
  
  const renderSignalStrength = () => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      bars.push(
        <div 
          key={i} 
          className={`signal-bar ${i < signalStrength ? 'active' : ''}`}
        ></div>
      );
    }
    return <div className="signal-indicator">{bars}</div>;
  };
  
  return (
    <div className="device-control-container">
      <div className="ac-unit">
        <div className="ac-grill horizontal"></div>
        <div className="ac-body">
          <div className="ac-vents left">
            <div className="vent"></div>
            <div className="vent"></div>
            <div className="vent"></div>
          </div>
          <div className="ac-center">
            <div className="vent-grid">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="grid-vent"></div>
              ))}
            </div>
          </div>
          <div className="ac-vents right">
            <div className="vent"></div>
            <div className="vent"></div>
            <div className="vent"></div>
          </div>
        </div>
        <div className="ac-grill horizontal"></div>
      </div>
      
      <div className="device-controls">
        <div className="device-info">
          <div className="brand">{brand}</div>
          <div className="model">{model}</div>
        </div>
        
        <div className="temperature-display" style={{ opacity: power ? 1 : 0.3 }}>
          <span className="temp-value">{temperature}</span>
          <span className="temp-unit">°C</span>
          {renderSignalStrength()}
          <div className="mode-indicator">
            <div className={`mode-icon mode-${mode}`}></div>
          </div>
        </div>
        
        <div className="control-buttons">
          <button 
            className={`control-btn power ${power ? 'on' : 'off'}`}
            onClick={handlePowerToggle}
          >
            <span>⏻</span>
          </button>
          
          <button 
            className="control-btn temp-up"
            onClick={() => handleTemperatureChange('up')}
          >
            <span>▲</span>
          </button>
          
          <button 
            className="control-btn temp-down"
            onClick={() => handleTemperatureChange('down')}
          >
            <span>▼</span>
          </button>
          
          <button 
            className="control-btn mode"
            onClick={handleModeChange}
          >
            <span>⚙</span>
          </button>
          
          <button 
            className="control-btn fan"
            onClick={handleFanSpeed}
          >
            <span>🌬️</span>
            <div className="fan-speed">
              {renderFanSpeedBars()}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirConditioner; 