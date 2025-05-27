import React from 'react';
import { useDirectWebRTC } from '../context/DirectWebRTCContext';
import styles from './VideoCall.module.css';

// Import icons for the call controls
import { ReactComponent as MicIcon } from '../assets/icons/mic.svg';
import { ReactComponent as MicOffIcon } from '../assets/icons/mic-off.svg';
import { ReactComponent as VideoIcon } from '../assets/icons/video.svg';
import { ReactComponent as VideoOffIcon } from '../assets/icons/video-off.svg';
import { ReactComponent as EndCallIcon } from '../assets/icons/end-call.svg';

const VideoCall = () => {
  const { 
    callState, 
    stream, 
    remoteStream, 
    myVideo, 
    userVideo, 
    endCall 
  } = useDirectWebRTC();
  
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

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

  // Get the name of the person we're calling or the caller
  const getOtherPersonName = () => {
    if (callState.isReceivingCall && callState.caller) {
      return callState.caller.name;
    } else if (callState.receiver) {
      return callState.receiver.name;
    }
    return 'Unknown';
  };

  // Only show the component when a call is active
  if (!callState.isCallActive) {
    return null;
  }

  return (
    <div className={styles.videoCallContainer}>
      <div className={styles.videoGrid}>
        {/* Remote video - the person we're talking to */}
        <div className={styles.remoteVideoContainer}>
          <video
            ref={userVideo}
            className={styles.remoteVideo}
            playsInline
            autoPlay
          />
          <div className={styles.remoteName}>{getOtherPersonName()}</div>
        </div>

        {/* Local video - ourselves */}
        <div className={styles.localVideoContainer}>
          <video
            ref={myVideo}
            className={styles.localVideo}
            playsInline
            autoPlay
            muted // Always mute our own video to prevent feedback
          />
          <div className={styles.localName}>You</div>
        </div>
      </div>

      {/* Call controls */}
      <div className={styles.controls}>
        <button 
          className={`${styles.controlButton} ${isMuted ? styles.controlButtonOff : ''}`}
          onClick={toggleAudio} 
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </button>
        <button 
          className={`${styles.controlButton} ${styles.endCallButton}`}
          onClick={endCall}
          title="End Call"
        >
          <EndCallIcon />
        </button>
        <button 
          className={`${styles.controlButton} ${isVideoOff ? styles.controlButtonOff : ''}`}
          onClick={toggleVideo}
          title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
        >
          {isVideoOff ? <VideoOffIcon /> : <VideoIcon />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall; 