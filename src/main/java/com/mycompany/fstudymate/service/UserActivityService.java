package com.mycompany.fstudymate.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.logging.Logger;
import java.util.Comparator;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;

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
    
    // Define how many hours until a session expires (default 24 hours)
    @Value("${session.expiry.hours:24}")
    private int sessionExpiryHours;
    
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
     * Scheduled task to mark expired sessions
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @Transactional
    public void markExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<UserSession> expiredSessions = userSessionRepository.findAll().stream()
            .filter(session -> session.getExpiryTime() != null && now.isAfter(session.getExpiryTime()) && !session.getIsExpired())
            .collect(Collectors.toList());
        
        logger.info("Found " + expiredSessions.size() + " sessions to mark as expired");
        
        for (UserSession session : expiredSessions) {
            session.setIsExpired(true);
            userSessionRepository.save(session);
        }
        
        logger.info("Marked " + expiredSessions.size() + " sessions as expired");
    }
    
    /**
     * Scheduled task to clean up old expired sessions
     * Runs once a day at midnight
     * Keeps only the last 100 expired sessions and removes the rest
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    @Transactional
    public void cleanupOldExpiredSessions() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Find all expired sessions
            List<UserSession> expiredSessions = userSessionRepository.findExpiredSessions(now);
            
            // If we have more than 100 expired sessions, keep only the 100 most recent ones
            if (expiredSessions.size() > 100) {
                // Sort by expiry time descending (most recent first)
                expiredSessions.sort(Comparator.comparing(
                    UserSession::getExpiryTime, 
                    Comparator.nullsLast(Comparator.reverseOrder())
                ));
                
                // Get sessions to delete (all except the 100 most recent)
                List<UserSession> sessionsToDelete = expiredSessions.subList(100, expiredSessions.size());
                
                logger.info("Cleaning up old expired sessions. Total expired: " + 
                           expiredSessions.size() + ", keeping: 100, deleting: " + 
                           sessionsToDelete.size());
                
                // Delete the old sessions
                for (UserSession session : sessionsToDelete) {
                    userSessionRepository.delete(session);
                }
                
                logger.info("Successfully cleaned up " + sessionsToDelete.size() + " old expired sessions");
            } else {
                logger.info("No need to clean up expired sessions. Current count: " + expiredSessions.size());
            }
        } catch (Exception e) {
            logger.severe("Error cleaning up old expired sessions: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
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
                
                // Set expiry time to 24 hours from now
                session.setExpiryTime(LocalDateTime.now().plusHours(sessionExpiryHours));
                session.setIsExpired(false);
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
                
                // Check if session is expired
                if (session.getExpiryTime() != null && LocalDateTime.now().isAfter(session.getExpiryTime())) {
                    logger.info("Session " + session.getId() + " has expired. Creating a new session.");
                    
                    // Mark the old session as expired
                    session.setIsExpired(true);
                    userSessionRepository.save(session);
                    
                    // Create a new session
                    session = new UserSession();
                    session.setSessionToken(activityDTO.getSessionToken());
                    session.setUserId(activityDTO.getUserId() != null ? activityDTO.getUserId() : 0);
                    session.setCreatedAt(LocalDateTime.now());
                    session.setLastActivity(LocalDateTime.now());
                    session.setExpiryTime(LocalDateTime.now().plusHours(sessionExpiryHours));
                    session.setIsExpired(false);
                }
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
     * Get expired sessions for admin dashboard
     * Returns the most recent expired sessions first, limited to a maximum of 100 entries
     */
    public List<Map<String, Object>> getExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<UserSession> expiredSessions = userSessionRepository.findExpiredSessions(now);
        logger.info("Found " + expiredSessions.size() + " expired sessions");
        
        return expiredSessions.stream()
            .map(session -> {
                Map<String, Object> sessionMap = convertToUserMap(session);
                sessionMap.put("expiryTime", session.getExpiryTime());
                sessionMap.put("expiredAgo", ChronoUnit.MINUTES.between(session.getExpiryTime(), now));
                return sessionMap;
            })
            // Sort by expiry time (most recent first)
            .sorted(Comparator.comparing(
                map -> (LocalDateTime) map.get("expiryTime"),
                Comparator.nullsLast(Comparator.reverseOrder())
            ))
            // Limit to 100 entries to avoid overwhelming the admin dashboard
            .limit(100)
            .collect(Collectors.toList());
    }
    
    /**
     * Get sessions that will expire soon
     * Includes both active sessions and sessions with activity in the last 30 minutes
     */
    public List<Map<String, Object>> getSessionsExpiringSoon(int hours) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusHours(hours);
        
        // Find sessions that will expire within the specified hours
        List<UserSession> expiringSessions = userSessionRepository.findSessionsExpiringBetween(now, future);
        
        // Also include currently active sessions that have an expiry time set
        LocalDateTime activityCutoff = now.minus(30, ChronoUnit.MINUTES); // Consider sessions active if activity in last 30 min
        List<UserSession> activeSessions = userSessionRepository.findActiveSessions(activityCutoff);
        
        // Combine and filter the lists to include only sessions that will expire soon
        // and haven't already expired
        List<UserSession> combinedSessions = Stream.concat(
                expiringSessions.stream(),
                activeSessions.stream().filter(s -> 
                    s.getExpiryTime() != null && 
                    s.getExpiryTime().isAfter(now) && 
                    s.getExpiryTime().isBefore(future) &&
                    !s.getIsExpired()
                )
            )
            .distinct() // Remove duplicates
            .collect(Collectors.toList());
        
        logger.info("Found " + combinedSessions.size() + " sessions expiring in the next " + hours + " hours");
        
        return combinedSessions.stream()
            .map(session -> {
                Map<String, Object> sessionMap = convertToUserMap(session);
                sessionMap.put("expiryTime", session.getExpiryTime());
                sessionMap.put("expiresIn", ChronoUnit.MINUTES.between(now, session.getExpiryTime()));
                return sessionMap;
            })
            // Sort by expiry time (soonest first)
            .sorted(Comparator.comparing(
                map -> (Long) map.get("expiresIn")
            ))
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
        
        // Get expired sessions count
        Long expiredSessions = userSessionRepository.countExpiredSessions(LocalDateTime.now());
        
        UserStatisticsDTO stats = new UserStatisticsDTO();
        stats.setTotalUsers(totalSessions.intValue());
        stats.setActiveUsers(activeSessions.intValue());
        stats.setNewUsersToday(newToday.size());
        stats.setAverageSessionTime((int) Math.round(avgSessionTime));
        stats.setExpiredSessions(expiredSessions.intValue());
        
        return stats;
    }
    
    /**
     * Get login history for the past X days
     */
    public List<LoginHistoryDTO> getLoginHistory(int days) {
        LocalDateTime startDate = LocalDateTime.now().minus(days, ChronoUnit.DAYS);
        
        List<Object[]> results = userSessionRepository.getLoginCountByDay(startDate);
        
        return results.stream()
                .map(row -> {
                    // Handle java.sql.Date properly by converting to String
                    String dateStr;
                    if (row[0] instanceof java.sql.Date) {
                        dateStr = ((java.sql.Date) row[0]).toString();
                    } else if (row[0] instanceof String) {
                        dateStr = (String) row[0];
                    } else {
                        dateStr = row[0].toString();
                    }
                    
                    Integer count = ((Number) row[1]).intValue();
                    return new LoginHistoryDTO(dateStr, count);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Force logout a user session by ID
     * This will mark the session as expired and update the expiry time to now
     * 
     * @param sessionId The ID of the session to force logout
     * @return true if the session was found and logged out, false otherwise
     */
    @Transactional
    public boolean forceLogoutSession(Integer sessionId) {
        if (sessionId == null) {
            logger.warning("Cannot force logout null session ID");
            return false;
        }
        
        logger.info("Attempting to force logout session: " + sessionId);
        
        // Find the session by ID
        Optional<UserSession> sessionOpt = userSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            logger.warning("Session not found for force logout: " + sessionId);
            return false;
        }
        
        UserSession session = sessionOpt.get();
        
        // Mark session as expired and set expiry time to now
        session.setIsExpired(true);
        session.setExpiryTime(LocalDateTime.now());
        
        // Save the updated session
        userSessionRepository.save(session);
        
        logger.info("Successfully forced logout session: " + sessionId);
        return true;
    }
    
    /**
     * Check if a session is valid (exists and not expired)
     * 
     * @param sessionToken The session token to validate
     * @return true if the session is valid, false otherwise
     */
    public boolean isSessionValid(String sessionToken) {
        if (sessionToken == null || sessionToken.trim().isEmpty()) {
            logger.warning("Cannot validate null or empty session token");
            return false;
        }
        
        logger.info("Checking if session is valid: " + sessionToken);
        
        // Find sessions by token
        List<UserSession> sessions = userSessionRepository.findBySessionToken(sessionToken);
        
        if (sessions.isEmpty()) {
            logger.warning("No session found with token: " + sessionToken);
            return false;
        }
        
        // Check if any of the sessions is valid (not expired)
        LocalDateTime now = LocalDateTime.now();
        for (UserSession session : sessions) {
            if (!session.getIsExpired() && session.getExpiryTime().isAfter(now)) {
                logger.info("Valid session found: " + session.getId());
                return true;
            }
        }
        
        logger.warning("All sessions with token are expired: " + sessionToken);
        return false;
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
        userMap.put("createdAt", session.getCreatedAt());
        userMap.put("expiryTime", session.getExpiryTime());
        userMap.put("isExpired", session.getIsExpired());
        
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