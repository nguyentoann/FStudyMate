import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../services/config';
import SimplePeer from 'simple-peer';
import { inspectAuthState, fixTokenStorage, isValidToken } from '../utils/AuthUtils';
import { makeApiCall, getAuthMethod } from '../utils/ApiUtils';

// Ensure process is defined for simple-peer
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: { NODE_ENV: 'development' },
    browser: true,
    version: '16.0.0'
  };
}

const VideoCallContext = createContext();

export const useVideoCall = () => useContext(VideoCallContext);

export const VideoCallProvider = ({ children }) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState({
    isReceivingCall: false,
    isCallActive: false,
    caller: null,
    receiver: null,
    callAccepted: false,
    callEnded: false,
    signal: null,
  });
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const signalPollingRef = useRef();
  
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
      console.log(`[CALL-FLOW] Starting video call to user ID: ${receiverId}, name: ${receiverName}`);
      
      // Verify login status before proceeding
      if (!verifyLoginStatus()) {
        console.error('[CALL-FLOW] Call canceled due to authentication issues');
        return;
      }
      
      // Reset for clean start
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      
      if (signalPollingRef.current) {
        clearInterval(signalPollingRef.current);
        signalPollingRef.current = null;
      }
      
      setConnectionAttempts(0);
      
      // Get user's media stream with proper constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: true 
      }).catch(err => {
        console.error('Error accessing media devices:', err);
        throw new Error(`Camera/microphone access failed: ${err.message}`);
      });
      
      if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
        throw new Error('Could not access camera - video tracks missing');
      }
      
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }
      
      setCallState({
        ...callState,
        isCallActive: true,
        receiver: { id: receiverId, name: receiverName },
      });
      
      // Create a peer connection with improved config for localhost
      try {
        console.log('Creating peer connection...');
        const peer = new SimplePeer({
          initiator: true,
          trickle: true, // Enable trickle ICE for better connectivity
          stream: mediaStream,
          reconnectTimer: 1000, // Reduced reconnect timer for localhost
          iceTransportPolicy: 'all',
          sdpSemantics: 'unified-plan',
          config: { 
            iceServers: [
              { 
                urls: [
                  'stun:stun.l.google.com:19302',
                  'stun:stun1.l.google.com:19302',
                  'stun:stun2.l.google.com:19302',  // Add more Google STUN servers
                  'stun:stun3.l.google.com:19302',
                  'stun:stun4.l.google.com:19302'
                ]
              },
              // Public TURN servers that work through most firewalls
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
          },
          offerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          }
        });
        
        // Add direct connection monitoring and debug logging
        const originalSignal = peer.signal;
        peer.signal = function(data) {
          console.log('Processing incoming signal:', data ? data.type : 'unknown');
          return originalSignal.apply(this, arguments);
        };
        
        // For faster direct connections on localhost, get and log ICE gathering states
        const pc = peer._pc;
        if (pc) {
          pc.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', pc.iceGatheringState);
          };
          
          pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
            
            // For localhost connections, we want to prioritize host candidates
            if (pc.iceConnectionState === 'checking') {
              console.log('Checking ICE candidates - ensuring localhost priority');
            }
            
            if (pc.iceConnectionState === 'failed') {
              console.log('ICE connection failed - trying to restart');
              try {
                pc.restartIce();
              } catch (err) {
                console.error('Error restarting ICE:', err);
              }
            }
          };
          
          // Log candidate generation
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('ICE candidate generated:', 
                event.candidate.candidate.indexOf('host') > -1 ? 'HOST' : 
                event.candidate.candidate.indexOf('srflx') > -1 ? 'REFLEXIVE' : 
                event.candidate.candidate.indexOf('relay') > -1 ? 'RELAY' : 'UNKNOWN');
            }
          };
        }
        
        // When the peer generates signal data
        peer.on('signal', async (data) => {
          console.log('Generated offer signal data, sending to receiver');
          console.log('Signal type:', data.type);
          
          try {
            const token = getAuthToken();
            const response = await makeApiCall('/video-call/signal', 'POST', {
              senderId: user.id,
              senderName: user.fullName || user.username,
              receiverId: receiverId,
              signal: data,
              type: 'offer'
            });
            
            if (!response.ok) {
              throw new Error(`Failed to send signal data: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('Signal sent successfully:', responseData);
          } catch (err) {
            console.error('Error sending signal:', err);
            setError('Failed to establish connection: ' + err.message);
          }
        });
        
        // When we receive a stream from the other peer
        peer.on('stream', (currentStream) => {
          console.log('Received remote stream', currentStream.id);
          console.log('Remote stream tracks:', currentStream.getTracks().length);
          
          setRemoteStream(currentStream);
          if (userVideo.current) {
            userVideo.current.srcObject = currentStream;
          }
        });
        
        // Monitor connection state
        peer.on('connect', () => {
          console.log('Peer connection established successfully!');
          // Reset connection attempts on successful connection
          setConnectionAttempts(0);
        });
        
        // Handle errors
        peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          setError('Connection error: ' + err.message);
          
          // Don't end the call on every error - some errors are recoverable
          if (err.code === 'ERR_WEBRTC_SUPPORT' || err.code === 'ERR_DATA_CHANNEL') {
            endCall();
          } else if (connectionAttempts < 3) {
            // Try to recreate the peer on certain errors
            setConnectionAttempts(prev => prev + 1);
            console.log(`Attempting to reconnect (${connectionAttempts + 1}/3)`);
            
            // Wait a moment and restart the call with exponential backoff
            const backoffTime = 1000 * Math.pow(2, connectionAttempts); // 1s, 2s, 4s
            console.log(`Waiting ${backoffTime}ms before reconnecting...`);
            
            setTimeout(() => {
              if (mediaStream) {
                startCall(receiverId, receiverName);
              }
            }, backoffTime);
          } else {
            console.log('Maximum reconnection attempts reached');
            endCall();
          }
        });
        
        // Handle connection closing
        peer.on('close', () => {
          console.log('Peer connection closed');
          
          // Check if this was intentional - don't end if we're just getting started
          if (connectionRef.current && connectionRef.current._connected) {
            endCall();
          } else {
            console.log('Connection closed before fully established - may be normal');
            
            // Only retry if not a deliberate close and under max attempts
            if (connectionAttempts < 3) {
              setConnectionAttempts(prev => prev + 1);
              console.log(`Attempting to reconnect (${connectionAttempts + 1}/3)`);
              
              // Wait a moment and restart the call with exponential backoff
              const backoffTime = 1000 * Math.pow(2, connectionAttempts); // 1s, 2s, 4s
              console.log(`Waiting ${backoffTime}ms before reconnecting...`);
              setTimeout(() => {
                if (mediaStream) {
                  startCall(receiverId, receiverName);
                }
              }, backoffTime);
            } else {
              console.log('Maximum reconnection attempts reached');
              endCall();
            }
          }
        });
        
        // Store the peer connection
        connectionRef.current = peer;
        
        // Start polling for answer signals
        startSignalPolling(receiverId);
        
      } catch (peerError) {
        console.error('Error creating peer connection:', peerError);
        setError('Failed to create WebRTC connection: ' + peerError.message);
        
        // Clean up media stream on peer creation failure
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
        
        setCallState({
          ...callState,
          isCallActive: false,
          callEnded: true,
        });
      }
      
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to access camera and microphone: ' + err.message);
      
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
      
      // Reset for clean start
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      
      if (signalPollingRef.current) {
        clearInterval(signalPollingRef.current);
        signalPollingRef.current = null;
      }
      
      setConnectionAttempts(0);
      
      // Get user's media stream if not already available
      let mediaStream = stream;
      if (!mediaStream) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user"
            }, 
            audio: true 
          });
          
          if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
            throw new Error('Could not access camera - video tracks missing');
          }
          
          setStream(mediaStream);
          if (myVideo.current) {
            myVideo.current.srcObject = mediaStream;
          }
        } catch (mediaError) {
          console.error('Error accessing media devices:', mediaError);
          setError('Camera/microphone access failed: ' + mediaError.message);
          return;
        }
      }
      
      setCallState({
        ...callState,
        callAccepted: true,
        isCallActive: true,
      });
      
      try {
        console.log('Creating answering peer connection...');
        
        const peer = new SimplePeer({
          initiator: false,
          trickle: true, // Enable trickle ICE for better connectivity
          stream: mediaStream,
          reconnectTimer: 1000, // Reduced for localhost
          iceTransportPolicy: 'all',
          sdpSemantics: 'unified-plan',
          config: { 
            iceServers: [
              { 
                urls: [
                  'stun:stun.l.google.com:19302',
                  'stun:stun1.l.google.com:19302',
                  'stun:stun2.l.google.com:19302',  // Add more Google STUN servers
                  'stun:stun3.l.google.com:19302',
                  'stun:stun4.l.google.com:19302'
                ]
              },
              // Public TURN servers that work through most firewalls
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
          },
          answerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          }
        });
        
        // Add direct connection monitoring and debug logging for answering peer
        const originalSignal = peer.signal;
        peer.signal = function(data) {
          console.log('Processing incoming signal (answering peer):', data ? data.type : 'unknown');
          return originalSignal.apply(this, arguments);
        };
        
        // Monitor ICE connection state changes on answering side
        const pc = peer._pc;
        if (pc) {
          pc.onicegatheringstatechange = () => {
            console.log('ICE gathering state (answering peer):', pc.iceGatheringState);
          };
          
          pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state (answering peer):', pc.iceConnectionState);
            
            if (pc.iceConnectionState === 'failed') {
              console.log('ICE connection failed (answering peer) - trying to restart');
              try {
                pc.restartIce();
              } catch (err) {
                console.error('Error restarting ICE:', err);
              }
            }
          };
          
          // Log candidate generation on answering side
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('ICE candidate generated (answering peer):', 
                event.candidate.candidate.indexOf('host') > -1 ? 'HOST' : 
                event.candidate.candidate.indexOf('srflx') > -1 ? 'REFLEXIVE' : 
                event.candidate.candidate.indexOf('relay') > -1 ? 'RELAY' : 'UNKNOWN');
            }
          };
        }
        
        // When the peer generates signal data (answer)
        peer.on('signal', async (data) => {
          console.log('Generated answer signal, sending back to caller');
          console.log('Answer signal type:', data.type);
          
          try {
            const token = getAuthToken();
            const response = await makeApiCall('/video-call/signal', 'POST', {
              senderId: user.id,
              senderName: user.fullName || user.username,
              receiverId: callState.caller.id,
              signal: data,
              type: 'answer'
            });
            
            if (!response.ok) {
              throw new Error(`Failed to send answer signal: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('Answer signal sent successfully:', responseData);
          } catch (err) {
            console.error('Error sending answer signal:', err);
            setError('Failed to establish connection: ' + err.message);
          }
        });
        
        // When we receive the caller's stream
        peer.on('stream', (currentStream) => {
          console.log('Received caller stream', currentStream.id);
          console.log('Caller stream tracks:', currentStream.getTracks().length);
          
          setRemoteStream(currentStream);
          if (userVideo.current) {
            userVideo.current.srcObject = currentStream;
          }
        });
        
        // Handle errors
        peer.on('error', (err) => {
          console.error('Peer connection error in answering peer:', err);
          setError('Connection error: ' + err.message);
          
          // Don't end the call on every error - some errors are recoverable
          if (err.code === 'ERR_WEBRTC_SUPPORT' || err.code === 'ERR_DATA_CHANNEL') {
            endCall();
          } else if (connectionAttempts < 3) {
            // Try to recreate the peer on certain errors
            setConnectionAttempts(prev => prev + 1);
            console.log(`Attempting to reconnect (${connectionAttempts + 1}/3)`);
            
            // Wait a moment and try again
            setTimeout(() => {
              if (mediaStream) {
                answerCall();
              }
            }, 2000);
          } else {
            console.log('Maximum reconnection attempts reached');
            endCall();
          }
        });
        
        // Handle connection closing
        peer.on('close', () => {
          console.log('Answering peer connection closed');
          
          // Check if this was intentional - don't end if we're just getting started
          if (connectionRef.current && connectionRef.current._connected) {
            endCall();
          } else {
            console.log('Connection closed before fully established - may be normal');
            
            // Only retry if not a deliberate close and under max attempts
            if (connectionAttempts < 3) {
              setConnectionAttempts(prev => prev + 1);
              console.log(`Attempting to reconnect (${connectionAttempts + 1}/3)`);
              
              // Wait a moment and restart the call with exponential backoff
              const backoffTime = 1000 * Math.pow(2, connectionAttempts); // 1s, 2s, 4s
              console.log(`Waiting ${backoffTime}ms before reconnecting...`);
              setTimeout(() => {
                if (mediaStream) {
                  answerCall();
                }
              }, backoffTime);
            } else {
              console.log('Maximum reconnection attempts reached');
              endCall();
            }
          }
        });
        
        // Signal the peer with the caller's signal data
        console.log('Signaling peer with caller data');
        peer.signal(callState.signal);
        
        // Store the peer connection
        connectionRef.current = peer;
        
        // Start polling for any additional signals
        startSignalPolling(callState.caller.id);
      
      } catch (peerError) {
        console.error('Error creating answering peer:', peerError);
        setError('Failed to create WebRTC connection: ' + peerError.message);
        
        // Clean up media stream on peer creation failure
        if (mediaStream && !stream) { // Only clean up if we created it here
          mediaStream.getTracks().forEach(track => track.stop());
        }
        
        setCallState({
          ...callState,
          callAccepted: false,
          isCallActive: false,
          callEnded: true,
        });
      }
      
    } catch (err) {
      console.error('Error answering call:', err);
      setError('Failed to establish connection: ' + err.message);
      
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
    console.log('Ending call');
    
    // Stop all tracks in the stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Close the peer connection
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    
    // Stop signal polling
    if (signalPollingRef.current) {
      clearInterval(signalPollingRef.current);
      signalPollingRef.current = null;
    }
    
    // Reset state
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
    setConnectionAttempts(0);
  };
  
  // Function to reject an incoming call
  const rejectCall = () => {
    console.log('Rejecting incoming call');
    
    // Optionally notify the caller that the call was rejected
    if (callState.caller) {
      try {
        const response = makeApiCall('/video-call/reject', 'POST', {
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
  
  // Poll for incoming signals (both call offers and answers)
  const startSignalPolling = (otherUserId) => {
    console.log(`Starting signal polling for user ID: ${otherUserId}`);
    
    // Clear any existing polling interval
    if (signalPollingRef.current) {
      clearInterval(signalPollingRef.current);
    }
    
    // Set up polling more frequently for localhost (500ms instead of 1000ms)
    signalPollingRef.current = setInterval(async () => {
      if (!user) return;
      
      try {
        const token = getAuthToken();
        const response = await makeApiCall('/video-call/get-signal', 'POST', {
          userId: user.id,
          fromUserId: otherUserId,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get signal data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.signal) {
          console.log('Received signal data:', data.type);
          
          // We received a signal, handle it
          if (connectionRef.current) {
            // If we have an active connection, this is likely an answer to our call
            console.log('Applying signal to existing connection, type:', 
              data.signal.type || 'candidate');
            connectionRef.current.signal(data.signal);
          } else if (data.type === 'offer') {
            // This is an incoming call
            console.log('Received incoming call offer');
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
        }
      } catch (err) {
        console.error('Error polling for signals:', err);
      }
    }, 500); // Reduced polling interval for localhost
  };
  
  // Check for incoming calls when user is logged in
  useEffect(() => {
    if (user && !callState.isCallActive && !signalPollingRef.current) {
      console.log('Starting general call polling for any incoming calls');
      
      // Start polling for incoming calls from any user
      signalPollingRef.current = setInterval(async () => {
        try {
          // First, normal check for calls
          const token = getAuthToken();
          const response = await makeApiCall('/video-call/check-calls', 'POST', {
            userId: user.id
          });
          
          if (!response.ok) {
            throw new Error(`Failed to check for calls: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.hasIncomingCall) {
            console.log('Detected incoming call:', data);
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
            clearInterval(signalPollingRef.current);
            startSignalPolling(data.callerId);
            return; // Exit early, we found a call
          }
          
          // Check active users for localhost environments to detect other browser tabs
          const activeResponse = await makeApiCall('/video-call/active-users', 'GET');
          
          if (activeResponse.ok) {
            const activeData = await activeResponse.json();
            console.log('Active users check:', activeData.count);
            
            // Localhost optimization - check debug status when multiple users are detected
            if (activeData.count > 1) {
              console.log('Multiple users detected, checking debug status');
              
              const debugResponse = await makeApiCall('/video-call/debug-status', 'GET');
              
              if (debugResponse.ok) {
                const debugData = await debugResponse.json();
                if (debugData.debug && debugData.debug.pendingCallsPerUser) {
                  const pendingCalls = debugData.debug.pendingCallsPerUser;
                  if (pendingCalls[user.id] && pendingCalls[user.id] > 0) {
                    console.log('Found pending calls in debug status, forcing refresh');
                    
                    // Force a refresh of the check-calls endpoint
                    setTimeout(async () => {
                      try {
                        const refreshResponse = await makeApiCall('/video-call/check-calls', 'POST', {
                          userId: user.id
                        });
                        
                        if (refreshResponse.ok) {
                          const refreshData = await refreshResponse.json();
                          if (refreshData.hasIncomingCall) {
                            console.log('Detected incoming call after refresh:', refreshData);
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
                            clearInterval(signalPollingRef.current);
                            startSignalPolling(refreshData.callerId);
                          }
                        }
                      } catch (err) {
                        console.error('Error in refresh check:', err);
                      }
                    }, 500);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Error checking for calls:', err);
        }
      }, 2000); // Polling interval
    }
    
    return () => {
      if (signalPollingRef.current) {
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
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      if (signalPollingRef.current) {
        clearInterval(signalPollingRef.current);
      }
    };
  }, [stream]);
  
  return (
    <VideoCallContext.Provider
      value={{
        callState,
        stream,
        remoteStream,
        error,
        myVideo,
        userVideo,
        startCall,
        answerCall,
        endCall,
        rejectCall,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider; 