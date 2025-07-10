package com.mycompany.fstudymate.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mycompany.fstudymate.dto.NotificationRequest;
import com.mycompany.fstudymate.dto.NotificationResponse;
import com.mycompany.fstudymate.model.Notification;

public interface NotificationService {
    
    // Create a new notification
    NotificationResponse createNotification(NotificationRequest notificationRequest);
    
    // Create a notification with file attachment
    NotificationResponse createNotificationWithAttachment(NotificationRequest notificationRequest, MultipartFile file);
    
    // Get notifications for a user
    List<NotificationResponse> getNotificationsForUser(Integer userId);
    
    // Get unread notifications for a user
    List<NotificationResponse> getUnreadNotificationsForUser(Integer userId);
    
    // Count unread notifications for a user
    Long countUnreadNotifications(Integer userId);
    
    // Mark a notification as read for a user
    NotificationResponse markNotificationAsRead(Integer notificationId, Integer userId);
    
    // Mark all notifications as read for a user
    List<NotificationResponse> markAllNotificationsAsRead(Integer userId);
    
    // Delete a notification (only by sender or admin)
    void deleteNotification(Integer notificationId, Integer userId);
    
    // Get notifications sent by a user
    List<NotificationResponse> getNotificationsSentByUser(Integer userId);
    
    // Unsend a notification
    NotificationResponse unsendNotification(Integer notificationId, Integer senderId);
    
    // Get notification by id
    NotificationResponse getNotificationById(Integer notificationId);
} 