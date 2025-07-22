import React, { useState } from 'react';
import './DeviceStyles.css';

const Television = ({
  brand = "TCL",
  model = "55P615",
  initialPower = false,
  initialVolume = 30,
  initialChannel = 1,
  signalStrength = 3,
  onSendCommand = () => {}
}) => {
  const [power, setPower] = useState(initialPower);
  const [volume, setVolume] = useState(initialVolume);
  const [channel, setChannel] = useState(initialChannel);
  const [source, setSource] = useState('tv');
  const [muted, setMuted] = useState(false);
  
  const handlePowerToggle = () => {
    const newPowerState = !power;
    setPower(newPowerState);
    onSendCommand({
      type: 'power',
      value: newPowerState ? 'Toggle' : 'Toggle',
      description: `Power ${newPowerState ? 'On' : 'Off'}`,
      brand: brand
    });
  };
  
  const handleVolumeChange = (direction) => {
    let newVolume = volume;
    if (direction === 'up' && volume < 100) {
      newVolume = Math.min(100, volume + 5);
    } else if (direction === 'down' && volume > 0) {
      newVolume = Math.max(0, volume - 5);
    }
    
    setVolume(newVolume);
    onSendCommand({
      type: 'volume',
      value: newVolume,
      description: `Set volume to ${newVolume}%`,
      brand: brand
    });
  };
  
  const handleChannelChange = (direction) => {
    const newChannel = direction === 'up' ? channel + 1 : Math.max(1, channel - 1);
    setChannel(newChannel);
    onSendCommand({
      type: 'channel',
      value: newChannel,
      description: `Change to channel ${newChannel}`,
      brand: brand
    });
  };
  
  const handleSourceChange = () => {
    const sources = ['tv', 'tv', 'tv', 'tv'];
    const currentIndex = sources.indexOf(source);
    const nextIndex = (currentIndex + 1) % sources.length;
    const newSource = sources[nextIndex];
    
    setSource(newSource);
    onSendCommand({
      type: 'source',
      value: newSource,
      description: `Switch to source ${newSource.toUpperCase()}`,
      brand: brand
    });
  };
  
  const handleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    onSendCommand({
      type: 'mute',
      value: 'mute',
      description: newMuted ? 'Mute audio' : 'Unmute audio',
      brand: brand
    });
  };
  
  const handleDirectionalButton = (direction) => {
    onSendCommand({
      type: 'direction',
      value: direction,
      description: `Navigate ${direction}`,
      brand: brand
    });
  };
  
  const handleMenuButton = (buttonType) => {
    onSendCommand({
      type: 'menu',
      value: buttonType,
      description: `${buttonType} button pressed`,
      brand: brand
    });
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
      <div className="tv-unit">
        <div className="tv-frame">
          <div className={`tv-screen ${power ? 'on' : 'off'}`}>
            {power && (
              <div className="tv-content">
                <div className="channel-info">
                  {source === 'tv' ? `CH ${channel}` : source.toUpperCase()}
                </div>
                <div className={`volume-indicator ${muted ? 'muted' : ''}`}>
                  {muted ? (
                    <span className="mute-icon">🔇</span>
                  ) : (
                    <>
                      <span className="volume-icon">🔊</span>
                      <div className="volume-bar">
                        <div className="volume-level" style={{width: `${volume}%`}}></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="tv-logo">{brand}</div>
        </div>
      </div>
      
      <div className="tv-controls-container">
        <div className="device-controls">
          <div className="device-info">
            <div className="brand">{brand}</div>
            <div className="model">{model}</div>
            {renderSignalStrength()}
          </div>
          
          <div className="control-buttons tv-controls">
            <button 
              className={`control-btn power ${power ? 'on' : 'off'}`}
              onClick={handlePowerToggle}
            >
              <span>⏻</span>
            </button>
            
            <button 
              className="control-btn source"
              onClick={handleSourceChange}
            >
              <span>📺</span>
              <div className="source-text">{'Input'}</div>
            </button>
            
            <button 
              className={`control-btn mute ${muted ? 'on' : 'off'}`}
              onClick={handleMute}
            >
              <span>{muted ? '🔇' : '🔊'}</span>
            </button>
            
            <div className="control-group volume">
              <button 
                className="control-btn volume-up"
                onClick={() => handleVolumeChange('up')}
              >
                <span>VOL+</span>
              </button>
              <button 
                className="control-btn volume-down"
                onClick={() => handleVolumeChange('down')}
              >
                <span>VOL-</span>
              </button>
            </div>
            
            <div className="control-group channel">
              <button 
                className="control-btn channel-up"
                onClick={() => handleChannelChange('up')}
              >
                <span>CH+</span>
              </button>
              <button 
                className="control-btn channel-down"
                onClick={() => handleChannelChange('down')}
              >
                <span>CH-</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="directional-controls-wrapper">
          {/* Directional Controls in a Circle */}
          <div className="directional-controls">
            <button 
              className="direction-btn direction-up"
              onClick={() => handleDirectionalButton('up')}
            >
              <span>▲</span>
            </button>
            
            <div className="direction-middle-row">
              <button 
                className="direction-btn direction-left"
                onClick={() => handleDirectionalButton('left')}
              >
                <span>◀</span>
              </button>
              
              <button 
                className="direction-btn direction-ok"
                onClick={() => handleDirectionalButton('ok')}
              >
                <span>OK</span>
              </button>
              
              <button 
                className="direction-btn direction-right"
                onClick={() => handleDirectionalButton('right')}
              >
                <span>▶</span>
              </button>
            </div>
            
            <button 
              className="direction-btn direction-down"
              onClick={() => handleDirectionalButton('down')}
            >
              <span>▼</span>
            </button>
          </div>
          
          {/* Return and Home buttons */}
          <div className="menu-buttons">
            <button 
              className="direction-btn menu-btn return-btn"
              onClick={() => handleMenuButton('Return')}
            >
              <span>↩</span>
            </button>
            
            <button 
              className="direction-btn menu-btn home-btn"
              onClick={() => handleMenuButton('Home')}
            >
              <span>🏠</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Television; 