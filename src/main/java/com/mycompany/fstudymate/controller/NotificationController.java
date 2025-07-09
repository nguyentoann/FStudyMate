package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.NotificationDTO;
import com.mycompany.fstudymate.dto.NotificationRequest;
import com.mycompany.fstudymate.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    /**
     * Create a notification based on the request type
     */
    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@RequestBody NotificationRequest request) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer senderId = Integer.parseInt(auth.getName());
            
            NotificationDTO notification;
            
            // Create notification based on type
            switch (request.getNotificationType().toUpperCase()) {
                case "ALL":
                    notification = notificationService.createNotificationForAll(request, senderId);
                    break;
                case "ROLE":
                    notification = notificationService.createNotificationForRole(request, senderId);
                    break;
                case "CLASS":
                    notification = notificationService.createNotificationForClass(request, senderId);
                    break;
                case "USERS":
                    notification = notificationService.createNotificationForUsers(request, senderId);
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid notification type"
                    ));
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notification", notification
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "An error occurred while creating the notification"
            ));
        }
    }
    
    /**
     * Get notifications for the current user
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications() {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = Integer.parseInt(auth.getName());
            
            List<NotificationDTO> notifications = notificationService.getNotificationsForUser(userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notifications", notifications
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "An error occurred while retrieving notifications"
            ));
        }
    }
    
    /**
     * Get unread notifications for the current user
     */
    @GetMapping("/my/unread")
    public ResponseEntity<?> getMyUnreadNotifications() {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = Integer.parseInt(auth.getName());
            
            List<NotificationDTO> notifications = notificationService.getUnreadNotificationsForUser(userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notifications", notifications
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "An error occurred while retrieving unread notifications"
            ));
        }
    }
    
    /**
     * Count unread notifications for the current user
     */
    @GetMapping("/my/unread/count")
    public ResponseEntity<?> countMyUnreadNotifications() {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = Integer.parseInt(auth.getName());
            
            Long count = notificationService.countUnreadNotificationsForUser(userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", count
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "An error occurred while counting unread notifications"
            ));
        }
    }
    
    /**
     * Mark a notification as read
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable("id") Long notificationId) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = Integer.parseInt(auth.getName());
            
            boolean success = notificationService.markNotificationAsRead(notificationId, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification marked as read"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to mark notification as read"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "An error occurred while marking the notification as read"
            ));
        }
    }
    
    /**
     * Mark all notifications as read for the current user
     */
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllNotificationsAsRead() {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = Integer.parseInt(auth.getName());
            
            int count = notificationService.markAllNotificationsAsRead(userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", count,
                "message", count + " notifications marked as read"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "An error occurred while marking notifications as read"
            ));
        }
    }
} 