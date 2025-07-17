import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDirectWebRTC } from '../context/DirectWebRTCContext';
import './WebRTCCall.css';
import { Link } from 'react-router-dom';

const WebRTCCall = () => {
  const { user } = useAuth();
  const { 
    callState, 
    stream, 
    remoteStream, 
    myVideo, 
    userVideo, 
    startCall, 
    endCall,
    availableCameras,
    selectedCamera,
    isLoadingCameras,
    loadAvailableCameras,
    switchCamera
  } = useDirectWebRTC();
  
  const [error, setError] = useState(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Initialize media devices when component mounts
  useEffect(() => {
    // The video will be initialized when startCall is called
    console.log('[WebRTCCall] Component mounted');
    loadAvailableCameras(); // Load available cameras on mount

    // Clean up when component unmounts
    return () => {
      console.log('[WebRTCCall] Component unmounting');
      // Don't automatically end the call when leaving the page
      // This allows calls to continue even when navigating away
    };
  }, []);

  // Check if camera is active
  useEffect(() => {
    setIsCameraActive(stream !== null && stream.getVideoTracks().length > 0 && 
                     stream.getVideoTracks()[0].enabled);
  }, [stream]);
  
  const handleStartCall = async () => {
    if (!targetUserId) {
      setError('Please enter a user ID to call');
      return;
    }

    try {
      // Trim the input and ensure it's valid
      const trimmedId = targetUserId.trim();
      console.log(`Starting call to user: ${trimmedId}`);
      await startCall(trimmedId, trimmedId);
    } catch (err) {
      setError(`Error starting call: ${err.message}`);
    }
  };
  
  const handleEndCall = () => {
    endCall();
  };

  const toggleCameraSelector = () => {
    if (!showCameraSelector) {
      loadAvailableCameras(); // Refresh camera list when opening
    }
    setShowCameraSelector(!showCameraSelector);
  };

  const handleCameraChange = async (deviceId) => {
    try {
      await switchCamera(deviceId);
      setShowCameraSelector(false);
    } catch (err) {
      setError(`Failed to switch camera: ${err.message}`);
    }
  };
  
  return (
    <div className="webrtc-container">
      <h2>WebRTC Video Call</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="video-container">
        <div className="video-wrapper">
          <h3>Your Video {!isCameraActive && "(Camera off)"}</h3>
          <video ref={myVideo} autoPlay muted playsInline />
          <div className="camera-selector">
            <button onClick={toggleCameraSelector} className="camera-btn">
              Switch Camera
            </button>
            
            {showCameraSelector && (
              <div className="camera-dropdown">
                <h4>Select Camera</h4>
                {isLoadingCameras ? (
                  <p>Loading cameras...</p>
                ) : availableCameras.length === 0 ? (
                  <p>No cameras found</p>
                ) : (
                  <ul>
                    {availableCameras.map(camera => (
                      <li key={camera.deviceId}>
                        <button
                          className={selectedCamera === camera.deviceId ? 'active' : ''}
                          onClick={() => handleCameraChange(camera.deviceId)}
                        >
                          {camera.label || `Camera ${camera.deviceId.substr(0, 5)}...`}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button onClick={() => loadAvailableCameras()} className="refresh-btn">
                  Refresh List
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="video-wrapper">
          <h3>Remote Video {(!remoteStream || remoteStream.getVideoTracks().length === 0) && "(No video)"}</h3>
          <video ref={userVideo} autoPlay playsInline />
        </div>
      </div>
      
      <div className="controls">
        {!callState.isCallActive ? (
          <div className="call-form">
            <input 
              type="text" 
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Enter remote user ID" 
            />
            <button onClick={handleStartCall} className="call-btn">
              Start Call
            </button>
          </div>
        ) : (
          <div className="active-call">
            <p>In call with: {callState.receiver?.id || callState.caller?.id}</p>
            <button onClick={handleEndCall} className="end-call-btn">
              End Call
            </button>
          </div>
        )}
      </div>
      
      <div className="webrtc-info">
        <p>This is a dedicated WebRTC call page. You can also make and receive calls from any page in the application.</p>
        <p>Your User ID: <strong>{user?.id}</strong> (Share this with others so they can call you)</p>
        <p>
          <Link to="/" className="link">Return to Dashboard</Link>
        </p>
      </div>
    </div>
  );
};

export default WebRTCCall; 