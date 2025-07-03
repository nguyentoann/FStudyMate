package com.example.controller;

import com.example.model.Notification;
import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notification-management")
public class NotificationManagementController {

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Kiểm tra quyền gửi thông báo
     */
    private boolean canSendNotification(User sender, User recipient) {
        if (sender == null || recipient == null) {
            return false;
        }
        
        String senderRole = sender.getRole().toLowerCase();
        String recipientRole = recipient.getRole().toLowerCase();
        
        // Admin có thể gửi thông báo cho tất cả
        if (senderRole.equals("admin")) {
            return true;
        }
        
        // Giảng viên chỉ có thể gửi thông báo cho học sinh
        if (senderRole.equals("lecturer")) {
            return recipientRole.equals("student") || recipientRole.equals("outsrc_student");
        }
        
        // Học sinh không có quyền gửi thông báo
        return false;
    }
    
    /**
     * Gửi thông báo cho một người dùng cụ thể
     */
    @PostMapping("/send-to-user")
    public ResponseEntity<?> sendToUser(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        
        User sender = (User) auth.getPrincipal();
        Long recipientId = Long.valueOf(request.get("recipientId").toString());
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        Long resourceId = request.get("resourceId") != null ? 
                Long.valueOf(request.get("resourceId").toString()) : null;
        
        // Kiểm tra dữ liệu đầu vào
        if (recipientId == null || type == null || title == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Recipient ID, type, title, and message are required"
            ));
        }
        
        // Tìm người nhận
        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Recipient not found"
            ));
        }
        
        // Kiểm tra quyền gửi thông báo
        if (!canSendNotification(sender, recipient)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "You don't have permission to send notification to this user"
            ));
        }
        
        // Tạo thông báo
        Notification notification = notificationService.createNotification(
                recipientId, type, title, message, link, resourceId);
        
        if (notification != null) {
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
    
    /**
     * Gửi thông báo cho nhiều người dùng
     */
    @PostMapping("/send-to-users")
    public ResponseEntity<?> sendToUsers(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        
        User sender = (User) auth.getPrincipal();
        List<Long> recipientIds = ((List<?>) request.get("recipientIds"))
                .stream()
                .map(id -> Long.valueOf(id.toString()))
                .collect(Collectors.toList());
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        Long resourceId = request.get("resourceId") != null ? 
                Long.valueOf(request.get("resourceId").toString()) : null;
        
        // Kiểm tra dữ liệu đầu vào
        if (recipientIds.isEmpty() || type == null || title == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Recipient IDs, type, title, and message are required"
            ));
        }
        
        // Kiểm tra quyền và gửi thông báo
        int successCount = 0;
        for (Long recipientId : recipientIds) {
            User recipient = userRepository.findById(recipientId).orElse(null);
            if (recipient != null && canSendNotification(sender, recipient)) {
                Notification notification = notificationService.createNotification(
                        recipientId, type, title, message, link, resourceId);
                if (notification != null) {
                    successCount++;
                }
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notifications sent successfully to " + successCount + " recipients"
        ));
    }
    
    /**
     * Gửi thông báo cho tất cả người dùng (chỉ Admin)
     */
    @PostMapping("/send-to-all")
    public ResponseEntity<?> sendToAll(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        
        User sender = (User) auth.getPrincipal();
        
        // Chỉ Admin mới có quyền gửi thông báo cho tất cả
        if (!sender.getRole().equalsIgnoreCase("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admin can send notifications to all users"
            ));
        }
        
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        Long resourceId = request.get("resourceId") != null ? 
                Long.valueOf(request.get("resourceId").toString()) : null;
        
        // Kiểm tra dữ liệu đầu vào
        if (type == null || title == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Type, title, and message are required"
            ));
        }
        
        // Lấy tất cả người dùng và gửi thông báo
        List<User> allUsers = userRepository.findAll();
        int successCount = 0;
        
        for (User user : allUsers) {
            Notification notification = notificationService.createNotification(
                    user.getId(), type, title, message, link, resourceId);
            if (notification != null) {
                successCount++;
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notifications sent successfully to " + successCount + " users"
        ));
    }
    
    /**
     * Gửi thông báo cho tất cả học sinh (Admin và Lecturer)
     */
    @PostMapping("/send-to-all-students")
    public ResponseEntity<?> sendToAllStudents(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        
        User sender = (User) auth.getPrincipal();
        
        // Chỉ Admin và Lecturer mới có quyền gửi thông báo cho tất cả học sinh
        if (!sender.getRole().equalsIgnoreCase("admin") && 
            !sender.getRole().equalsIgnoreCase("lecturer")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admin and lecturer can send notifications to all students"
            ));
        }
        
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        Long resourceId = request.get("resourceId") != null ? 
                Long.valueOf(request.get("resourceId").toString()) : null;
        
        // Kiểm tra dữ liệu đầu vào
        if (type == null || title == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Type, title, and message are required"
            ));
        }
        
        // Lấy tất cả học sinh và gửi thông báo
        List<User> students = userRepository.findAll().stream()
                .filter(user -> user.getRole().equalsIgnoreCase("student") || 
                               user.getRole().equalsIgnoreCase("outsrc_student"))
                .collect(Collectors.toList());
        
        int successCount = 0;
        for (User student : students) {
            Notification notification = notificationService.createNotification(
                    student.getId(), type, title, message, link, resourceId);
            if (notification != null) {
                successCount++;
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notifications sent successfully to " + successCount + " students"
        ));
    }
    
    /**
     * Gửi thông báo cho một lớp học cụ thể (Admin và Lecturer)
     */
    @PostMapping("/send-to-class/{classId}")
    public ResponseEntity<?> sendToClass(
            @PathVariable String classId,
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        
        User sender = (User) auth.getPrincipal();
        
        // Chỉ Admin và Lecturer mới có quyền gửi thông báo cho lớp học
        if (!sender.getRole().equalsIgnoreCase("admin") && 
            !sender.getRole().equalsIgnoreCase("lecturer")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", "Only admin and lecturer can send notifications to classes"
            ));
        }
        
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        String link = (String) request.get("link");
        Long resourceId = request.get("resourceId") != null ? 
                Long.valueOf(request.get("resourceId").toString()) : null;
        
        // Kiểm tra dữ liệu đầu vào
        if (type == null || title == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Type, title, and message are required"
            ));
        }
        
        // Lấy tất cả học sinh trong lớp học
        List<User> studentsInClass = findStudentsInClass(classId);
        
        if (studentsInClass.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "No students found in this class"
            ));
        }
        
        int successCount = 0;
        for (User student : studentsInClass) {
            Notification notification = notificationService.createNotification(
                    student.getId(), type, title, message, link, resourceId);
            if (notification != null) {
                successCount++;
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notifications sent successfully to " + successCount + " students in the class"
        ));
    }
    
    // Phương thức để lấy danh sách học sinh trong một lớp học dựa vào classId
    private List<User> findStudentsInClass(String classId) {
        // Sử dụng UserRepository để tìm tất cả người dùng có classId trùng khớp
        // và có role là student hoặc outsrc_student
        return userRepository.findByClassId(classId).stream()
                .filter(user -> user.getRole().equalsIgnoreCase("student") || 
                               user.getRole().equalsIgnoreCase("outsrc_student"))
                .collect(Collectors.toList());
    }
}