import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../services/config';
import { inspectAuthState, fixTokenStorage, isValidToken } from '../utils/AuthUtils';
import { makeApiCall, getAuthMethod } from '../utils/ApiUtils';

// Debug flag to control logging - set to false to disable verbose logs
// Change to true when troubleshooting CORS or video call issues
const DEBUG_LOGGING = false;

const DirectWebRTCContext = createContext();

export const useDirectWebRTC = () => useContext(DirectWebRTCContext);

export const DirectWebRTCProvider = ({ children }) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState({
    isReceivingCall: false,
    isCallActive: false,
    caller: null,
    receiver: null,
    callAccepted: false,
    callEnded: false,
  });
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  
  const myVideo = useRef();
  const userVideo = useRef();
  const peerConnection = useRef(null);
  const signalPollingRef = useRef();
  
  // Improved ICE servers configuration for localhost scenarios
  const iceServers = {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302', 
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302'
        ]
      },
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    iceCandidatePoolSize: 10
  };
  
  // Function to get authentication data (session-based authentication)
  const getAuthToken = () => {
    // Use the utility function instead
    return getAuthMethod();
  };
  
  // Function to verify login status before making calls
  const verifyLoginStatus = () => {
    console.log('[CALL-FLOW] Verifying login status before call');
    
    // Check if user object exists in context
    if (!user) {
      console.error('[CALL-FLOW] ERROR: No user object found in auth context');
      setError('You must be logged in to make calls');
      return false;
    }
    
    // Check if user ID exists
    if (!user.id) {
      console.error('[CALL-FLOW] ERROR: User is logged in but has no ID');
      setError('User authentication issue - missing ID');
      return false;
    }
    
    // Check for session data
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    
    if (!userData || !userId) {
      console.error('[CALL-FLOW] ERROR: No session data available');
      setError('Session data missing - please log in again');
      return false;
    }
    
    console.log('[CALL-FLOW] Login verification passed, user ID:', user.id);
    return true;
  };
  
  // Function to start a call
  const startCall = async (receiverId, receiverName) => {
    try {
      console.log(`[CALL-FLOW] Starting direct WebRTC call to user ID: ${receiverId}, name: ${receiverName}`);
      
      // Verify login status before proceeding
      if (!verifyLoginStatus()) {
        console.error('[CALL-FLOW] Call canceled due to authentication issues');
        return;
      }
      
      setConnectionStatus('connecting');
      
      // Clean up any existing connections
      if (peerConnection.current) {
        console.log('[CALL-FLOW] Cleaning up existing connection');
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      if (signalPollingRef.current) {
        console.log('[CALL-FLOW] Clearing existing signal polling');
        clearInterval(signalPollingRef.current);
        signalPollingRef.current = null;
      }
      
      // Get user's media stream
      console.log('[CALL-FLOW] Requesting media stream');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: true 
      });
      
      console.log(`[CALL-FLOW] Media stream obtained with ${mediaStream.getTracks().length} tracks`);
      mediaStream.getTracks().forEach(track => {
        console.log(`[CALL-FLOW] Track: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`);
      });
      
      setStream(mediaStream);
      if (myVideo.current) {
        console.log('[CALL-FLOW] Setting local video source');
        myVideo.current.srcObject = mediaStream;
      }
      
      setCallState({
        ...callState,
        isCallActive: true,
        receiver: { id: receiverId, name: receiverName },
      });
      
      // Create peer connection with enhanced settings for localhost
      console.log('[CALL-FLOW] Creating new RTCPeerConnection');
      const pc = new RTCPeerConnection({
        ...iceServers,
        sdpSemantics: 'unified-plan',
        bundlePolicy: 'max-bundle'
      });
      peerConnection.current = pc;
      
      // Add our stream to the peer connection
      console.log('[CALL-FLOW] Adding local tracks to peer connection');
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
        console.log(`[CALL-FLOW] Added ${track.kind} track to peer connection`);
      });
      
      // Create a remote stream to receive the other user's media
      console.log('[CALL-FLOW] Creating remote media stream');
      const newRemoteStream = new MediaStream();
      setRemoteStream(newRemoteStream);
      if (userVideo.current) {
        console.log('[CALL-FLOW] Setting up remote video element');
        userVideo.current.srcObject = newRemoteStream;
      }
      
      // Set up event handlers for the peer connection
      console.log('[CALL-FLOW] Setting up peer connection handlers');
      setupPeerConnectionHandlers(pc, newRemoteStream);
      
      // Create and send offer with specific constraints
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: false
      };
      
      console.log('[CALL-FLOW] Creating offer with options:', offerOptions);
      
      try {
        // Wrap this in a try-catch to get better error information
        const offer = await pc.createOffer(offerOptions);
        
        console.log('[CALL-FLOW] Offer created successfully');
        
        // Add a=candidate-pair-one-way flag to SDP for localhost connections
        if (offer.sdp) {
          console.log('[CALL-FLOW] Offer SDP created, length:', offer.sdp.length);
          // Log the first few lines of SDP for debugging
          const sdpPreview = offer.sdp.split('\n').slice(0, 5).join('\n');
          console.log('[CALL-FLOW] SDP preview:', sdpPreview + '...');
        }
        
        console.log('[CALL-FLOW] Setting local description');
        await pc.setLocalDescription(offer);
        
        console.log('[CALL-FLOW] Local description set, sending offer');
        
        // Send the offer to the other user through the signaling server
        console.log(`[CALL-FLOW] Sending offer to user ${receiverId}`);
        
        try {
          const response = await makeApiCall('/video-call/signal', 'POST', {
            senderId: user.id,
            senderName: user.fullName || user.username,
            receiverId: receiverId,
            signal: {
              type: offer.type,
              sdp: offer.sdp
            },
            type: 'offer'
          });
          
          console.log('[CALL-FLOW] Signal endpoint status:', response.status);
          
          if (!response.ok) {
            console.error(`[CALL-FLOW] Failed to send offer: ${response.status}`);
            throw new Error(`Failed to send offer: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log('[CALL-FLOW] Offer sent successfully, response:', responseData);
          
          // Start polling for answer
          console.log(`[CALL-FLOW] Starting polling for answer from user ${receiverId}`);
          startSignalPolling(receiverId);
        } catch (err) {
          console.error('[CALL-FLOW] Error sending offer:', err);
          throw new Error(`Failed to send offer: ${err.message}`);
        }
      } catch (offerError) {
        console.error('[CALL-FLOW] Error creating or setting offer:', offerError);
        throw new Error(`Failed to create offer: ${offerError.message}`);
      }
      
    } catch (err) {
      console.error('[CALL-FLOW] Error starting call:', err);
      setError(`Failed to start call: ${err.message}`);
      setConnectionStatus('failed');
      
      // Clean up if there was an error
      if (stream) {
        console.log('[CALL-FLOW] Stopping media tracks due to error');
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnection.current) {
        console.log('[CALL-FLOW] Closing peer connection due to error');
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      setCallState({
        ...callState,
        isCallActive: false,
        callEnded: true,
      });
    }
  };
  
  // Function to answer a call
  const answerCall = async () => {
    try {
      console.log('Answering incoming call from:', callState.caller);
      setConnectionStatus('connecting');
      
      // Clean up any existing connections
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      // Get user's media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: true 
      });
      
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }
      
      setCallState({
        ...callState,
        callAccepted: true,
        isCallActive: true,
      });
      
      // Create peer connection with enhanced settings
      const pc = new RTCPeerConnection({
        ...iceServers,
        sdpSemantics: 'unified-plan',
        bundlePolicy: 'max-bundle'
      });
      peerConnection.current = pc;
      
      // Add our stream to the peer connection
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
      });
      
      // Create a remote stream to receive the other user's media
      const newRemoteStream = new MediaStream();
      setRemoteStream(newRemoteStream);
      if (userVideo.current) {
        userVideo.current.srcObject = newRemoteStream;
      }
      
      // Set up event handlers for the peer connection
      setupPeerConnectionHandlers(pc, newRemoteStream);
      
      // Get the offer from the call state
      const offer = callState.signal;
      
      // Set the remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and send answer with specific constraints
      const answerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: false
      };
      
      const answer = await pc.createAnswer(answerOptions);
      await pc.setLocalDescription(answer);
      
      console.log('Created answer:', answer.type);
      
      // Send the answer to the caller
      const response = await makeApiCall('/video-call/signal', 'POST', {
        senderId: user.id,
        senderName: user.fullName || user.username,
        receiverId: callState.caller.id,
        signal: {
          type: answer.type,
          sdp: answer.sdp
        },
        type: 'answer'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send answer: ${response.status}`);
      }
      
      console.log('Answer sent successfully');
      
      // Start polling for any additional ICE candidates
      startSignalPolling(callState.caller.id);
      
    } catch (err) {
      console.error('Error answering call:', err);
      setError(`Failed to answer call: ${err.message}`);
      setConnectionStatus('failed');
      
      // Clean up if there was an error
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      setCallState({
        ...callState,
        callAccepted: false,
        isCallActive: false,
        callEnded: true,
      });
    }
  };
  
  // Function to end a call
  const endCall = () => {
    console.log('[CALL-FLOW] Ending call');
    
    // Stop all tracks in the stream
    if (stream) {
      console.log('[CALL-FLOW] Stopping media tracks');
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Close the peer connection
    if (peerConnection.current) {
      console.log('[CALL-FLOW] Closing peer connection');
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Stop signal polling
    if (signalPollingRef.current) {
      console.log('[CALL-FLOW] Stopping signal polling');
      clearInterval(signalPollingRef.current);
      signalPollingRef.current = null;
    }
    
    // Reset state
    console.log('[CALL-FLOW] Resetting call state');
    setCallState({
      isReceivingCall: false,
      isCallActive: false,
      caller: null,
      receiver: null,
      callAccepted: false,
      callEnded: true,
      signal: null,
    });
    
    setStream(null);
    setRemoteStream(null);
    setError(null);
  };
  
  // Function to reject an incoming call
  const rejectCall = () => {
    console.log('Rejecting incoming call');
    
    // Optionally notify the caller that the call was rejected
    if (callState.caller) {
      try {
        makeApiCall('/video-call/reject', 'POST', {
          senderId: user.id,
          receiverId: callState.caller.id,
        });
      } catch (err) {
        console.error('Error sending rejection notification:', err);
      }
    }
    
    setCallState({
      ...callState,
      isReceivingCall: false,
      caller: null,
      signal: null,
    });
  };
  
  // Set up event handlers for the peer connection
  const setupPeerConnectionHandlers = (pc, remoteMediaStream) => {
    // Log connection state changes
    pc.onconnectionstatechange = (event) => {
      console.log('[CALL-FLOW] Connection state change:', pc.connectionState);
      setConnectionStatus(pc.connectionState);
      
      // Handle different connection states
      switch(pc.connectionState) {
        case 'connected':
          console.log('[CALL-FLOW] WebRTC peer connection established!');
          break;
        case 'disconnected':
          console.log('[CALL-FLOW] WebRTC peer disconnected - attempting to recover');
          break;
        case 'failed':
          console.error('[CALL-FLOW] WebRTC connection failed');
          setError('Connection failed. Please try again.');
          break;
        case 'closed':
          console.log('[CALL-FLOW] WebRTC connection closed');
          break;
        default:
          break;
      }
    };
    
    // Log ICE connection state changes
    pc.oniceconnectionstatechange = (event) => {
      console.log('[CALL-FLOW] ICE connection state change:', pc.iceConnectionState);
      
      // Handle ICE connection failure
      if (pc.iceConnectionState === 'failed') {
        console.log('[CALL-FLOW] ICE connection failed - trying to restart ICE');
        // Try to restart ICE gathering
        pc.restartIce();
      }
    };
    
    // Log ICE gathering state changes
    pc.onicegatheringstatechange = (event) => {
      console.log('[CALL-FLOW] ICE gathering state change:', pc.iceGatheringState);
    };
    
    // Log signaling state changes
    pc.onsignalingstatechange = (event) => {
      console.log('[CALL-FLOW] Signaling state change:', pc.signalingState);
    };
    
    // Handle when tracks are received from the other peer
    pc.ontrack = (event) => {
      console.log('[CALL-FLOW] Track received:', event.track.kind);
      event.streams[0].getTracks().forEach(track => {
        console.log(`[CALL-FLOW] Adding remote ${track.kind} track to stream`);
        remoteMediaStream.addTrack(track);
      });
    };
    
    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('[CALL-FLOW] Generated ICE candidate:', event.candidate.type);
        console.log('[CALL-FLOW] ICE candidate:', event.candidate.candidate);
        
        // For localhost connections, prioritize host candidates
        const isLocalCandidate = event.candidate.candidate.includes('host');
        if (isLocalCandidate) {
          console.log('[CALL-FLOW] Found local host candidate - prioritizing');
        }
        
        try {
          const recipientId = callState.isReceivingCall ? callState.caller.id : callState.receiver.id;
          console.log(`[CALL-FLOW] Sending ICE candidate to user ${recipientId}`);
          
          const response = await makeApiCall('/video-call/signal', 'POST', {
            senderId: user.id,
            senderName: user.fullName || user.username,
            receiverId: recipientId,
            signal: {
              type: 'candidate',
              candidate: event.candidate
            },
            type: 'candidate'
          });
          
          if (!response.ok) {
            console.error(`[CALL-FLOW] Failed to send ICE candidate: ${response.status}`);
          } else {
            console.log('[CALL-FLOW] ICE candidate sent successfully');
          }
        } catch (err) {
          console.error('[CALL-FLOW] Error sending ICE candidate:', err);
        }
      } else {
        console.log('[CALL-FLOW] All ICE candidates have been generated');
      }
    };
    
    // Log errors
    pc.onerror = (error) => {
      console.error('[CALL-FLOW] PeerConnection error:', error);
    };
  };
  
  // Poll for incoming signals
  const startSignalPolling = (otherUserId) => {
    console.log(`[CALL-FLOW] Starting signal polling for user ID: ${otherUserId}`);
    
    // Clear any existing polling interval
    if (signalPollingRef.current) {
      clearInterval(signalPollingRef.current);
    }
    
    // Set up polling every 1 second
    signalPollingRef.current = setInterval(async () => {
      if (!user) return;
      
      try {
        console.log(`[CALL-FLOW] Polling for signals from user ${otherUserId}`);
        
        const response = await makeApiCall('/video-call/get-signal', 'POST', {
          userId: user.id,
          fromUserId: otherUserId,
        });
        
        if (!response.ok) {
          console.error(`[CALL-FLOW] Failed to get signal data: ${response.status}`);
          throw new Error(`Failed to get signal data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.signal) {
          console.log(`[CALL-FLOW] Received signal data of type: ${data.type}`);
          
          if (peerConnection.current) {
            // Handle incoming signal based on type
            const signal = data.signal;
            
            if (signal.type === 'answer') {
              console.log('[CALL-FLOW] Processing answer, setting remote description');
              try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                console.log('[CALL-FLOW] Remote description set successfully');
              } catch (err) {
                console.error('[CALL-FLOW] Error setting remote description:', err);
              }
            } else if (signal.type === 'candidate' && signal.candidate) {
              console.log('[CALL-FLOW] Processing ICE candidate');
              try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                console.log('[CALL-FLOW] ICE candidate added successfully');
              } catch (err) {
                console.error('[CALL-FLOW] Error adding ICE candidate:', err);
              }
            }
          } else if (data.type === 'offer') {
            // This is an incoming call
            console.log('[CALL-FLOW] Received incoming call offer');
            setCallState({
              ...callState,
              isReceivingCall: true,
              caller: { 
                id: otherUserId,
                name: data.senderName || 'Unknown caller'
              },
              signal: data.signal,
            });
          }
        } else {
          console.log('[CALL-FLOW] No new signals found in this polling cycle');
        }
      } catch (err) {
        console.error('[CALL-FLOW] Error polling for signals:', err);
      }
    }, 1000);
  };
  
  // Function to make an API call with proper error handling and CORS fallbacks
  const makeApiCall = async (url, method, body) => {
    try {
      // First try with credentials mode
      const response = await fetch(`${API_URL}${url}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
      });
      
      return response;
    } catch (error) {
      if (DEBUG_LOGGING) {
        console.error(`[CALL-FLOW] Error with API call to ${url}:`, error);
      }
      
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        if (DEBUG_LOGGING) {
          console.log('[CALL-FLOW] CORS issue detected, trying without credentials mode');
        }
        
        // Try again without credentials mode as fallback
        try {
          const fallbackResponse = await fetch(`${API_URL}${url}`, {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'omit' // Don't send cookies
          });
          
          if (DEBUG_LOGGING) {
            console.log(`[CALL-FLOW] Fallback API call to ${url} status:`, fallbackResponse.status);
          }
          return fallbackResponse;
        } catch (fallbackError) {
          if (DEBUG_LOGGING) {
            console.error('[CALL-FLOW] Fallback API call also failed:', fallbackError);
          }
          throw fallbackError;
        }
      }
      
      throw error;
    }
  };
  
  // Check for incoming calls when user is logged in
  useEffect(() => {
    if (user && !callState.isCallActive && !signalPollingRef.current) {
      if (DEBUG_LOGGING) {
        console.log('[CALL-FLOW] Starting general call polling for any incoming calls');
      }
      
      // Start polling for incoming calls from any user
      signalPollingRef.current = setInterval(async () => {
        try {
          // First check for direct signals (optimized for localhost)
          if (DEBUG_LOGGING) {
            console.log('[CALL-FLOW] Checking for incoming calls...');
          }
          const token = getAuthToken();
          const response = await makeApiCall('/video-call/check-calls', 'POST', {
            userId: user.id
          });
          
          if (!response.ok) {
            if (DEBUG_LOGGING) {
              console.error(`[CALL-FLOW] Failed to check for calls: ${response.status}`);
            }
            throw new Error(`Failed to check for calls: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.hasIncomingCall) {
            if (DEBUG_LOGGING) {
              console.log('[CALL-FLOW] Detected incoming call:', data);
            }
            setCallState({
              ...callState,
              isReceivingCall: true,
              caller: { 
                id: data.callerId,
                name: data.callerName || 'Unknown caller'
              },
              signal: data.signal,
            });
            
            // Once we've found a call, stop the general polling and switch to specific polling
            if (DEBUG_LOGGING) {
              console.log(`[CALL-FLOW] Switching to specific polling for caller ${data.callerId}`);
            }
            clearInterval(signalPollingRef.current);
            startSignalPolling(data.callerId);
            return; // Exit early, we found a call
          } else if (DEBUG_LOGGING) {
            console.log('[CALL-FLOW] No incoming calls detected in this polling cycle');
          }
          
          // For localhost environment specifically, check the debug status
          // to manually detect any pending calls that might have been missed
          if (DEBUG_LOGGING) {
            console.log('[CALL-FLOW] Checking debug status for missed calls');
          }
          const debugResponse = await makeApiCall('/video-call/debug-status', 'GET');
          
          if (debugResponse.ok) {
            const debugData = await debugResponse.json();
            if (DEBUG_LOGGING) {
              console.log('[CALL-FLOW] Debug status response:', debugData);
            }
            
            if (debugData.debug && debugData.debug.pendingCallsPerUser) {
              const pendingCalls = debugData.debug.pendingCallsPerUser;
              if (pendingCalls[user.id] && pendingCalls[user.id] > 0) {
                if (DEBUG_LOGGING) {
                  console.log(`[CALL-FLOW] Found ${pendingCalls[user.id]} pending call(s) in debug status, forcing refresh`);
                }
                
                // Force a refresh of the check-calls endpoint to pick up the call
                setTimeout(async () => {
                  try {
                    if (DEBUG_LOGGING) {
                      console.log('[CALL-FLOW] Performing refresh check for calls');
                    }
                    const refreshResponse = await makeApiCall('/video-call/check-calls', 'POST', {
                      userId: user.id
                    });
                    
                    if (refreshResponse.ok) {
                      const refreshData = await refreshResponse.json();
                      if (refreshData.hasIncomingCall) {
                        if (DEBUG_LOGGING) {
                          console.log('[CALL-FLOW] Detected incoming call after refresh:', refreshData);
                        }
                        setCallState({
                          ...callState,
                          isReceivingCall: true,
                          caller: { 
                            id: refreshData.callerId,
                            name: refreshData.callerName || 'Unknown caller'
                          },
                          signal: refreshData.signal,
                        });
                        
                        // Once we've found a call, stop the general polling and switch to specific polling
                        if (DEBUG_LOGGING) {
                          console.log(`[CALL-FLOW] Switching to specific polling for caller ${refreshData.callerId} after refresh`);
                        }
                        clearInterval(signalPollingRef.current);
                        startSignalPolling(refreshData.callerId);
                      } else if (DEBUG_LOGGING) {
                        console.log('[CALL-FLOW] No incoming calls found after refresh');
                      }
                    } else if (DEBUG_LOGGING) {
                      console.error(`[CALL-FLOW] Failed refresh check: ${refreshResponse.status}`);
                    }
                  } catch (err) {
                    if (DEBUG_LOGGING) {
                      console.error('[CALL-FLOW] Error in refresh check:', err);
                    }
                  }
                }, 500);
              } else if (DEBUG_LOGGING) {
                console.log('[CALL-FLOW] No pending calls found in debug data for current user');
              }
            } else if (DEBUG_LOGGING) {
              console.log('[CALL-FLOW] No pending calls data found in debug status');
            }
          } else if (DEBUG_LOGGING) {
            console.error(`[CALL-FLOW] Failed to get debug status: ${debugResponse.status}`);
          }
        } catch (err) {
          if (DEBUG_LOGGING) {
            console.error('[CALL-FLOW] Error checking for calls:', err);
          }
        }
      }, 2000);
    }
    
    return () => {
      if (signalPollingRef.current) {
        if (DEBUG_LOGGING) {
          console.log('[CALL-FLOW] Cleaning up general call polling on unmount');
        }
        clearInterval(signalPollingRef.current);
      }
    };
  }, [user, callState.isCallActive]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (signalPollingRef.current) {
        clearInterval(signalPollingRef.current);
      }
    };
  }, [stream]);
  
  return (
    <DirectWebRTCContext.Provider
      value={{
        callState,
        stream,
        remoteStream,
        error,
        connectionStatus,
        myVideo,
        userVideo,
        startCall,
        answerCall,
        endCall,
        rejectCall,
      }}
    >
      {children}
    </DirectWebRTCContext.Provider>
  );
};

export default DirectWebRTCProvider; 