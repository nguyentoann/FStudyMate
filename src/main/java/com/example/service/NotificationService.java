package com.example.service;

import com.example.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

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
    
    /**
     * Create a new notification for a user
     * 
     * @param userId User ID to send notification to
     * @param type Type of notification (SCHEDULE, TEST, MATERIAL, etc.)
     * @param title Notification title
     * @param message Notification message
     * @param link Optional link related to notification
     * @param resourceId Optional ID of related resource
     * @return Created notification
     */
    Notification createNotification(Long userId, String type, String title, String message, String link, Long resourceId);
    
    /**
     * Get all notifications for a user
     * 
     * @param userId User ID
     * @return List of notifications
     */
    List<Notification> getUserNotifications(Long userId);
    
    /**
     * Get paginated notifications for a user
     * 
     * @param userId User ID
     * @param pageable Pagination information
     * @return Paginated notifications
     */
    Page<Notification> getUserNotifications(Long userId, Pageable pageable);
    
    /**
     * Get unread notifications for a user
     * 
     * @param userId User ID
     * @return List of unread notifications
     */
    List<Notification> getUnreadNotifications(Long userId);
    
    /**
     * Count unread notifications for a user
     * 
     * @param userId User ID
     * @return Number of unread notifications
     */
    long countUnreadNotifications(Long userId);
    
    /**
     * Mark a notification as read
     * 
     * @param notificationId Notification ID
     * @return true if marked successfully
     */
    boolean markAsRead(Long notificationId);
    
    /**
     * Mark all notifications as read for a user
     * 
     * @param userId User ID
     * @return Number of notifications marked as read
     */
    int markAllAsRead(Long userId);
    
    /**
     * Delete a notification
     * 
     * @param notificationId Notification ID
     */
    void deleteNotification(Long notificationId);
    
    /**
     * Delete old notifications (older than specified days)
     * 
     * @param days Number of days
     * @return Number of notifications deleted
     */
    int deleteOldNotifications(int days);
    
    /**
     * Send notification to all users with a specific role
     * 
     * @param role The role to target (e.g., "student", "lecturer")
     * @param type Type of notification
     * @param title Notification title
     * @param message Notification message
     * @param link Optional link
     * @param resourceId Optional resource ID
     * @return List of created notifications
     */
    List<Notification> sendNotificationToRole(String role, String type, String title, String message, String link, Long resourceId);
    
    /**
     * Send notification to all students in a specific class
     * 
     * @param classId The class ID
     * @param type Type of notification
     * @param title Notification title
     * @param message Notification message
     * @param link Optional link
     * @param resourceId Optional resource ID
     * @return List of created notifications
     */
    List<Notification> sendNotificationToClass(String classId, String type, String title, String message, String link, Long resourceId);
    
    /**
     * Send notification to all users
     * 
     * @param type Type of notification
     * @param title Notification title
     * @param message Notification message
     * @param link Optional link
     * @param resourceId Optional resource ID
     * @return List of created notifications
     */
    List<Notification> sendNotificationToAll(String type, String title, String message, String link, Long resourceId);
} 