package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.dto.NotificationDTO;
import com.mycompany.fstudymate.dto.NotificationRequest;
import com.mycompany.fstudymate.model.Notification;

import java.util.List;

public interface NotificationService {
    
    /**
     * Create a notification for all users
     * 
     * @param request The notification request
     * @param senderId The ID of the sender
     * @return The created notification
     */
    NotificationDTO createNotificationForAll(NotificationRequest request, Integer senderId);
    
    /**
     * Create a notification for users with a specific role
     * 
     * @param request The notification request
     * @param senderId The ID of the sender
     * @return The created notification
     */
    NotificationDTO createNotificationForRole(NotificationRequest request, Integer senderId);
    
    /**
     * Create a notification for users in a specific class
     * 
     * @param request The notification request
     * @param senderId The ID of the sender
     * @return The created notification
     */
    NotificationDTO createNotificationForClass(NotificationRequest request, Integer senderId);
    
    /**
     * Create a notification for specific users
     * 
     * @param request The notification request
     * @param senderId The ID of the sender
     * @return The created notification
     */
    NotificationDTO createNotificationForUsers(NotificationRequest request, Integer senderId);
    
    /**
     * Get notifications for a specific user
     * 
     * @param userId The user ID
     * @return List of notifications
     */
    List<NotificationDTO> getNotificationsForUser(Integer userId);
    
    /**
     * Get unread notifications for a specific user
     * 
     * @param userId The user ID
     * @return List of unread notifications
     */
    List<NotificationDTO> getUnreadNotificationsForUser(Integer userId);
    
    /**
     * Count unread notifications for a specific user
     * 
     * @param userId The user ID
     * @return Number of unread notifications
     */
    Long countUnreadNotificationsForUser(Integer userId);
    
    /**
     * Mark a notification as read
     * 
     * @param notificationId The notification ID
     * @param userId The user ID
     * @return true if successful
     */
    boolean markNotificationAsRead(Long notificationId, Integer userId);
    
    /**
     * Mark all notifications as read for a user
     * 
     * @param userId The user ID
     * @return Number of notifications marked as read
     */
    int markAllNotificationsAsRead(Integer userId);
} 