package com.example.controller;

import com.example.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
} 