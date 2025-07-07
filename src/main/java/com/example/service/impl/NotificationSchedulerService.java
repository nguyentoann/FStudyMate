package com.example.service.impl;

import com.example.model.Notification;
import com.example.model.ScheduledNotification;
import com.example.model.User;
import com.example.repository.ScheduledNotificationRepository;
import com.example.repository.UserRepository;
import com.example.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationSchedulerService.class);
    
    @Autowired
    private ScheduledNotificationRepository scheduledNotificationRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Schedule a notification for a specific user
     * 
     * @param userId User ID to send notification to
     * @param subject Subject/title of the notification
     * @param message Message content
     * @param scheduledDate Date and time to send the notification
     * @return The created scheduled notification
     */
    @Transactional
    public ScheduledNotification scheduleNotification(Long userId, String subject, String message, LocalDateTime scheduledDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        ScheduledNotification scheduledNotification = new ScheduledNotification(user, subject, message, scheduledDate);
        return scheduledNotificationRepository.save(scheduledNotification);
    }
    
    /**
     * Schedule notifications for multiple users
     * 
     * @param userIds List of user IDs
     * @param subject Subject/title of the notification
     * @param message Message content
     * @param scheduledDate Date and time to send the notification
     * @return Number of scheduled notifications created
     */
    @Transactional
    public int scheduleNotificationForUsers(List<Long> userIds, String subject, String message, LocalDateTime scheduledDate) {
        int count = 0;
        
        for (Long userId : userIds) {
            try {
                scheduleNotification(userId, subject, message, scheduledDate);
                count++;
            } catch (Exception e) {
                logger.error("Failed to schedule notification for user {}: {}", userId, e.getMessage());
            }
        }
        
        return count;
    }
    
    /**
     * Schedule notifications for all users with a specific role
     * 
     * @param role Role to target (e.g., "student", "lecturer")
     * @param subject Subject/title of the notification
     * @param message Message content
     * @param scheduledDate Date and time to send the notification
     * @return Number of scheduled notifications created
     */
    @Transactional
    public int scheduleNotificationForRole(String role, String subject, String message, LocalDateTime scheduledDate) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getRole().equalsIgnoreCase(role))
                .toList();
        
        int count = 0;
        
        for (User user : users) {
            try {
                scheduleNotification(user.getId(), subject, message, scheduledDate);
                count++;
            } catch (Exception e) {
                logger.error("Failed to schedule notification for user {}: {}", user.getId(), e.getMessage());
            }
        }
        
        return count;
    }
    
    /**
     * Schedule notifications for all students in a class
     * 
     * @param classId Class ID
     * @param subject Subject/title of the notification
     * @param message Message content
     * @param scheduledDate Date and time to send the notification
     * @return Number of scheduled notifications created
     */
    @Transactional
    public int scheduleNotificationForClass(String classId, String subject, String message, LocalDateTime scheduledDate) {
        List<User> studentsInClass = userRepository.findByClassId(classId).stream()
                .filter(user -> user.getRole().equalsIgnoreCase("student") || 
                               user.getRole().equalsIgnoreCase("outsrc_student"))
                .toList();
        
        int count = 0;
        
        for (User student : studentsInClass) {
            try {
                scheduleNotification(student.getId(), subject, message, scheduledDate);
                count++;
            } catch (Exception e) {
                logger.error("Failed to schedule notification for student {}: {}", student.getId(), e.getMessage());
            }
        }
        
        return count;
    }
    
    /**
     * Cancel a scheduled notification
     * 
     * @param scheduledNotificationId ID of the scheduled notification to cancel
     * @return true if successfully canceled, false otherwise
     */
    @Transactional
    public boolean cancelScheduledNotification(Long scheduledNotificationId) {
        try {
            scheduledNotificationRepository.deleteById(scheduledNotificationId);
            return true;
        } catch (Exception e) {
            logger.error("Failed to cancel scheduled notification {}: {}", scheduledNotificationId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Run every minute to check for notifications that need to be sent
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void processScheduledNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<ScheduledNotification> pendingNotifications = 
                scheduledNotificationRepository.findByScheduledDateBeforeAndSentFalse(now);
        
        logger.info("Processing {} scheduled notifications", pendingNotifications.size());
        
        for (ScheduledNotification scheduledNotification : pendingNotifications) {
            try {
                User user = scheduledNotification.getUser();
                
                // Create and send the actual notification
                Notification notification = notificationService.createNotification(
                        user.getId(), 
                        "SCHEDULED", 
                        scheduledNotification.getSubject(), 
                        scheduledNotification.getMessage(),
                        null,
                        null);
                
                if (notification != null) {
                    // Mark as sent
                    scheduledNotification.setSent(true);
                    scheduledNotificationRepository.save(scheduledNotification);
                    logger.info("Sent scheduled notification {} to user {}", scheduledNotification.getId(), user.getId());
                }
            } catch (Exception e) {
                logger.error("Error processing scheduled notification {}: {}", 
                        scheduledNotification.getId(), e.getMessage());
            }
        }
    }
    
    /**
     * Get all scheduled notifications (for admin)
     * 
     * @return List of all scheduled notifications
     */
    public List<ScheduledNotification> getAllScheduledNotifications() {
        return scheduledNotificationRepository.findAll();
    }
    
    /**
     * Get scheduled notifications for a specific user
     * 
     * @param userId User ID
     * @return List of scheduled notifications for the user
     */
    public List<ScheduledNotification> getScheduledNotificationsForUser(Long userId) {
        return scheduledNotificationRepository.findByUserIdOrderByScheduledDateAsc(userId);
    }
} 