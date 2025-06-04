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
     * Get login history for specified number of days
     */
    @GetMapping("/admin/login-history")
    public ResponseEntity<List<LoginHistoryDTO>> getLoginHistory(@RequestParam(defaultValue = "7") int days) {
        try {
            logger.info("Fetching login history for " + days + " days");
            List<LoginHistoryDTO> loginHistory = userActivityService.getLoginHistory(days);
            logger.info("Found login history entries: " + loginHistory.size());
            return ResponseEntity.ok(loginHistory);
        } catch (Exception e) {
            logger.severe("Error fetching login history: " + e.getMessage());
            // Return empty list on error
            return ResponseEntity.ok(List.of());
        }
    }
} 