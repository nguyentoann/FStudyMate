package com.example.service;

public interface NotificationService {
    
    /**
     * Send a notification to a user
     * 
     * @param userId The user ID
     * @param subject The notification subject
     * @param message The notification message
     * @return true if the notification was sent successfully
     */
    boolean sendNotification(Long userId, String subject, String message);
    
    /**
     * Send a notification to a user by email
     * 
     * @param email The user's email address
     * @param subject The notification subject
     * @param message The notification message
     * @return true if the notification was sent successfully
     */
    boolean sendNotificationByEmail(String email, String subject, String message);
} 