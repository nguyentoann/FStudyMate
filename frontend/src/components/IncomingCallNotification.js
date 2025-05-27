import React from 'react';
import { useDirectWebRTC } from '../context/DirectWebRTCContext';

const IncomingCallNotification = () => {
  const { callState, answerCall, rejectCall } = useDirectWebRTC();
  
  if (!callState.isReceivingCall) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 animate-zoomIn max-w-xs">
      <div className="flex items-center mb-3">
        <div className="bg-indigo-100 p-2 rounded-full mr-3">
          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Incoming Video Call</h3>
          <p className="text-sm text-gray-600">
            {callState.caller?.name || 'Someone'} is calling you
          </p>
        </div>
      </div>
      
      <div className="flex justify-between space-x-2">
        <button 
          onClick={rejectCall}
          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Decline
        </button>
        
        <button 
          onClick={answerCall}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Answer
        </button>
      </div>
    </div>
  );
};

export default IncomingCallNotification; 