package com.mycompany.fstudymate.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.fstudymate.dto.NotificationRequest;
import com.mycompany.fstudymate.dto.NotificationResponse;
import com.mycompany.fstudymate.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@RequestBody NotificationRequest request) {
        try {
            NotificationResponse response = notificationService.createNotification(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/with-attachment")
    public ResponseEntity<NotificationResponse> createNotificationWithAttachment(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("senderId") Integer senderId,
            @RequestParam("recipientType") String recipientType,
            @RequestParam(value = "recipientIds", required = false) List<String> recipientIds,
            @RequestParam(value = "sendEmail", required = false, defaultValue = "false") boolean sendEmail,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {
        
        try {
            // Create notification request from parameters
            NotificationRequest request = new NotificationRequest();
            request.setTitle(title);
            request.setContent(content);
            request.setSenderId(senderId);
            request.setRecipientType(recipientType);
            request.setRecipientIds(recipientIds);
            request.setSendEmail(sendEmail);
            
            // Create notification with attachment
            NotificationResponse response = notificationService.createNotificationWithAttachment(request, attachment);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsForUser(@PathVariable Integer userId) {
        try {
            List<NotificationResponse> notifications = notificationService.getNotificationsForUser(userId);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotificationsForUser(@PathVariable Integer userId) {
        try {
            List<NotificationResponse> notifications = notificationService.getUnreadNotificationsForUser(userId);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> countUnreadNotifications(@PathVariable Integer userId) {
        try {
            Long count = notificationService.countUnreadNotifications(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{notificationId}/read/{userId}")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(
            @PathVariable Integer notificationId, @PathVariable Integer userId) {
        try {
            NotificationResponse response = notificationService.markNotificationAsRead(notificationId, userId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<List<NotificationResponse>> markAllNotificationsAsRead(@PathVariable Integer userId) {
        try {
            List<NotificationResponse> response = notificationService.markAllNotificationsAsRead(userId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/{notificationId}/user/{userId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Integer notificationId, @PathVariable Integer userId) {
        try {
            notificationService.deleteNotification(notificationId, userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/sent-by/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsSentByUser(@PathVariable Integer userId) {
        try {
            List<NotificationResponse> notifications = notificationService.getNotificationsSentByUser(userId);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{notificationId}/unsend/{senderId}")
    public ResponseEntity<NotificationResponse> unsendNotification(
            @PathVariable Integer notificationId, @PathVariable Integer senderId) {
        try {
            NotificationResponse response = notificationService.unsendNotification(notificationId, senderId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable Integer notificationId) {
        try {
            NotificationResponse notification = notificationService.getNotificationById(notificationId);
            return new ResponseEntity<>(notification, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 