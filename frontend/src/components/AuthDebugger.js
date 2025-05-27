import React, { useState, useEffect } from 'react';
import { inspectAuthState, fixTokenStorage, setDebugToken } from '../utils/AuthUtils';
import { useAuth } from '../context/AuthContext';

/**
 * A debug component to help troubleshoot authentication issues
 * Only use in development environments
 */
const AuthDebugger = ({ onClose }) => {
  const { user } = useAuth();
  const [authState, setAuthState] = useState({});
  const [customToken, setCustomToken] = useState('');
  const [debugMessage, setDebugMessage] = useState('');

  useEffect(() => {
    // Inspect auth state on component mount
    refreshAuthState();
  }, []);

  const refreshAuthState = () => {
    const state = inspectAuthState();
    setAuthState(state);
  };

  const handleFixStorage = () => {
    const fixed = fixTokenStorage();
    setDebugMessage(fixed ? 'Token storage fixed!' : 'No fixes needed');
    refreshAuthState();
  };

  const handleSetDebugToken = () => {
    if (!customToken.trim()) {
      setDebugMessage('Please enter a token');
      return;
    }
    
    const success = setDebugToken(customToken.trim());
    setDebugMessage(success ? 'Debug token set!' : 'Failed to set token');
    refreshAuthState();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#f0f0f0', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '15px',
      zIndex: 1000,
      maxWidth: '400px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)'
    }}>
      <h3>Auth Debugger</h3>
      <button 
        style={{ position: 'absolute', top: '5px', right: '5px' }}
        onClick={onClose}
      >
        X
      </button>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>User:</strong> {user ? `ID: ${user.id}, ${user.username || user.fullName || 'Unknown'}` : 'Not logged in'}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Token Status:</strong>
        <ul>
          <li>localStorage: {authState.hasLocalStorageToken ? '✅' : '❌'}</li>
          <li>sessionStorage: {authState.hasSessionStorageToken ? '✅' : '❌'}</li>
        </ul>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={refreshAuthState}>Refresh Status</button>
        <button onClick={handleFixStorage}>Fix Token Storage</button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Set Debug Token:</strong>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input 
            type="text" 
            value={customToken} 
            onChange={(e) => setCustomToken(e.target.value)}
            placeholder="Paste token here"
            style={{ flexGrow: 1 }}
          />
          <button onClick={handleSetDebugToken}>Set</button>
        </div>
      </div>
      
      {debugMessage && (
        <div style={{ 
          padding: '5px', 
          background: '#e6f7ff', 
          border: '1px solid #1890ff',
          borderRadius: '3px'
        }}>
          {debugMessage}
        </div>
      )}
    </div>
  );
};

export default AuthDebugger; 