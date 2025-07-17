import React, { useEffect, useState } from 'react';
import { useDirectWebRTC } from '../context/DirectWebRTCContext';

const EnhancedIncomingCallNotification = () => {
  const { callState, answerCall, rejectCall } = useDirectWebRTC();
  const [ringtone] = useState(new Audio('https://toandz.ddns.net/fstudy/sound/FCall.mp3'));
  const [isRinging, setIsRinging] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('[Call Notification] Current call state:', callState);
    
    if (callState.isReceivingCall && !callState.callAccepted) {
      setNotificationVisible(true);
    } else {
      setNotificationVisible(false);
    }
  }, [callState]);
  
  // Play ringtone when receiving a call
  useEffect(() => {
    if (callState.isReceivingCall && !callState.callAccepted) {
      console.log('[Call Notification] Incoming call detected, caller:', callState.caller);
      try {
        ringtone.loop = true;
        ringtone.volume = 1; // Slightly louder volume for better notification
        ringtone.play().then(() => {
          setIsRinging(true);
          
          // Show browser notification if allowed
          if (Notification.permission === 'granted') {
            const notification = new Notification('Incoming Video Call', {
              body: `${callState.caller?.name || 'Someone'} is calling you`,
              icon: '/logo.svg',
              requireInteraction: true
            });
            
            notification.onclick = () => {
              window.focus();
            };
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
          
        }).catch(err => {
          console.error("[Call] Error playing ringtone:", err);
        });
      } catch (err) {
        console.error("[Call] Error with ringtone:", err);
      }
      
      // Automatically stop ringing after 30 seconds if not answered
      const timeout = setTimeout(() => {
        if (callState.isReceivingCall && !callState.callAccepted) {
          console.log('[Call Notification] Call timed out after 30 seconds');
          ringtone.pause();
          ringtone.currentTime = 0;
          setIsRinging(false);
          rejectCall();
        }
      }, 30000);
      
      return () => {
        clearTimeout(timeout);
        ringtone.pause();
        ringtone.currentTime = 0;
        setIsRinging(false);
      };
    } else if (isRinging) {
      ringtone.pause();
      ringtone.currentTime = 0;
      setIsRinging(false);
    }
  }, [callState.isReceivingCall, callState.callAccepted, ringtone, isRinging, rejectCall, callState.caller]);
  
  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Preload the ringtone audio
    ringtone.preload = 'auto';
    ringtone.load();
  }, [ringtone]);
  
  const handleAnswerCall = () => {
    console.log('[Call Notification] Call answered');
    ringtone.pause();
    ringtone.currentTime = 0;
    setIsRinging(false);
    setNotificationVisible(false);
    answerCall();
  };
  
  const handleRejectCall = () => {
    console.log('[Call Notification] Call rejected');
    ringtone.pause();
    ringtone.currentTime = 0;
    setIsRinging(false);
    setNotificationVisible(false);
    rejectCall();
  };
  
  if (!notificationVisible) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-2xl max-w-md w-full mx-2 overflow-hidden animate-pulse dark:text-white">
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-white p-2 mr-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <span className="font-bold">Incoming Video Call</span>
          </div>
          <div className="animate-ping h-3 w-3 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="p-4">
          <p className="text-lg font-medium text-center dark:text-white">
            {callState.caller?.name || 'Unknown caller'} is calling you
          </p>
          
          <div className="flex justify-center mt-4 space-x-4">
            <button 
              onClick={handleRejectCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
            
            <button 
              onClick={handleAnswerCall}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedIncomingCallNotification; 