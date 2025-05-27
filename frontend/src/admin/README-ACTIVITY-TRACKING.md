# User Activity Tracking and Real-Time Monitoring

This document explains the implementation of user activity tracking and the real-time monitoring dashboard.

## Overview

The system tracks user activity to provide administrators with real-time visibility into:

1. Total registered users in the system
2. Currently active users
3. User session information (device, location, IP)
4. Login history and trends

## Components

### 1. User Activity Tracker (`userActivityTracker.js`)

This module collects and sends user activity data to the backend:

- Tracks page views, clicks, and other interactions
- Collects device information and session duration
- Sends periodic heartbeats to maintain session status
- Records important events (login/logout, quiz attempts, etc.)

```javascript
// Initialize tracking when a user logs in
import { initActivityTracking, trackEvent } from '../services/userActivityTracker';

// Record specific events
trackEvent('quiz_submitted', { quizId: 123, score: 85 });
```

### 2. Device Detector (`deviceDetector.js`)

Identifies and categorizes user devices:

- Detects browser name and version
- Identifies operating system
- Determines if user is on mobile or desktop
- Generates device fingerprint for unique session identification

### 3. Admin Dashboard Integration

The admin dashboard displays real-time user activity:

- Shows total and active user counts
- Displays a table of online users with their details
- Provides login history analytics
- Auto-refreshes to show the latest data

## Backend Integration

The frontend connects to the following API endpoints:

1. `/admin/user-statistics` - Gets total/active user statistics
2. `/admin/active-users` - Lists currently active users with details
3. `/admin/login-history` - Retrieves login statistics over time
4. `/user-activity` - Endpoint where client activity data is posted

## How User Activity Is Collected

1. When a user logs in, a unique session ID is generated
2. User activity (page views, events) is tracked client-side
3. Periodic updates are sent to the backend (every 60 seconds)
4. Device information is collected on session start
5. The session is considered "active" as long as heartbeat signals continue

## Privacy Considerations

- IP addresses are only used for admin monitoring purposes
- Session data is automatically cleared after a configurable period
- Administrators can only see current activity, not historical user browsing patterns
- Activity tracking is limited to application-related actions, not specific content interactions

## Implementation Notes

### Dependencies

Make sure the following packages are installed:

```bash
npm install uuid axios
```

### Configuration

Activity tracking can be configured in the backend with these settings:

- `SESSION_TIMEOUT`: How long until an inactive user is considered offline (default: 15 minutes)
- `DATA_RETENTION`: How long to keep activity logs (default: 30 days)
- `HEARTBEAT_INTERVAL`: How often clients should send activity updates (default: 60 seconds)

## CORS and Security

The backend API must be properly configured to accept activity data from the frontend:

1. CORS headers must allow requests from the frontend domain
2. Authentication must be properly handled for admin endpoints
3. Rate limiting should be implemented to prevent abuse

## Example: Admin Dashboard Data Flow

1. Admin opens the dashboard
2. Frontend requests user statistics from `/admin/user-statistics`
3. Dashboard displays the overview metrics
4. Active users table automatically refreshes every 30 seconds
5. Admins can manually refresh data as needed

## Future Enhancements

- Real-time WebSocket connection for instant updates
- Geographic visualization of user locations
- Advanced analytics on user behavior patterns
- More detailed session recording capabilities 