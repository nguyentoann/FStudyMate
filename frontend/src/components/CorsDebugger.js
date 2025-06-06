import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/config';

/**
 * Component to diagnose CORS issues by testing different API endpoints
 */
const CorsDebugger = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  
  // List of endpoints to test
  const endpoints = [
    { name: 'Video Call Check', path: 'video-call/check-calls', method: 'POST', body: { userId: 9 } },
    { name: 'Video Call Debug', path: 'video-call/debug-status', method: 'GET' },
    { name: 'Chat Conversations', path: 'chat/conversations/9', method: 'GET' },
    { name: 'Chat Groups', path: 'chat/groups/9?role=admin', method: 'GET' },
    { name: 'Admin Stats', path: 'admin/user-statistics', method: 'GET' }
  ];
  
  const runAllTests = async () => {
    setLoading(true);
    const results = {};
    
    for (const endpoint of endpoints) {
      results[endpoint.path] = await testEndpoint(endpoint);
    }
    
    setTestResults(results);
    setLoading(false);
  };
  
  const testEndpoint = async (endpoint) => {
    try {
      // Test with credentials
      const withCredentialsResult = await testRequest(endpoint, true);
      
      // Test without credentials
      const withoutCredentialsResult = await testRequest(endpoint, false);
      
      return {
        withCredentials: withCredentialsResult,
        withoutCredentials: withoutCredentialsResult,
        corsIssue: 
          !withCredentialsResult.success && 
          withoutCredentialsResult.success && 
          (withCredentialsResult.error || '').includes('CORS')
      };
    } catch (error) {
      return {
        error: `Test failed: ${error.message}`,
        withCredentials: { success: false },
        withoutCredentials: { success: false }
      };
    }
  };
  
  const testRequest = async (endpoint, useCredentials) => {
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: useCredentials ? 'include' : 'omit'
      };
      
      if (endpoint.body && endpoint.method !== 'GET') {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/${endpoint.path}`, options);
      const endTime = Date.now();
      
      let responseData = null;
      let responseError = null;
      
      try {
        responseData = await response.json();
      } catch (error) {
        responseError = `Cannot parse JSON: ${error.message}`;
      }
      
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        time: endTime - startTime,
        headers: responseHeaders,
        data: responseData,
        error: responseError,
        corsHeaders: {
          allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
          allowCredentials: response.headers.get('Access-Control-Allow-Credentials'),
          allowMethods: response.headers.get('Access-Control-Allow-Methods')
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        isCorsError: error.message.includes('CORS') || error.message.includes('Failed to fetch')
      };
    }
  };
  
  useEffect(() => {
    runAllTests();
  }, []);
  
  const toggleEndpoint = (path) => {
    if (expandedEndpoint === path) {
      setExpandedEndpoint(null);
    } else {
      setExpandedEndpoint(path);
    }
  };
  
  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>CORS Configuration Debugger</h3>
      
      <button 
        onClick={runAllTests} 
        disabled={loading}
        style={{ 
          padding: '8px 16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run All Tests'}
      </button>
      
      <div>
        {endpoints.map(endpoint => {
          const result = testResults[endpoint.path];
          const hasError = result && (
            (result.withCredentials && !result.withCredentials.success) || 
            (result.withoutCredentials && !result.withoutCredentials.success)
          );
          const hasCorsIssue = result && result.corsIssue;
          
          return (
            <div 
              key={endpoint.path}
              style={{ 
                marginBottom: '8px', 
                padding: '8px',
                borderLeft: '4px solid',
                borderLeftColor: !result ? '#ccc' : hasCorsIssue ? 'red' : hasError ? 'orange' : 'green',
                backgroundColor: !result ? '#f9f9f9' : hasCorsIssue ? '#fff0f0' : hasError ? '#fff8e6' : '#f0fff0'
              }}
            >
              <div 
                onClick={() => toggleEndpoint(endpoint.path)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <div>
                  <strong>{endpoint.name}</strong> ({endpoint.method} {endpoint.path})
                </div>
                <div>
                  {!result ? (
                    <span>Pending</span>
                  ) : hasCorsIssue ? (
                    <span style={{ color: 'red' }}>CORS Issue</span>
                  ) : (
                    <>
                      <span style={{ 
                        color: result.withCredentials.success ? 'green' : 'red',
                        marginRight: '10px'
                      }}>
                        With Credentials: {result.withCredentials.success ? '✓' : '✗'}
                      </span>
                      <span style={{ 
                        color: result.withoutCredentials.success ? 'green' : 'red' 
                      }}>
                        Without Credentials: {result.withoutCredentials.success ? '✓' : '✗'}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {expandedEndpoint === endpoint.path && result && (
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <div>
                    <h4>With Credentials</h4>
                    {result.withCredentials.isCorsError ? (
                      <div>CORS Error: {result.withCredentials.error}</div>
                    ) : (
                      <div>
                        <div>Status: {result.withCredentials.status} {result.withCredentials.statusText}</div>
                        <div>Time: {result.withCredentials.time}ms</div>
                        {result.withCredentials.corsHeaders && (
                          <div style={{ marginTop: '8px' }}>
                            <div>CORS Headers:</div>
                            <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                              Access-Control-Allow-Origin: {result.withCredentials.corsHeaders.allowOrigin || 'none'}
                              <br />
                              Access-Control-Allow-Credentials: {result.withCredentials.corsHeaders.allowCredentials || 'none'}
                              <br />
                              Access-Control-Allow-Methods: {result.withCredentials.corsHeaders.allowMethods || 'none'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <h4>Without Credentials</h4>
                    {result.withoutCredentials.isCorsError ? (
                      <div>CORS Error: {result.withoutCredentials.error}</div>
                    ) : (
                      <div>
                        <div>Status: {result.withoutCredentials.status} {result.withoutCredentials.statusText}</div>
                        <div>Time: {result.withoutCredentials.time}ms</div>
                        {result.withoutCredentials.corsHeaders && (
                          <div style={{ marginTop: '8px' }}>
                            <div>CORS Headers:</div>
                            <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                              Access-Control-Allow-Origin: {result.withoutCredentials.corsHeaders.allowOrigin || 'none'}
                              <br />
                              Access-Control-Allow-Credentials: {result.withoutCredentials.corsHeaders.allowCredentials || 'none'}
                              <br />
                              Access-Control-Allow-Methods: {result.withoutCredentials.corsHeaders.allowMethods || 'none'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CorsDebugger; 