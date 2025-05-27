# Video Call Module Setup and Troubleshooting Guide

## Overview

The WebRTC video call module allows real-time video communication between users. This document provides setup instructions and troubleshooting tips.

## Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Proper session-based authentication setup
- Webcam and microphone permissions
- For localhost testing: both clients must be on the same network

## Setup Instructions

1. **Frontend Setup**:
   - Ensure the DirectWebRTCContext and VideoCallContext components are properly loaded
   - Verify authentication is working and session data is available

2. **Backend Setup**:
   - Make sure the VideoCallController endpoints are accessible
   - Check CORS configuration if testing across domains
   - For localhost testing, use the same port or configure CORS properly

3. **Testing Flow**:
   - Log in on both devices/browsers
   - Ensure user session data is properly stored
   - Accept camera/microphone permissions when prompted
   - Verify ICE candidates are being generated and sent

## Authentication Debugging

We've added new session debugging tools to help troubleshoot authentication issues:

### Using AuthDebugger Component

Add the AuthDebugger component to any page for interactive debugging:

```jsx
import { useState } from 'react';
import AuthDebugger from '../components/AuthDebugger';

function MyPage() {
  const [showDebugger, setShowDebugger] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowDebugger(!showDebugger)}>
        Toggle Auth Debugger
      </button>
      
      {showDebugger && <AuthDebugger onClose={() => setShowDebugger(false)} />}
      
      {/* Rest of your page */}
    </div>
  );
}
```

### Using AuthUtils in Console

For quick debugging in the browser console:

```javascript
// Run the debug function
window.debugVideoCall();  // Checks and logs session status

// Set debug session data if needed
window.setDebugSession(
  {role: "admin", fullName: "Test Admin"}, // User data
  "123"                                    // User ID
);

// Fix session storage inconsistencies
window.AuthUtils.fixSessionStorage();
```

## Common Issues and Troubleshooting

### Authentication Issues

**Symptoms**: "No user data found in storage" error, calls failing at authentication check

**Solutions**:
- Check for user session data in browser storage (localStorage/sessionStorage)
- Use the AuthDebugger component to diagnose and fix session issues
- Verify you're properly logged in
- Check if credentials: 'include' is set in API calls
- Use the verifyLoginStatus function before making calls

### Connection Issues

**Symptoms**: Call initiated but no incoming call detected on receiver

**Solutions**:
- Verify both users are on the same network for direct WebRTC connections
- Check for signaling data in debug-status endpoint
- Ensure both users have valid IDs and they're properly sent in the API calls
- Verify that the caller is seeing "Offer sent successfully" log
- Check for ICE candidate generation logs

### Media Issues

**Symptoms**: Call connects but no video/audio

**Solutions**:
- Check browser permissions for camera and microphone
- Verify tracks are being added to the peer connection
- Check browser console for media-related errors
- Try with simpler constraints (lower resolution)

## API Endpoints

- `/api/video-call/signal` - Send signaling data (offer/answer/ICE candidates)
- `/api/video-call/get-signal` - Retrieve signaling data for a specific user
- `/api/video-call/check-calls` - Check for pending incoming calls
- `/api/video-call/debug-status` - View debug information about signals and calls
- `/api/video-call/active-users` - Check which users are currently active in the system

## Debugging Tips

1. Look for "[CALL-FLOW]" prefixed logs in the console for detailed flow information
2. Use the debug-status endpoint to check if offers are properly stored
3. Monitor ICE connection state changes in the console
4. For localhost testing between browsers, prioritize "host" ICE candidates
5. Use the AuthDebugger to fix session storage issues and verify authentication

## Special Considerations for Localhost Testing

When testing on localhost between different browser tabs/windows:
- Use different user accounts (different user IDs)
- Keep debug console open on both tabs/windows
- Check the active-users endpoint to verify both users are detected
- Be aware of STUN server limitations in localhost environments
- Ensure both sides have proper session data set 