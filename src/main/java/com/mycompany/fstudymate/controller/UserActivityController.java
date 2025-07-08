package com.mycompany.fstudymate.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.fstudymate.dto.LoginHistoryDTO;
import com.mycompany.fstudymate.dto.UserActivityDTO;
import com.mycompany.fstudymate.dto.UserStatisticsDTO;
import com.mycompany.fstudymate.model.UserSession;
import com.mycompany.fstudymate.service.UserActivityService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000"}, allowCredentials = "true")
public class UserActivityController {

    private static final Logger logger = Logger.getLogger(UserActivityController.class.getName());

    @Autowired
    private UserActivityService userActivityService;
    
    /**
     * Endpoint for receiving user activity updates
     */
    @PostMapping("/user-activity")
    public ResponseEntity<Map<String, Object>> trackActivity(@RequestBody UserActivityDTO activityDTO) {
        try {
            logger.info("Received activity tracking request - sessionToken: " + activityDTO.getSessionToken());
            
            if (activityDTO.getSessionToken() == null || activityDTO.getSessionToken().trim().isEmpty()) {
                logger.warning("Invalid session token received");
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Session token is required"
                ));
            }
            
            UserSession session = userActivityService.saveActivity(activityDTO);
            
            if (session.getId() == null) {
                logger.warning("Failed to save session properly - no ID returned");
                // Return success anyway, but include a warning
                return ResponseEntity.ok(Map.of(
                    "status", "warning", 
                    "message", "Activity recorded but session not persisted properly",
                    "sessionToken", session.getSessionToken()
                ));
            }
            
            logger.info("Activity recorded successfully for session: " + session.getId());
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Activity recorded",
                "sessionId", session.getId()
            ));
        } catch (Exception e) {
            logger.severe("Error tracking activity: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Failed to record activity: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get user statistics for admin dashboard
     */
    @GetMapping("/admin/user-statistics")
    public ResponseEntity<UserStatisticsDTO> getUserStatistics() {
        try {
            logger.info("Fetching user statistics");
            UserStatisticsDTO stats = userActivityService.getUserStatistics();
            logger.info("User statistics fetched: " + stats.getTotalUsers() + " total, " + stats.getActiveUsers() + " active");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.severe("Error fetching user statistics: " + e.getMessage());
            // Return empty statistics on error
            return ResponseEntity.ok(new UserStatisticsDTO(0, 0, 0, 0));
        }
    }
    
    /**
     * Get list of currently active users
     */
    @GetMapping("/admin/active-users")
    public ResponseEntity<List<Map<String, Object>>> getActiveUsers() {
        try {
            logger.info("Fetching active users");
            List<Map<String, Object>> activeUsers = userActivityService.getActiveUsers();
            logger.info("Found " + activeUsers.size() + " active users");
            return ResponseEntity.ok(activeUsers);
        } catch (Exception e) {
            logger.severe("Error fetching active users: " + e.getMessage());
            // Return empty list on error
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Get list of expired sessions
     */
    @GetMapping("/admin/expired-sessions")
    public ResponseEntity<List<Map<String, Object>>> getExpiredSessions() {
        try {
            logger.info("Fetching expired sessions");
            List<Map<String, Object>> expiredSessions = userActivityService.getExpiredSessions();
            logger.info("Found " + expiredSessions.size() + " expired sessions");
            return ResponseEntity.ok(expiredSessions);
        } catch (Exception e) {
            logger.severe("Error fetching expired sessions: " + e.getMessage());
            // Return empty list on error
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Get list of sessions expiring soon
     */
    @GetMapping("/admin/expiring-sessions")
    public ResponseEntity<List<Map<String, Object>>> getSessionsExpiringSoon(
            @RequestParam(value = "hours", defaultValue = "6") int hours) {
        try {
            logger.info("Fetching sessions expiring in the next " + hours + " hours");
            List<Map<String, Object>> expiringSessions = userActivityService.getSessionsExpiringSoon(hours);
            logger.info("Found " + expiringSessions.size() + " sessions expiring soon");
            return ResponseEntity.ok(expiringSessions);
        } catch (Exception e) {
            logger.severe("Error fetching expiring sessions: " + e.getMessage());
            // Return empty list on error
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Get login history for the past X days
     */
    @GetMapping("/admin/login-history")
    public ResponseEntity<List<LoginHistoryDTO>> getLoginHistory(@RequestParam(defaultValue = "7") int days) {
        try {
            logger.info("Fetching login history for the past " + days + " days");
            List<LoginHistoryDTO> history = userActivityService.getLoginHistory(days);
            logger.info("Login history fetched: " + history.size() + " days of data");
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.severe("Error fetching login history: " + e.getMessage());
            // Return empty list on error
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Force logout a user session
     */
    @PostMapping("/admin/force-logout")
    public ResponseEntity<Map<String, Object>> forceLogout(@RequestBody Map<String, Object> requestBody) {
        try {
            Object sessionIdObj = requestBody.get("sessionId");
            if (sessionIdObj == null) {
                logger.warning("No sessionId provided for force logout");
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Session ID is required"
                ));
            }
            
            Integer sessionId;
            try {
                if (sessionIdObj instanceof Integer) {
                    sessionId = (Integer) sessionIdObj;
                } else if (sessionIdObj instanceof String) {
                    sessionId = Integer.parseInt((String) sessionIdObj);
                } else {
                    sessionId = Integer.valueOf(sessionIdObj.toString());
                }
            } catch (NumberFormatException e) {
                logger.warning("Invalid sessionId format: " + sessionIdObj);
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Invalid session ID format"
                ));
            }
            
            logger.info("Force logout requested for session: " + sessionId);
            boolean success = userActivityService.forceLogoutSession(sessionId);
            
            if (success) {
                logger.info("Successfully forced logout for session: " + sessionId);
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Session has been terminated"
                ));
            } else {
                logger.warning("Failed to force logout session: " + sessionId);
                return ResponseEntity.ok(Map.of(
                    "status", "error",
                    "message", "Failed to terminate session or session not found"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error forcing logout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Failed to force logout: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Validate if a session is still active and not expired
     */
    @GetMapping("/validate-session")
    public ResponseEntity<Map<String, Object>> validateSession(@RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Validating session with auth header: " + authHeader);
            
            // Extract session token from Authorization header
            String sessionToken = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                sessionToken = authHeader.substring(7);
            }
            
            if (sessionToken == null || sessionToken.trim().isEmpty()) {
                logger.warning("No session token provided for validation");
                return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "No session token provided"
                ));
            }
            
            // Check if the session exists and is not expired
            boolean isValid = userActivityService.isSessionValid(sessionToken);
            
            if (isValid) {
                logger.info("Session validated successfully: " + sessionToken);
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Session is valid"
                ));
            } else {
                logger.warning("Invalid or expired session: " + sessionToken);
                return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "Session is invalid or expired"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error validating session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Failed to validate session: " + e.getMessage()
            ));
        }
    }
} 