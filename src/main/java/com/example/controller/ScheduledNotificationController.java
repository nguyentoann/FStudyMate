package com.example.controller;

import com.example.model.ScheduledNotification;
import com.example.model.User;
import com.example.service.impl.NotificationSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scheduled-notifications")
public class ScheduledNotificationController {

    @Autowired
    private NotificationSchedulerService schedulerService;

    /**
     * Schedule a notification for a specific user
     */
    @PostMapping("/schedule-for-user")
    public ResponseEntity<?> scheduleForUser(@RequestBody Map<String, Object> request, Authentication auth) {
        User sender = (User) auth.getPrincipal();
        
        // Only admin and lecturers can schedule notifications
        if (!sender.getRole().equalsIgnoreCase("admin") && 
            !sender.getRole().equalsIgnoreCase("lecturer")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "You don't have permission to schedule notifications"
            ));
        }
        
        Long userId = Long.valueOf(request.get("userId").toString());
        String subject = (String) request.get("subject");
        String message = (String) request.get("message");
        String scheduledDateStr = (String) request.get("scheduledDate");
        
        if (userId == null || subject == null || message == null || scheduledDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User ID, subject, message, and scheduled date are required"
            ));
        }
        
        try {
            LocalDateTime scheduledDate = LocalDateTime.parse(scheduledDateStr);
            
            if (scheduledDate.isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Scheduled date must be in the future"
                ));
            }
            
            ScheduledNotification notification = schedulerService.scheduleNotification(
                    userId, subject, message, scheduledDate);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification scheduled successfully",
                "notification", notification
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to schedule notification: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Schedule notifications for all users with a specific role (admin only)
     */
    @PostMapping("/schedule-for-role")
    public ResponseEntity<?> scheduleForRole(@RequestBody Map<String, Object> request, Authentication auth) {
        User sender = (User) auth.getPrincipal();
        
        // Only admin can schedule notifications for all users of a role
        if (!sender.getRole().equalsIgnoreCase("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admins can schedule notifications for all users of a role"
            ));
        }
        
        String role = (String) request.get("role");
        String subject = (String) request.get("subject");
        String message = (String) request.get("message");
        String scheduledDateStr = (String) request.get("scheduledDate");
        
        if (role == null || subject == null || message == null || scheduledDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Role, subject, message, and scheduled date are required"
            ));
        }
        
        try {
            LocalDateTime scheduledDate = LocalDateTime.parse(scheduledDateStr);
            
            if (scheduledDate.isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Scheduled date must be in the future"
                ));
            }
            
            int count = schedulerService.scheduleNotificationForRole(role, subject, message, scheduledDate);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Scheduled " + count + " notifications for users with role '" + role + "'",
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to schedule notifications: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Schedule notifications for all students in a class (admin and lecturers)
     */
    @PostMapping("/schedule-for-class/{classId}")
    public ResponseEntity<?> scheduleForClass(
            @PathVariable String classId,
            @RequestBody Map<String, Object> request, 
            Authentication auth) {
        
        User sender = (User) auth.getPrincipal();
        
        // Only admin and lecturers can schedule notifications for a class
        if (!sender.getRole().equalsIgnoreCase("admin") && 
            !sender.getRole().equalsIgnoreCase("lecturer")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admin and lecturers can schedule notifications for classes"
            ));
        }
        
        // If sender is a lecturer, check if they are responsible for this class
        if (sender.getRole().equalsIgnoreCase("lecturer") && 
            sender.getClassId() != null && 
            !sender.getClassId().equals(classId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Lecturers can only schedule notifications for their own classes"
            ));
        }
        
        String subject = (String) request.get("subject");
        String message = (String) request.get("message");
        String scheduledDateStr = (String) request.get("scheduledDate");
        
        if (subject == null || message == null || scheduledDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Subject, message, and scheduled date are required"
            ));
        }
        
        try {
            LocalDateTime scheduledDate = LocalDateTime.parse(scheduledDateStr);
            
            if (scheduledDate.isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Scheduled date must be in the future"
                ));
            }
            
            int count = schedulerService.scheduleNotificationForClass(
                    classId, subject, message, scheduledDate);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Scheduled " + count + " notifications for students in class " + classId,
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to schedule notifications: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get all scheduled notifications (admin only)
     */
    @GetMapping
    public ResponseEntity<?> getAllScheduledNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        
        // Only admin can view all scheduled notifications
        if (!user.getRole().equalsIgnoreCase("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admin can view all scheduled notifications"
            ));
        }
        
        List<ScheduledNotification> notifications = schedulerService.getAllScheduledNotifications();
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get scheduled notifications for the current user
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyScheduledNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<ScheduledNotification> notifications = schedulerService.getScheduledNotificationsForUser(user.getId());
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Cancel a scheduled notification (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelScheduledNotification(
            @PathVariable Long id,
            Authentication auth) {
        
        User user = (User) auth.getPrincipal();
        
        // Only admin can cancel scheduled notifications
        if (!user.getRole().equalsIgnoreCase("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admin can cancel scheduled notifications"
            ));
        }
        
        boolean canceled = schedulerService.cancelScheduledNotification(id);
        
        if (canceled) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Scheduled notification canceled successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to cancel scheduled notification"
            ));
        }
    }
} 