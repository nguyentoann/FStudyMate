package com.example.controller;

import com.example.model.Notification;
import com.example.model.User;
import com.example.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String subject = (String) request.get("subject");
        String message = (String) request.get("message");
        
        if (userId == null || subject == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User ID, subject, and message are required"
            ));
        }
        
        boolean sent = notificationService.sendNotification(userId, subject, message);
        
        if (sent) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification sent successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to send notification"
            ));
        }
    }
    
    @PostMapping("/send-by-email")
    public ResponseEntity<?> sendNotificationByEmail(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String subject = (String) request.get("subject");
        String message = (String) request.get("message");
        
        if (email == null || subject == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Email, subject, and message are required"
            ));
        }
        
        boolean sent = notificationService.sendNotificationByEmail(email, subject, message);
        
        if (sent) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification sent successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to send notification"
            ));
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        Long resourceId = request.get("resourceId") != null ? Long.valueOf(request.get("resourceId").toString()) : null;
        
        if (userId == null || type == null || title == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User ID, type, title, and message are required"
            ));
        }
        
        Notification notification = notificationService.createNotification(userId, type, title, message, link, resourceId);
        
        if (notification != null) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notification", notification
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to create notification"
            ));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getUserNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<?> getPaginatedNotifications(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User user = (User) auth.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationsPage = notificationService.getUserNotifications(user.getId(), pageable);
        
        return ResponseEntity.ok(Map.of(
            "notifications", notificationsPage.getContent(),
            "currentPage", notificationsPage.getNumber(),
            "totalItems", notificationsPage.getTotalElements(),
            "totalPages", notificationsPage.getTotalPages()
        ));
    }
    
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications(user.getId());
        
        return ResponseEntity.ok(unreadNotifications);
    }
    
    @GetMapping("/count-unread")
    public ResponseEntity<?> countUnreadNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        long count = notificationService.countUnreadNotifications(user.getId());
        
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        boolean marked = notificationService.markAsRead(id);
        
        if (marked) {
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
    }
    
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        User user = (User) auth.getPrincipal();
        int count = notificationService.markAllAsRead(user.getId());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", count,
            "message", count + " notifications marked as read"
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification deleted"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to delete notification"
            ));
        }
    }
    
    @DeleteMapping("/clear-old/{days}")
    public ResponseEntity<?> clearOldNotifications(@PathVariable int days) {
        int count = notificationService.deleteOldNotifications(days);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", count,
            "message", count + " old notifications deleted"
        ));
    }
} 