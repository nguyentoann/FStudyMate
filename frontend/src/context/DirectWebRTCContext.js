import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// Create context
const DirectWebRTCContext = createContext();

// Export the hook to use this context
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
  
  // Media streams
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [connected, setConnected] = useState(false);
  
  // Camera selection
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isLoadingCameras, setIsLoadingCameras] = useState(false);
  
  // References
  const myVideo = useRef();
  const userVideo = useRef();
  const peerConnectionRef = useRef(null);
  const stompClientRef = useRef(null);
  const remoteIdRef = useRef(null);
  
  // ICE Server configuration
  const iceServers = {
    iceServers: [{
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
    }]
  };
  
  // Initialize WebSocket connection only (not media devices)
  useEffect(() => {
    // Only connect to WebSocket server if user is logged in
    if (user && user.id) {
      connectToSignalingServer();
      // Load available cameras but don't activate them yet
      loadAvailableCameras();
    }
    
    return () => {
      // Clean up
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, [user]);
  
  // Load available cameras
  const loadAvailableCameras = async () => {
    try {
      setIsLoadingCameras(true);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error('[WebRTC] Media devices not supported');
        setError('Your browser does not support media devices');
        setIsLoadingCameras(false);
        return;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      console.log('[WebRTC] Available cameras:', cameras);
      setAvailableCameras(cameras);
      
      // Set default camera (usually the first one)
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
      
      setIsLoadingCameras(false);
    } catch (err) {
      console.error('[WebRTC] Error loading cameras:', err);
      setError('Failed to load available cameras');
      setIsLoadingCameras(false);
    }
  };
  
  // Switch to a different camera
  const switchCamera = async (deviceId) => {
    try {
      console.log('[WebRTC] Switching to camera:', deviceId);
      
      // Stop current tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Set the selected camera
      setSelectedCamera(deviceId);
      
      // If in a call, immediately switch the camera
      if (callState.isCallActive) {
        const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: { exact: deviceId } },
          audio: true 
        });
        
        setStream(newStream);
        
        if (myVideo.current) {
          myVideo.current.srcObject = newStream;
        }
        
        // Replace tracks in the peer connection
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
          
          if (videoSender) {
            const videoTrack = newStream.getVideoTracks()[0];
            videoSender.replaceTrack(videoTrack);
          }
        }
      }
      
      return true;
    } catch (err) {
      console.error('[WebRTC] Error switching camera:', err);
      setError('Failed to switch camera: ' + err.message);
      return false;
    }
  };
  
  // Setup media devices with fallback
  const setupMediaDevices = async () => {
    try {
      console.log('[WebRTC] Setting up media devices');
      
      // Try with the selected camera first
      if (selectedCamera) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              deviceId: { exact: selectedCamera },
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
          
          // Initialize peer connection
          peerConnectionRef.current = new RTCPeerConnection(iceServers);
          
          console.log('[WebRTC] Media devices set up successfully with selected camera');
          return mediaStream;
        } catch (err) {
          console.warn('[WebRTC] Failed to use selected camera, trying fallback:', err);
          // Continue to fallback
        }
      }
      
      // Try to find an available camera if the selected one failed
      if (availableCameras.length > 1) {
        for (const camera of availableCameras) {
          if (camera.deviceId !== selectedCamera) {
            try {
              const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                  deviceId: { exact: camera.deviceId },
                  width: { ideal: 640 },
                  height: { ideal: 480 }
                },
                audio: true 
              });
              
              // Update the selected camera
              setSelectedCamera(camera.deviceId);
              setStream(mediaStream);
              
              if (myVideo.current) {
                myVideo.current.srcObject = mediaStream;
              }
              
              // Initialize peer connection
              peerConnectionRef.current = new RTCPeerConnection(iceServers);
              
              console.log('[WebRTC] Media devices set up successfully with fallback camera');
              return mediaStream;
            } catch (cameraErr) {
              console.warn(`[WebRTC] Failed to use camera ${camera.deviceId}:`, cameraErr);
              // Try the next camera
            }
          }
        }
      }
      
      // If all cameras with deviceId failed, try without specifying deviceId
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }
      
      // Initialize peer connection
      peerConnectionRef.current = new RTCPeerConnection(iceServers);
      
      console.log('[WebRTC] Media devices set up successfully with default camera');
      return mediaStream;
    } catch (err) {
      setError('Error accessing camera and microphone: ' + err.message);
      console.error('[WebRTC] Error accessing media devices:', err);
      
      // Try audio only as last resort
      try {
        console.log('[WebRTC] Trying audio only mode');
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ 
          video: false,
          audio: true 
        });
        
        setStream(audioOnlyStream);
        setError('Video unavailable. Audio only mode enabled.');
        
        // Initialize peer connection
        peerConnectionRef.current = new RTCPeerConnection(iceServers);
        
        return audioOnlyStream;
      } catch (audioErr) {
        setError('Could not access microphone or camera. Please check your device permissions.');
        console.error('[WebRTC] Audio only mode failed:', audioErr);
        return null;
      }
    }
  };
  
  // Connect to signaling server
  const connectToSignalingServer = () => {
    if (!user || !user.id) {
      setError('You must be logged in to use WebRTC calls');
      return;
    }
    
    try {
      console.log('[WebRTC] Connecting to signaling server');
      // Connect to WebSocket server
      const socket = new SockJS('http://localhost:8080/websocket');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect({}, () => {
        console.log('[WebRTC] Connected to WebRTC WebSocket server');
        setConnected(true);
        stompClientRef.current = stompClient;
        
        // Add user to WebRTC system
        stompClient.send('/app/addUser', {}, String(user.id));
        
        // Subscribe to call notifications
        stompClient.subscribe(`/user/${user.id}/topic/call`, handleIncomingCall);
        
        // Subscribe to WebRTC signaling
        stompClient.subscribe(`/user/${user.id}/topic/offer`, handleOffer);
        stompClient.subscribe(`/user/${user.id}/topic/answer`, handleAnswer);
        stompClient.subscribe(`/user/${user.id}/topic/candidate`, handleIceCandidate);
        
      }, error => {
        setError('Failed to connect to WebRTC server: ' + error);
        console.error('[WebRTC] WebSocket connection error:', error);
      });
    } catch (err) {
      setError('Error setting up WebRTC connection: ' + err.message);
      console.error('[WebRTC] Error connecting to WebSocket:', err);
    }
  };
  
  // Handle incoming call
  const handleIncomingCall = (message) => {
    const callerId = String(message.body);
    console.log(`[WebRTC] Incoming call from: ${callerId}`);
    
    // Set the caller ID as remote ID
    remoteIdRef.current = callerId;
    
    // Update call state with more detailed logging
    console.log('[WebRTC] Setting call state for incoming call from:', callerId);
    
    setCallState(prevState => {
      const newState = {
        isReceivingCall: true,
        isCallActive: false,
        caller: { id: callerId, name: callerId }, // Using ID as name if name is not provided
        callAccepted: false,
        callEnded: false
      };
      
      console.log('[WebRTC] Previous call state:', prevState);
      console.log('[WebRTC] New call state:', newState);
      
      return newState;
    });
    
    // Setup media immediately to prevent delay when answering call
    setupMediaDevices().catch(err => {
      console.error('[WebRTC] Error setting up media devices for incoming call:', err);
    });
  };
  
  // Handle WebRTC offer
  const handleOffer = async (message) => {
    console.log('[WebRTC] Received offer');
    const offerData = JSON.parse(message.body);
    const offer = offerData.offer;
    
    // Set the remote ID
    remoteIdRef.current = String(offerData.fromUser);
    
    // Initialize media devices if not already done
    let mediaStream = stream;
    if (!mediaStream) {
      console.log('[WebRTC] Setting up media devices for incoming offer');
      mediaStream = await setupMediaDevices();
      if (!mediaStream) {
        console.error('[WebRTC] Failed to set up media devices for incoming offer');
        return;
      }
    }
    
    // Reset and recreate peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    peerConnectionRef.current = new RTCPeerConnection(iceServers);
    
    // Set up peer connection handlers
    setupPeerConnectionHandlers();
    
    // Add local tracks to peer connection (avoid duplicates)
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        console.log(`[WebRTC] Adding ${track.kind} track to peer connection`);
        try {
          peerConnectionRef.current.addTrack(track, mediaStream);
    } catch (err) {
          console.error('[WebRTC] Error adding track to peer connection:', err);
        }
      });
    } else {
      console.error('[WebRTC] No media stream available when handling offer');
      setError('Failed to access camera and microphone');
      return;
    }
    
    try {
      // Set remote description and create answer
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const description = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(description);
      
      // Send answer
      stompClientRef.current.send('/app/answer', {}, JSON.stringify({
        toUser: String(remoteIdRef.current),
        fromUser: String(user.id),
        answer: description
      }));
      
      // Update call state to show the incoming call as active if it was accepted
      if (callState.callAccepted) {
        setCallState(prevState => ({
          ...prevState,
          isCallActive: true
        }));
      }
    } catch (err) {
      setError('Error creating answer: ' + err.message);
      console.error('[WebRTC] Error handling offer:', err);
    }
  };
  
  // Handle WebRTC answer
  const handleAnswer = (message) => {
    console.log('[WebRTC] Received answer');
    const answerData = JSON.parse(message.body);
    const answer = answerData.answer;
    
    if (!peerConnectionRef.current) {
      console.error('[WebRTC] Received answer but peer connection is null');
      return;
    }
    
    peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      .then(() => {
        console.log('[WebRTC] Remote description set successfully');
      })
      .catch(err => {
        setError('Error setting remote description: ' + err.message);
        console.error('[WebRTC] Error handling answer:', err);
      });
  };
  
  // Handle ICE candidates
  const handleIceCandidate = (message) => {
    console.log('[WebRTC] Received ICE candidate');
    const candidateData = JSON.parse(message.body);
    const candidate = candidateData.candidate;
    
    if (!peerConnectionRef.current) {
      console.error('[WebRTC] Received ICE candidate but peer connection is null');
      return;
    }
    
    const iceCandidate = new RTCIceCandidate({
      sdpMLineIndex: candidate.lable,
      candidate: candidate.id
    });
    
    peerConnectionRef.current.addIceCandidate(iceCandidate)
      .then(() => {
        console.log('[WebRTC] Added ICE candidate successfully');
      })
      .catch(err => {
        setError('Error adding ICE candidate: ' + err.message);
        console.error('[WebRTC] Error handling ICE candidate:', err);
      });
  };
  
  // Set up peer connection handlers
  const setupPeerConnectionHandlers = () => {
    const pc = peerConnectionRef.current;
    
    if (!pc) {
      console.error('[WebRTC] Cannot set up handlers - peer connection is null');
      return;
    }
    
    // Handle track events (when remote streams arrive)
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      
      // Create remote stream if it doesn't exist
      const newRemoteStream = new MediaStream();
      
      // Add all tracks from the event to the remote stream
      event.streams[0].getTracks().forEach(track => {
        newRemoteStream.addTrack(track);
      });
      
      // Set remote stream and connect it to the video element
      setRemoteStream(newRemoteStream);
      
      if (userVideo.current) {
        userVideo.current.srcObject = newRemoteStream;
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && remoteIdRef.current) {
        console.log('[WebRTC] Generated ICE candidate');
        
        const candidate = {
          type: 'candidate',
          lable: event.candidate.sdpMLineIndex,
          id: event.candidate.candidate,
        };
        
        stompClientRef.current.send('/app/candidate', {}, JSON.stringify({
          toUser: String(remoteIdRef.current),
          fromUser: String(user.id),
          candidate: candidate
        }));
      }
    };
    
    // Connection state change handler
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state changed:', pc.connectionState);
      
      switch (pc.connectionState) {
        case 'connected':
          setConnectionStatus('connected');
          break;
        case 'disconnected':
        case 'failed':
          setConnectionStatus('failed');
          break;
        case 'closed':
          setConnectionStatus('closed');
          break;
        default:
          break;
      }
    };
    
    // Ice connection state change handler
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state changed:', pc.iceConnectionState);
    };
  };
  
  // Start a call
  const startCall = async (receiverId, receiverName) => {
    try {
      console.log(`[WebRTC] Starting call to ${receiverName} (${receiverId})`);
      
      if (!user || !user.id) {
        setError('You must be logged in to make calls');
        return;
      }
      
      if (!connected) {
        // Connect to signaling server if not already connected
        connectToSignalingServer();
        return;
      }
      
      // Initialize media devices if not already done
      let mediaStream = stream;
      if (!mediaStream) {
        mediaStream = await setupMediaDevices();
        if (!mediaStream) {
          console.error('[WebRTC] Failed to set up media devices for outgoing call');
          return;
        }
      }
      
      // Ensure receiverId is a string
      const receiverIdStr = String(receiverId);
      
      // Set receiver in call state
      setCallState({
        isCallActive: true,
        isReceivingCall: false,
        receiver: { id: receiverIdStr, name: receiverName },
        callAccepted: true,
        callEnded: false,
      });
      
      // Store remote ID
      remoteIdRef.current = receiverIdStr;
      
      // Reset and recreate peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      peerConnectionRef.current = new RTCPeerConnection(iceServers);
      
      // Set up connection handlers
      setupPeerConnectionHandlers();
      
      // Add local tracks to peer connection
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          try {
            console.log(`[WebRTC] Adding ${track.kind} track to peer connection for outgoing call`);
            peerConnectionRef.current.addTrack(track, mediaStream);
          } catch (err) {
            console.error('[WebRTC] Error adding track to peer connection:', err);
          }
        });
      } else {
        console.error("[WebRTC] No local stream available to add tracks");
        setError("Failed to access camera and microphone");
        return;
      }
      
      // Send call request
      stompClientRef.current.send('/app/call', {}, JSON.stringify({
        callTo: receiverIdStr,
        callFrom: String(user.id)
      }));
      
      // Create and send offer
      try {
        const description = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(description);
        
        stompClientRef.current.send('/app/offer', {}, JSON.stringify({
          toUser: receiverIdStr,
          fromUser: String(user.id),
          offer: description
        }));
        
        console.log('[WebRTC] Sent offer to:', receiverIdStr);
      } catch (err) {
        setError('Error creating offer: ' + err.message);
        console.error('[WebRTC] Error creating offer:', err);
      }
      
    } catch (err) {
      setError('Failed to start call: ' + err.message);
      console.error('[WebRTC] Error starting call:', err);
    }
  };
  
  // Answer incoming call
  const answerCall = async () => {
    try {
      console.log('[WebRTC] Answering call from:', callState.caller?.id);
      
      // Initialize media devices if not already done
      let mediaStream = stream;
      if (!mediaStream) {
        mediaStream = await setupMediaDevices();
        if (!mediaStream) {
          console.error('[WebRTC] Failed to set up media devices when answering call');
          return;
        }
      }
      
      // Update call state
      setCallState(prevState => ({
        ...prevState,
        isCallActive: true,
        callAccepted: true,
        isReceivingCall: false,
      }));
      
    } catch (err) {
      setError('Failed to answer call: ' + err.message);
      console.error('[WebRTC] Error answering call:', err);
    }
  };
  
  // End current call
  const endCall = () => {
    console.log('[WebRTC] Ending call');
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear remote stream
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
    
    // Reset call state
            setCallState({
      isReceivingCall: false,
      isCallActive: false,
      caller: null,
      receiver: null,
      callAccepted: false,
      callEnded: true,
    });
    
    // Clear remote ID
    remoteIdRef.current = null;
    
    setRemoteStream(null);
  };
  
  // Reject incoming call
  const rejectCall = () => {
    console.log('[WebRTC] Rejecting call from:', callState.caller?.id);
    
    // Reset call state
                        setCallState({
      isReceivingCall: false,
      isCallActive: false,
      caller: null,
      receiver: null,
      callAccepted: false,
      callEnded: true,
    });
    
    // Clear remote ID
    remoteIdRef.current = null;
  };
  
  // Context value
  const contextValue = {
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
    // Camera selection
    availableCameras,
    selectedCamera,
    isLoadingCameras,
    loadAvailableCameras,
    switchCamera
  };
  
  return (
    <DirectWebRTCContext.Provider value={contextValue}>
      {children}
    </DirectWebRTCContext.Provider>
  );
};

export default DirectWebRTCProvider; 