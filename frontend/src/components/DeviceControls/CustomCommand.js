import React, { useState } from 'react';
import './DeviceStyles.css';

const CustomCommand = ({ roomId, onSendCommand }) => {
  const [command, setCommand] = useState({
    type: 'raw',
    code: '',
    description: 'Custom command'
  });
  const [presets, setPresets] = useState([
    {
      name: 'AC Power On (Daikin)',
      type: 'raw',
      code: '[9724,9776,9724,9724,4576,2496,364,364,364,936,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,364,364,364,364,364,364,19994,4576,19994]',
      description: 'Daikin AC Power On'
    },
    {
      name: 'Samsung TV Power Toggle',
      type: 'samsung',
      code: '0xE0E040BF',
      description: 'Samsung TV Power Toggle'
    },
    {
      name: 'NEC TV Power',
      type: 'nec',
      code: '0x20DF10EF',
      description: 'NEC TV Power Button'
    }
  ]);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCommand(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!command.code) {
      setError('Command code is required');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Send the command with proper type and value structure to match the backend expectations
    const commandToSend = {
      ...command,
      value: command.code // The backend expects a 'value' property
    };
    
    onSendCommand(commandToSend);
  };
  
  const loadPreset = (preset) => {
    setCommand({
      type: preset.type,
      code: preset.code,
      description: preset.description
    });
  };
  
  const saveCurrentAsPreset = () => {
    if (!command.code) {
      setError('Cannot save empty command as preset');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Prompt for preset name
    const presetName = window.prompt('Enter a name for this preset:', command.description);
    
    if (presetName) {
      const newPreset = {
        name: presetName,
        type: command.type,
        code: command.code,
        description: command.description
      };
      
      setPresets([...presets, newPreset]);
    }
  };
  
  return (
    <div className="custom-command-container">
      <div className="custom-command-section">
        <h3 className="section-title">Custom IR Command</h3>
        <form onSubmit={handleSubmit} className="custom-command-form">
          <div className="form-group">
            <label htmlFor="commandType">Command Type</label>
            <select
              id="commandType"
              name="type"
              value={command.type}
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
            <label htmlFor="commandCode">Command Code</label>
            <textarea
              id="commandCode"
              name="code"
              value={command.code}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder={command.type === 'raw' ? '[9724,9776,...]' : '0xE0E040BF'}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="commandDescription">Description</label>
            <input
              type="text"
              id="commandDescription"
              name="description"
              value={command.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Custom command"
            />
          </div>
          
          <div className="command-actions">
            <button type="submit" className="send-button">Send Command</button>
            <button 
              type="button" 
              className="save-preset-button"
              onClick={saveCurrentAsPreset}
            >
              Save as Preset
            </button>
          </div>
        </form>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      <div className="presets-section">
        <h3 className="section-title">Presets</h3>
        <div className="presets-list">
          {presets.map((preset, index) => (
            <div key={index} className="preset-item">
              <div className="preset-info">
                <div className="preset-name">{preset.name}</div>
                <div className="preset-type">{preset.type}</div>
              </div>
              <button 
                className="load-preset-button"
                onClick={() => loadPreset(preset)}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomCommand; 