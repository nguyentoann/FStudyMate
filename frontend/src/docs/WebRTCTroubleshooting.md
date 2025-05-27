# WebRTC Video Call Troubleshooting Guide

This document provides guidance for troubleshooting WebRTC video call connectivity issues in the application.

## Common Issues and Solutions

### CORS Configuration Issues

**Symptoms:**
- Console errors with "Access to fetch at [...] has been blocked by CORS policy"
- API calls fail with `credentials: 'include'` but work with `credentials: 'omit'`

**Solutions:**
1. Check backend CORS configuration - ensure origins are explicitly specified (not wildcards) when using credentials
2. Use the WebRTCDebugger component to test CORS settings
3. Check if the backend has been restarted after CORS configuration changes

### Credential Handling Issues

**Symptoms:**
- HTTP 401 Unauthorized errors in console
- "No valid authentication token available" messages
- Calls initiate but the receiver doesn't get notifications

**Solutions:**
1. Verify session storage data via browser developer tools
2. Ensure consistent authentication mechanism (token vs. session-based)
3. Use the makeApiCall utility which handles fallbacks automatically

### ICE Candidate Issues

**Symptoms:**
- WebRTC peers connect but no video/audio is transmitted
- One-way audio/video
- Remote stream never appears
- Connection state remains "checking" or fails

**Solutions:**
1. Ensure STUN/TURN servers are correctly configured and accessible
2. Try a different network (some networks block UDP traffic used by WebRTC)
3. Check browser permissions for camera and microphone
4. Try disabling VPN or firewall software temporarily

## Debugging Tools

### WebRTCDebugger Component

Add the WebRTCDebugger component to your interface to see:
- Active users in the system
- Pending calls
- CORS test results
- Connection statistics

```jsx
import WebRTCDebugger from '../components/WebRTCDebugger';

// Then in your render method:
<WebRTCDebugger />
```

### Console Logging

Comprehensive logging has been implemented with tagged messages:
- `[CALL-FLOW]` for call signaling and flow control
- `[API]` for API calls and authentication

Enable "Preserve log" in DevTools to keep the logs when navigating or refreshing.

### Browser WebRTC Internals

Chrome provides detailed WebRTC statistics at:
```
chrome://webrtc-internals/
```

Firefox provides WebRTC debugging at:
```
about:webrtc
```

## Testing on Localhost with Multiple Users

1. Open the application in two different browsers (e.g., Chrome and Firefox)
2. Or use Chrome's incognito mode as a second user
3. Use the WebRTCDebugger to confirm both users are detected as active
4. Test call connection, with the WebRTCDebugger open to monitor signal flow

## Security Considerations

- WebRTC requires HTTPS in production (except on localhost)
- Camera/microphone permissions must be explicitly granted by the user
- Some corporate networks and VPNs block WebRTC traffic

## Additional Resources

- [WebRTC Samples](https://webrtc.github.io/samples/)
- [WebRTC Troubleshooter](https://test.webrtc.org/)
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) 