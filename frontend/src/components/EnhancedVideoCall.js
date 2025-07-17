import React, { useEffect, useState } from 'react';
import { useDirectWebRTC } from '../context/DirectWebRTCContext';
import { ReactComponent as MicIcon } from '../assets/icons/mic.svg';
import { ReactComponent as MicOffIcon } from '../assets/icons/mic-off.svg';
import { ReactComponent as VideoIcon } from '../assets/icons/video.svg';
import { ReactComponent as VideoOffIcon } from '../assets/icons/video-off.svg';
import { ReactComponent as EndCallIcon } from '../assets/icons/end-call.svg';

const EnhancedVideoCall = () => {
  const { 
    callState, 
    stream, 
    remoteStream, 
    myVideo, 
    userVideo, 
    endCall,
    availableCameras,
    selectedCamera,
    isLoadingCameras,
    loadAvailableCameras,
    switchCamera
  } = useDirectWebRTC();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localVideoError, setLocalVideoError] = useState(false);
  const [remoteVideoError, setRemoteVideoError] = useState(false);
  const [showCameraSelector, setShowCameraSelector] = useState(false);

  // Function to toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Function to toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Function to toggle camera selector
  const toggleCameraSelector = () => {
    if (!showCameraSelector) {
      loadAvailableCameras(); // Refresh camera list when opening
    }
    setShowCameraSelector(!showCameraSelector);
  };

  // Function to handle camera selection
  const handleCameraChange = async (deviceId) => {
    await switchCamera(deviceId);
    setShowCameraSelector(false);
  };

  // Get the name of the person we're calling or the caller
  const getOtherPersonName = () => {
    if (callState.isReceivingCall && callState.caller) {
      return callState.caller.name;
    } else if (callState.receiver) {
      return callState.receiver.name;
    }
    return 'Unknown';
  };
  
  // Debug and ensure video elements are properly connected
  useEffect(() => {
    console.log("[EnhancedVideoCall] Call state active:", callState.isCallActive);
    
    if (myVideo.current && stream) {
      console.log("[EnhancedVideoCall] Setting local video source");
      myVideo.current.srcObject = stream;
      myVideo.current.onloadedmetadata = () => {
        console.log("[EnhancedVideoCall] Local video metadata loaded");
        myVideo.current.play().catch(e => {
          console.error("[EnhancedVideoCall] Error playing local video:", e);
          setLocalVideoError(true);
        });
      };
    }
    
    if (userVideo.current && remoteStream) {
      console.log("[EnhancedVideoCall] Setting remote video source");
      userVideo.current.srcObject = remoteStream;
      userVideo.current.onloadedmetadata = () => {
        console.log("[EnhancedVideoCall] Remote video metadata loaded");
        userVideo.current.play().catch(e => {
          console.error("[EnhancedVideoCall] Error playing remote video:", e);
          setRemoteVideoError(true);
        });
      };
    }
  }, [stream, remoteStream, callState.isCallActive]);

  // Only show the component when a call is active
  if (!callState.isCallActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-90">
      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full p-4">
        {/* Videos container */}
        <div className="relative w-full max-w-4xl h-3/4 bg-gray-900 rounded-lg overflow-hidden">
          {/* Remote video */}
          <div className="absolute inset-0">
            {remoteVideoError ? (
              <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                <p>Remote video unavailable</p>
              </div>
            ) : (
              <video
                ref={userVideo}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-md text-white">
              {getOtherPersonName()}
            </div>
          </div>
          
          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-1/4 max-w-xs aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
            {localVideoError ? (
              <div className="flex items-center justify-center h-full bg-gray-800 text-white text-xs">
                <p>Camera unavailable</p>
              </div>
            ) : (
              <video
                ref={myVideo}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />
            )}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 px-2 py-0.5 rounded text-white text-xs">
              You
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <button 
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
          >
            {isMuted ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white"
          >
            <EndCallIcon className="w-8 h-8" />
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
          >
            {isVideoOff ? <VideoOffIcon className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
          </button>

          <button 
            onClick={toggleCameraSelector}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0l-3 3m3-3l3 3" />
            </svg>
          </button>
        </div>

        {/* Camera selector dropdown */}
        {showCameraSelector && (
          <div className="absolute bottom-24 right-4 bg-gray-800 rounded-lg shadow-lg p-3 w-64">
            <h3 className="text-white text-sm font-medium mb-2">Select Camera</h3>
            {isLoadingCameras ? (
              <p className="text-gray-300 text-xs">Loading cameras...</p>
            ) : availableCameras.length === 0 ? (
              <p className="text-gray-300 text-xs">No cameras found</p>
            ) : (
              <ul className="space-y-1">
                {availableCameras.map(camera => (
                  <li key={camera.deviceId}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded text-sm ${selectedCamera === camera.deviceId ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                      onClick={() => handleCameraChange(camera.deviceId)}
                    >
                      {camera.label || `Camera ${camera.deviceId.substr(0, 5)}...`}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button 
              className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 rounded"
              onClick={() => loadAvailableCameras()}
            >
              Refresh List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedVideoCall; 