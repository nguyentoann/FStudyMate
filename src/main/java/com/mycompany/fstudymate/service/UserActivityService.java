package com.mycompany.fstudymate.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.fstudymate.model.UserSession;
import com.mycompany.fstudymate.model.UserActivityDetails;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.UserSessionRepository;
import com.mycompany.fstudymate.repository.UserActivityDetailsRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.dto.UserActivityDTO;
import com.mycompany.fstudymate.dto.UserStatisticsDTO;
import com.mycompany.fstudymate.dto.LoginHistoryDTO;

@Service
public class UserActivityService {

    private static final Logger logger = Logger.getLogger(UserActivityService.class.getName());

    @Autowired
    private UserSessionRepository userSessionRepository;
    
    @Autowired
    private UserActivityDetailsRepository userActivityDetailsRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Define how many minutes of inactivity before a session is considered inactive
    @Value("${activity.timeout.minutes:15}")
    private int activityTimeoutMinutes;
    
    /**
     * Cleanup method to run on application startup
     * Finds and fixes duplicate UserActivityDetails records
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void cleanupDuplicateActivityDetails() {
        logger.info("Running cleanup for duplicate UserActivityDetails records");
        
        // Get all sessions
        List<UserSession> allSessions = userSessionRepository.findAll();
        int cleanedCount = 0;
        
        for (UserSession session : allSessions) {
            List<UserActivityDetails> details = userActivityDetailsRepository.findAllBySessionId(session.getId());
            
            // If there are multiple records for the same session, keep only the most recent one
            if (details.size() > 1) {
                logger.info("Found " + details.size() + " activity details for session ID: " + session.getId());
                
                // Sort by created date (descending)
                details.sort((d1, d2) -> {
                    if (d1.getCreatedAt() == null) return 1;
                    if (d2.getCreatedAt() == null) return -1;
                    return d2.getCreatedAt().compareTo(d1.getCreatedAt());
                });
                
                // Keep the first one (most recent) and delete the rest
                UserActivityDetails mostRecent = details.get(0);
                logger.info("Keeping most recent record ID: " + mostRecent.getId() + 
                           " created at: " + mostRecent.getCreatedAt());
                
                for (int i = 1; i < details.size(); i++) {
                    UserActivityDetails toDelete = details.get(i);
                    logger.info("Deleting duplicate record ID: " + toDelete.getId() + 
                               " created at: " + toDelete.getCreatedAt());
                    userActivityDetailsRepository.delete(toDelete);
                    cleanedCount++;
                }
            }
        }
        
        logger.info("Cleanup completed. Removed " + cleanedCount + " duplicate activity detail records.");
    }
    
    /**
     * Save or update user activity based on session token
     */
    @Transactional
    public UserSession saveActivity(UserActivityDTO activityDTO) {
        logger.info("Received activity data: sessionToken=" + activityDTO.getSessionToken() + 
                   ", userId=" + activityDTO.getUserId() + 
                   ", currentPage=" + activityDTO.getCurrentPage() +
                   ", pageViews=" + activityDTO.getPageViews());
        
        try {
            // Find sessions by token
            List<UserSession> existingSessions = userSessionRepository.findBySessionToken(activityDTO.getSessionToken());
            UserSession session = null;
            
            if (existingSessions.isEmpty()) {
                // Create a new session if none exist
                logger.info("Creating new session for token: " + activityDTO.getSessionToken());
                session = new UserSession();
                session.setSessionToken(activityDTO.getSessionToken());
                session.setUserId(activityDTO.getUserId() != null ? activityDTO.getUserId() : 0); // Guest user
                session.setCreatedAt(LocalDateTime.now());
                session.setLastActivity(LocalDateTime.now()); 
            } else {
                // Handle the case of multiple sessions with same token
                if (existingSessions.size() > 1) {
                    logger.warning("Found " + existingSessions.size() + " sessions with token: " + 
                        activityDTO.getSessionToken() + ". Using the most recent one.");
                    
                    // Get ordered sessions by last activity
                    List<UserSession> orderedSessions = userSessionRepository.findBySessionTokenOrderByLastActivityDesc(activityDTO.getSessionToken());
                    if (!orderedSessions.isEmpty()) {
                        session = orderedSessions.get(0); // Get the first one (most recent)
                    } else {
                        session = existingSessions.get(0); // Fallback
                    }
                } else {
                    // Just one session found, use it
                    session = existingSessions.get(0);
                }
                
                logger.info("Updating existing session ID: " + session.getId() + " for user: " + session.getUserId());
            }
            
            // Update session data
            session.setLastActivity(LocalDateTime.now());
            session.setCurrentPage(activityDTO.getCurrentPage());
            session.setPageViews(activityDTO.getPageViews());
            session.setDuration(activityDTO.getDuration());
            session.setIpAddress(activityDTO.getIpAddress());
            
            // Save the session
            session = userSessionRepository.save(session);
            logger.info("Session saved successfully with ID: " + session.getId());
            
            // Return the session now, and handle device details in a separate transaction
            final Integer sessionId = session.getId();
            
            // Handle device details in a separate transaction if needed
            if (activityDTO.getDevice() != null && sessionId != null) {
                try {
                    saveActivityDetails(sessionId, activityDTO.getDevice());
                } catch (Exception e) {
                    // Log but don't fail the whole operation
                    logger.warning("Failed to save activity details: " + e.getMessage());
                }
            }
            
            return session;
        } catch (Exception e) {
            logger.severe("Error saving user activity: " + e.getMessage());
            e.printStackTrace();
            // Return a basic session to avoid null pointer exceptions in the controller
            UserSession errorSession = new UserSession();
            errorSession.setSessionToken(activityDTO.getSessionToken());
            return errorSession;
        }
    }
    
    /**
     * Save or update device-specific details
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void saveActivityDetails(Integer sessionId, Map<String, Object> deviceData) {
        try {
            // Skip if no valid session ID
            if (sessionId == null) {
                logger.warning("Cannot save activity details - null session ID");
                return;
            }
            
            // Get the most recent activity details or create a new one
            Optional<UserActivityDetails> existingDetails = userActivityDetailsRepository.findFirstBySessionIdOrderByCreatedAtDesc(sessionId);
            UserActivityDetails details = existingDetails.orElseGet(() -> {
                UserActivityDetails newDetails = new UserActivityDetails();
                newDetails.setSessionId(sessionId);
                return newDetails;
            });
            
            try {
                // Store serialized device info
                details.setDeviceInfo(objectMapper.writeValueAsString(deviceData));
                
                // Extract specific device fields
                if (deviceData.containsKey("browser")) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> browser = (Map<String, String>) deviceData.get("browser");
                    details.setBrowserName(browser.get("name"));
                    details.setBrowserVersion(browser.get("version"));
                }
                
                if (deviceData.containsKey("os")) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> os = (Map<String, String>) deviceData.get("os");
                    details.setOsName(os.get("name"));
                    details.setOsVersion(os.get("version"));
                }
                
                if (deviceData.containsKey("isMobile")) {
                    details.setIsMobile((Boolean) deviceData.get("isMobile"));
                }
                
                if (deviceData.containsKey("deviceFingerprint")) {
                    details.setDeviceFingerprint((String) deviceData.get("deviceFingerprint"));
                }
                
                userActivityDetailsRepository.save(details);
                logger.info("Device details saved for session ID: " + sessionId);
            } catch (JsonProcessingException e) {
                // Log error but continue
                logger.severe("Error serializing device info: " + e.getMessage());
            }
        } catch (Exception e) {
            logger.severe("Error in saveActivityDetails: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Get currently active users
     */
    public List<Map<String, Object>> getActiveUsers() {
        // Consider sessions active if they've had activity in the last X minutes
        LocalDateTime cutoffTime = LocalDateTime.now().minus(activityTimeoutMinutes, ChronoUnit.MINUTES);
        logger.info("Finding active sessions since: " + cutoffTime);
        
        List<UserSession> activeSessions = userSessionRepository.findActiveSessions(cutoffTime);
        logger.info("Found " + activeSessions.size() + " active sessions");
        
        return activeSessions.stream()
            .map(this::convertToUserMap)
            .collect(Collectors.toList());
    }
    
    /**
     * Get user statistics (total & active)
     */
    public UserStatisticsDTO getUserStatistics() {
        // Get active user count
        LocalDateTime cutoffTime = LocalDateTime.now().minus(activityTimeoutMinutes, ChronoUnit.MINUTES);
        Long activeSessions = userSessionRepository.countActiveSessions(cutoffTime);
        
        // Get total session count
        Long totalSessions = userSessionRepository.count();
        logger.info("Total sessions: " + totalSessions + ", Active sessions: " + activeSessions);
        
        // Get new users today
        LocalDateTime startOfToday = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        List<UserSession> newToday = userSessionRepository.findAll().stream()
                .filter(us -> us.getCreatedAt() != null && us.getCreatedAt().isAfter(startOfToday))
                .collect(Collectors.toList());
        
        // Calculate average session time (in minutes)
        double avgSessionTime = userSessionRepository.findAll().stream()
                .mapToInt(us -> us.getDuration() != null ? us.getDuration() : 0)
                .average()
                .orElse(0);
        
        UserStatisticsDTO stats = new UserStatisticsDTO();
        stats.setTotalUsers(totalSessions.intValue());
        stats.setActiveUsers(activeSessions.intValue());
        stats.setNewUsersToday(newToday.size());
        stats.setAverageSessionTime((int) Math.round(avgSessionTime));
        
        return stats;
    }
    
    /**
     * Get login history for the past X days
     */
    public List<LoginHistoryDTO> getLoginHistory(int days) {
        LocalDateTime startDate = LocalDateTime.now().minus(days, ChronoUnit.DAYS);
        
        List<Object[]> results = userSessionRepository.getLoginCountByDay(startDate);
        
        return results.stream()
                .map(row -> new LoginHistoryDTO((String)row[0], ((Number)row[1]).intValue()))
                .collect(Collectors.toList());
    }
    
    /**
     * Convert UserSession to a Map with selected fields, fetching related device details
     */
    private Map<String, Object> convertToUserMap(UserSession session) {
        Map<String, Object> userMap = new HashMap<>();
        
        userMap.put("id", session.getId());
        userMap.put("userId", session.getUserId());
        
        // Get user information from users table
        Optional<User> user = userRepository.findById(session.getUserId());
        if (user.isPresent()) {
            User u = user.get();
            userMap.put("username", u.getUsername());
            userMap.put("name", u.getFullName());
        } else {
            userMap.put("username", "user_" + session.getUserId());
            userMap.put("name", "Student " + session.getUserId());
        }
        
        userMap.put("activeTime", session.getDuration());
        userMap.put("lastActivity", session.getLastActivity());
        userMap.put("ipAddress", session.getIpAddress());
        
        // Get device info - use the most recent activity details
        Optional<UserActivityDetails> details = userActivityDetailsRepository.findFirstBySessionIdOrderByCreatedAtDesc(session.getId());
        if (details.isPresent()) {
            UserActivityDetails deviceDetails = details.get();
            String deviceString = (deviceDetails.getBrowserName() != null ? deviceDetails.getBrowserName() : "Unknown") + 
                    " " + (deviceDetails.getBrowserVersion() != null ? deviceDetails.getBrowserVersion() : "") + 
                    " / " + (deviceDetails.getOsName() != null ? deviceDetails.getOsName() : "Unknown") + 
                    " " + (deviceDetails.getOsVersion() != null ? deviceDetails.getOsVersion() : "");
            userMap.put("device", deviceString);
        } else {
            userMap.put("device", "Unknown");
        }
        
        // Page/location info
        userMap.put("location", session.getCurrentPage());
        
        return userMap;
    }
} 