# User Activity Monitoring System

This document explains the user activity monitoring system implemented in the FStudyMate application.

## Overview

The user activity monitoring system tracks user sessions and provides administrators with real-time visibility into:

1. User statistics (total users, active users, new users, average session time)
2. Active user sessions with device/browser information
3. User login history over time

## System Components

### Backend Components

1. **Entity Model**
   - `UserActivity.java` - JPA entity for storing user activity data
   
2. **Data Transfer Objects**
   - `UserActivityDTO.java` - For client-server communication
   - `UserStatisticsDTO.java` - For dashboard statistics
   - `LoginHistoryDTO.java` - For historical login data
   
3. **Repository Layer**
   - `UserActivityRepository.java` - JPA repository with custom queries for active users, statistics, etc.
   
4. **Service Layer**
   - `UserActivityService.java` - Business logic for processing and retrieving activity data
   
5. **REST Controller**
   - `UserActivityController.java` - Endpoints for recording activity and retrieving dashboard data

6. **Utilities**
   - `DeviceDataUtil.java` - Server-side utility for parsing client device information
   
7. **Security**
   - `SecurityConfig.java` - Spring Security configuration to secure admin endpoints
   - `CorsConfig.java` - CORS configuration for cross-origin requests

### Frontend Components

1. **Activity Tracking**
   - `userActivityTracker.js` - Client-side tracking of user activity
   - `deviceDetector.js` - Client-side detection of browser/device information
   
2. **Authentication Integration**
   - `AuthContext.js` - React context with user activity tracking integration
   
3. **Admin Dashboard**
   - `UserActivityDashboard.jsx` - React component for viewing activity data

## Database Schema

```sql
CREATE TABLE user_activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(255),
    session_id VARCHAR(100) NOT NULL,
    duration INTEGER,
    last_activity TIMESTAMP,
    current_page VARCHAR(255),
    page_views INTEGER,
    ip_address VARCHAR(50),
    device_info JSON,
    active BOOLEAN DEFAULT TRUE,
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    is_mobile BOOLEAN,
    device_fingerprint VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Database Integration

### Integration with Existing Database

The user activity monitoring system integrates with the existing database schema:

1. **Uses the existing `user_sessions` table** - Extended with additional columns for activity tracking:
   ```sql
   ALTER TABLE user_sessions
   ADD COLUMN current_page VARCHAR(255),
   ADD COLUMN page_views INTEGER DEFAULT 1,
   ADD COLUMN duration INTEGER DEFAULT 0,
   ADD COLUMN ip_address VARCHAR(50);
   ```

2. **Added a companion `user_activity_details` table** - Stores device-specific information:
   ```sql
   CREATE TABLE user_activity_details (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       session_id INT NOT NULL,
       device_info JSON,
       browser_name VARCHAR(100),
       browser_version VARCHAR(50),
       os_name VARCHAR(100),
       os_version VARCHAR(50),
       is_mobile BOOLEAN,
       device_fingerprint VARCHAR(100),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       
       FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE CASCADE,
       INDEX idx_session_id (session_id)
   );
   ```

3. **Links to existing `users` table** - User identity is maintained through the `user_id` field in the `user_sessions` table.

4. **Maintains session continuity** - Uses the existing `session_token` instead of creating a new identifier.

## API Endpoints

### Public Endpoints

- `POST /api/user-activity` - Records user activity data
  - No authentication required to allow anonymous users to be tracked

### Admin Endpoints (Secured)

- `GET /api/admin/user-statistics` - Gets overview statistics
- `GET /api/admin/active-users` - Gets currently active user sessions
- `GET /api/admin/login-history?days=7` - Gets login history for specified days

## How It Works

1. **Client-Side Tracking**
   - When a user loads the application, `userActivityTracker.js` initializes and generates a session ID
   - Activity data is sent periodically to the server (every 60 seconds)
   - Device/browser information is collected via `deviceDetector.js`
   - Page navigation, clicks, keypress, and scroll events are tracked
   - When the user logs in, their identity is linked to the session

2. **Server-Side Processing**
   - Activity data is stored in the `user_activity` table 
   - The system identifies unique sessions and updates them as users navigate
   - IP address and device information are processed and stored
   - Active sessions are determined by activity within the last N minutes (configurable)

3. **Admin Dashboard**
   - Administrators can view real-time statistics
   - Active user sessions show username, device, IP, location, last activity
   - Login history is displayed in a line chart

## Security Considerations

- Admin endpoints are secured with Spring Security (requires ADMIN role)
- Basic authentication is used for API endpoints (consider using JWT in production)
- CORS is configured to allow cross-origin requests from specific origins

## Configuration

The following parameters can be configured in `application.properties`:

```properties
# How many minutes of inactivity before a session is considered inactive
activity.timeout.minutes=15
```

## Future Enhancements

- Enhanced device fingerprinting
- Geo-location tracking
- User behavior analytics
- Security alerts for suspicious activity
- Session timeout management 