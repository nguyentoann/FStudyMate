package com.mycompany.fstudymate.controller;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import com.mycompany.fstudymate.model.Notification;
import com.mycompany.fstudymate.model.NotificationRecipient;
import com.mycompany.fstudymate.repository.NotificationRepository;
import com.mycompany.fstudymate.repository.NotificationRecipientRepository;
import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.repository.ClassRepository;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationRecipientRepository notificationRecipientRepository;
    
    @Autowired
    private DataSource dataSource;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private UserRepository userRepository;

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
            logger.info("Getting notifications for user ID: {}", userId);
            List<NotificationResponse> notifications = notificationService.getNotificationsForUser(userId);
            logger.info("Found {} notifications for user ID: {}", notifications.size(), userId);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.error("Bad request when getting notifications for user: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error getting notifications for user ID {}: {}", userId, e.getMessage(), e);
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

    @GetMapping("/debug/recipients/{notificationId}")
    public ResponseEntity<?> debugNotificationRecipients(@PathVariable Integer notificationId) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Try to get the notification
            try {
                Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
                if (notificationOpt.isPresent()) {
                    Notification notification = notificationOpt.get();
                    response.put("notification", Map.of(
                        "id", notification.getId(),
                        "title", notification.getTitle(),
                        "content", notification.getContent(),
                        "senderId", notification.getSender() != null ? notification.getSender().getId() : null,
                        "createdAt", notification.getCreatedAt(),
                        "recipientType", notification.getRecipientType(),
                        "unsent", notification.isUnsent()
                    ));
                } else {
                    response.put("notification", "Not found");
                }
            } catch (Exception e) {
                response.put("notificationError", e.getMessage());
            }
            
            // Try to get recipients
            try {
                List<NotificationRecipient> recipients = notificationRecipientRepository.findAll();
                List<Map<String, Object>> recipientData = new ArrayList<>();
                
                for (NotificationRecipient recipient : recipients) {
                    if (recipient.getNotification() != null && 
                        recipient.getNotification().getId().equals(notificationId)) {
                        recipientData.add(Map.of(
                            "id", recipient.getId(),
                            "notificationId", recipient.getNotification().getId(),
                            "recipientId", recipient.getRecipient() != null ? recipient.getRecipient().getId() : null,
                            "isRead", recipient.isRead(),
                            "readAt", recipient.getReadAt()
                        ));
                    }
                }
                
                response.put("recipientCount", recipientData.size());
                response.put("recipients", recipientData);
            } catch (Exception e) {
                response.put("recipientsError", e.getMessage());
            }
            
            // Try to count unread notifications for user 923
            try {
                Long count = notificationService.countUnreadNotifications(923);
                response.put("unreadCount923", count);
            } catch (Exception e) {
                response.put("unreadCountError", e.getMessage());
            }
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("stackTrace", getStackTraceAsString(e));
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/test/recipients/{notificationId}")
    public ResponseEntity<Map<String, Object>> testRecipients(@PathVariable Integer notificationId) {
        logger.info("Testing recipients for notification ID: {}", notificationId);
        Map<String, Object> response = new HashMap<>();
        
        try {
            Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
            
            List<NotificationRecipient> recipients = notificationRecipientRepository.findAll();
            List<Map<String, Object>> recipientData = new ArrayList<>();
            
            for (NotificationRecipient recipient : recipients) {
                if (recipient.getNotification() != null && 
                    recipient.getNotification().getId().equals(notificationId)) {
                    recipientData.add(Map.of(
                        "id", recipient.getId(),
                        "notificationId", recipient.getNotification().getId(),
                        "recipientId", recipient.getRecipient() != null ? recipient.getRecipient().getId() : null,
                        "isRead", recipient.isRead(),
                        "readAt", recipient.getReadAt()
                    ));
                }
            }
            
            response.put("notification", Map.of(
                "id", notification.getId(),
                "title", notification.getTitle(),
                "content", notification.getContent(),
                "senderId", notification.getSender() != null ? notification.getSender().getId() : null,
                "createdAt", notification.getCreatedAt(),
                "recipientType", notification.getRecipientType(),
                "unsent", notification.isUnsent()
            ));
            response.put("recipientCount", recipientData.size());
            response.put("recipients", recipientData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error testing recipients: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/test/process-class/{notificationId}/{classId}")
    public ResponseEntity<Map<String, Object>> testProcessClassNotification(
            @PathVariable Integer notificationId, 
            @PathVariable String classId) {
        
        logger.info("Testing processing class notification for notification ID: {} and class ID: {}", notificationId, classId);
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Find notification
            Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
            
            // Find class
            Optional<Class> classOpt = classRepository.findById(classId);
            if (!classOpt.isPresent()) {
                response.put("error", "Class not found with ID: " + classId);
                return ResponseEntity.badRequest().body(response);
            }
            
            Class classEntity = classOpt.get();
            
            // Use a JOIN query to get all students in the class
            String query = "SELECT u.* FROM users u " +
                          "JOIN students s ON u.id = s.user_id " +
                          "WHERE s.class_id = ?";
            
            List<Map<String, Object>> students = new ArrayList<>();
            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            
            try {
                conn = dataSource.getConnection();
                ps = conn.prepareStatement(query);
                ps.setString(1, classId);
                rs = ps.executeQuery();
                
                int count = 0;
                while (rs.next()) {
                    count++;
                    final int userId = rs.getInt("id");
                    final String username = rs.getString("username");
                    final String email = rs.getString("email");
                    final String fullName = rs.getString("full_name");
                    final String role = rs.getString("role");
                    
                    Map<String, Object> student = new HashMap<>();
                    student.put("id", userId);
                    student.put("username", username);
                    student.put("email", email);
                    student.put("fullName", fullName);
                    student.put("role", role);
                    students.add(student);
                    
                    // Create notification recipient
                    try {
                        User userEntity = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
                        
                        NotificationRecipient notificationRecipient = new NotificationRecipient();
                        notificationRecipient.setNotification(notification);
                        notificationRecipient.setRecipient(userEntity);
                        notificationRecipient.setRead(false);
                        notificationRecipient.setReadAt(null);
                        
                        notificationRecipientRepository.save(notificationRecipient);
                        logger.info("Created notification recipient for user ID: {}", userId);
                    } catch (Exception e) {
                        logger.error("Error creating notification recipient for user ID {}: {}", userId, e.getMessage());
                    }
                }
                
                response.put("success", true);
                response.put("message", "Processed class notification successfully");
                response.put("studentCount", count);
                response.put("students", students);
                
            } catch (SQLException e) {
                logger.error("SQL error: {}", e.getMessage(), e);
                response.put("error", "SQL error: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } finally {
                if (rs != null) try { rs.close(); } catch (SQLException e) { logger.warn("Error closing ResultSet: {}", e.getMessage()); }
                if (ps != null) try { ps.close(); } catch (SQLException e) { logger.warn("Error closing PreparedStatement: {}", e.getMessage()); }
                if (conn != null) try { conn.close(); } catch (SQLException e) { logger.warn("Error closing Connection: {}", e.getMessage()); }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing class notification: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/test/class-students/{classId}")
    public ResponseEntity<Map<String, Object>> testClassStudents(@PathVariable String classId) {
        logger.info("Testing class students for class ID: {}", classId);
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Use a JOIN query to get all students in the class
            String query = "SELECT u.* FROM users u " +
                          "JOIN students s ON u.id = s.user_id " +
                          "WHERE s.class_id = ?";
            
            List<Map<String, Object>> students = new ArrayList<>();
            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            
            try {
                conn = dataSource.getConnection();
                ps = conn.prepareStatement(query);
                ps.setString(1, classId);
                rs = ps.executeQuery();
                
                int count = 0;
                while (rs.next()) {
                    count++;
                    final int userId = rs.getInt("id");
                    final String username = rs.getString("username");
                    final String email = rs.getString("email");
                    final String fullName = rs.getString("full_name");
                    final String role = rs.getString("role");
                    
                    Map<String, Object> student = new HashMap<>();
                    student.put("id", userId);
                    student.put("username", username);
                    student.put("email", email);
                    student.put("fullName", fullName);
                    student.put("role", role);
                    students.add(student);
                }
                response.put("count", count);
                response.put("students", students);
                logger.info("SQL query returned {} students for class {}", count, classId);
            } catch (SQLException e) {
                logger.error("SQL error: {}", e.getMessage(), e);
                response.put("error", "SQL error: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } finally {
                if (rs != null) try { rs.close(); } catch (SQLException e) { logger.warn("Error closing ResultSet: {}", e.getMessage()); }
                if (ps != null) try { ps.close(); } catch (SQLException e) { logger.warn("Error closing PreparedStatement: {}", e.getMessage()); }
                if (conn != null) try { conn.close(); } catch (SQLException e) { logger.warn("Error closing Connection: {}", e.getMessage()); }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error testing class students: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    private String getStackTraceAsString(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }
} 