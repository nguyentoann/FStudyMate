import React from 'react';
import { useDirectWebRTC } from '../context/DirectWebRTCContext';

const VideoCallButton = ({ userId, userName }) => {
  const { startCall } = useDirectWebRTC();
  
  const handleStartCall = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent click events
    
    // Ensure userId is converted to string
    const userIdStr = String(userId);
    console.log(`[VideoCallButton] Starting call to ${userName} (${userIdStr})`);
    startCall(userIdStr, userName || userIdStr);
  };
  
  return (
    <button
      onClick={handleStartCall}
      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white flex items-center justify-center"
      title={`Video call with ${userName}`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
        />
      </svg>
    </button>
  );
};

export default VideoCallButton; 