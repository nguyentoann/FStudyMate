import React, { useState, useEffect } from 'react';
import { makeApiCall } from '../utils/ApiUtils';

/**
 * WebRTC debugging component to help diagnose connection issues
 */
const WebRTCDebugger = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pendingCalls, setPendingCalls] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadDebugInfo();
    
    // Refresh debug data every 5 seconds
    const interval = setInterval(() => {
      loadDebugInfo();
      setRefreshCount(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDebugInfo = async () => {
    setLoading(true);
    try {
      // Get debug status
      const debugResponse = await makeApiCall('/video-call/debug-status', 'GET');
      if (debugResponse.ok) {
        const data = await debugResponse.json();
        setDebugInfo(data.debug);
        
        if (data.debug && data.debug.pendingCallsPerUser) {
          setPendingCalls(data.debug.pendingCallsPerUser);
        }
      }
      
      // Get active users
      const usersResponse = await makeApiCall('/video-call/active-users', 'GET');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setActiveUsers(
          Object.entries(data.activeUsers || {}).map(([id, info]) => ({
            id,
            lastActive: new Date(info.lastActive).toLocaleTimeString(),
            age: Math.round(info.age / 1000) // Convert to seconds
          }))
        );
      }
    } catch (err) {
      console.error('Error loading debug info:', err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestResult({ status: 'testing' });
    
    try {
      // Test CORS with credentials
      const withCredentialsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/video-call/debug-status`, {
        method: 'GET',
        credentials: 'include'
      });
      
      // Test CORS without credentials
      const withoutCredentialsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/video-call/debug-status`, {
        method: 'GET',
        credentials: 'omit'
      });
      
      setTestResult({
        status: 'complete',
        withCredentials: {
          ok: withCredentialsResponse.ok,
          status: withCredentialsResponse.status,
          statusText: withCredentialsResponse.statusText
        },
        withoutCredentials: {
          ok: withoutCredentialsResponse.ok,
          status: withoutCredentialsResponse.status,
          statusText: withoutCredentialsResponse.statusText
        },
        corsIssue: !withCredentialsResponse.ok && withoutCredentialsResponse.ok
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: error.message,
        isCorsError: error.message.includes('CORS') || error.message.includes('Failed to fetch')
      });
    }
  };

  const formattedPendingCalls = () => {
    return Object.entries(pendingCalls).map(([userId, count]) => (
      <div key={userId}>
        User {userId}: <strong>{count}</strong> pending {count === 1 ? 'call' : 'calls'}
      </div>
    ));
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}>
      <h3>WebRTC Connection Debugger</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button 
          onClick={loadDebugInfo}
          style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Refresh Data
        </button>
        
        <button 
          onClick={testConnection}
          style={{ padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Test CORS
        </button>
        
        <div>Auto-refresh: {refreshCount}</div>
        {loading && <div>Loading...</div>}
      </div>
      
      {testResult && (
        <div style={{
          padding: '10px',
          backgroundColor: testResult.status === 'error' || testResult.corsIssue ? '#ffebee' : '#e8f5e9',
          marginBottom: '10px',
          borderRadius: '3px'
        }}>
          <h4>CORS Test Results</h4>
          {testResult.status === 'error' ? (
            <div>Error: {testResult.message}</div>
          ) : testResult.status === 'testing' ? (
            <div>Testing connection...</div>
          ) : (
            <div>
              <div>With credentials: {testResult.withCredentials.ok ? '✓' : '✗'} ({testResult.withCredentials.status})</div>
              <div>Without credentials: {testResult.withoutCredentials.ok ? '✓' : '✗'} ({testResult.withoutCredentials.status})</div>
              {testResult.corsIssue && (
                <div style={{ color: 'red', fontWeight: 'bold' }}>
                  CORS issue detected! Requests with credentials are failing but requests without credentials work.
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', marginRight: '20px' }}>
          <h4>Active Users ({activeUsers.length})</h4>
          {activeUsers.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '5px', borderBottom: '1px solid #ddd' }}>User ID</th>
                  <th style={{ textAlign: 'left', padding: '5px', borderBottom: '1px solid #ddd' }}>Last Active</th>
                  <th style={{ textAlign: 'left', padding: '5px', borderBottom: '1px solid #ddd' }}>Age (s)</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map(user => (
                  <tr key={user.id}>
                    <td style={{ padding: '5px', borderBottom: '1px solid #eee' }}>{user.id}</td>
                    <td style={{ padding: '5px', borderBottom: '1px solid #eee' }}>{user.lastActive}</td>
                    <td style={{ padding: '5px', borderBottom: '1px solid #eee' }}>{user.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No active users found</div>
          )}
        </div>
        
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h4>Pending Calls</h4>
          {Object.keys(pendingCalls).length > 0 ? (
            formattedPendingCalls()
          ) : (
            <div>No pending calls</div>
          )}
          
          {debugInfo && (
            <div style={{ marginTop: '20px' }}>
              <h4>Debug Stats</h4>
              <div>Total pending calls: {debugInfo.totalPendingCalls || 0}</div>
              <div>Total signals: {debugInfo.totalSignals || 0}</div>
              <div>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebRTCDebugger; 