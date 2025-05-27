import React, { useState } from 'react';
import WebRTCDebugger from './WebRTCDebugger';
import CorsDebugger from './CorsDebugger';

/**
 * Developer tools component with various debugging utilities
 */
const DeveloperTools = () => {
  const [selectedTool, setSelectedTool] = useState('cors');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: isExpanded ? '800px' : '200px',
      maxHeight: isExpanded ? '80vh' : '40px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '4px 0 0 0',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#495057',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <span>Developer Tools {isExpanded ? '▼' : '▲'}</span>
        {isExpanded && (
          <div>
            <button
              style={{
                marginRight: '8px',
                padding: '4px 8px',
                backgroundColor: selectedTool === 'cors' ? '#6c757d' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTool('cors');
              }}
            >
              CORS Debugger
            </button>
            <button
              style={{
                padding: '4px 8px',
                backgroundColor: selectedTool === 'webrtc' ? '#6c757d' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTool('webrtc');
              }}
            >
              WebRTC Debugger
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(80vh - 40px)' }}>
          {selectedTool === 'cors' && <CorsDebugger />}
          {selectedTool === 'webrtc' && <WebRTCDebugger />}
        </div>
      )}
    </div>
  );
};

export default DeveloperTools; 