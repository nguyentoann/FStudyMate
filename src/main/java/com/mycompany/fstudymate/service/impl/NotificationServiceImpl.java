package com.mycompany.fstudymate.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.fstudymate.dto.NotificationRequest;
import com.mycompany.fstudymate.dto.NotificationResponse;
import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.Notification;
import com.mycompany.fstudymate.model.NotificationRecipient;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.ClassRepository;
import com.mycompany.fstudymate.repository.NotificationRecipientRepository;
import com.mycompany.fstudymate.repository.NotificationRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.service.NotificationService;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private static final String NOTIFICATION_ATTACHMENTS_PATH = "NotificationAttachments";
    
    // Constants for recipient types
    private static final String INDIVIDUAL = "INDIVIDUAL";
    private static final String CLASS = "CLASS";
    private static final String ALL_STUDENTS = "ALL_STUDENTS";
    private static final String ALL_OUTSRC_STUDENTS = "ALL_OUTSRC_STUDENTS";
    private static final String ALL_LECTURERS = "ALL_LECTURERS";
    private static final String ALL = "ALL";

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationRecipientRepository notificationRecipientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private DataSource dataSource;
    
    @Override
    @Transactional
    public NotificationResponse createNotification(NotificationRequest notificationRequest) {
        logger.info("Creating notification with title: {}", notificationRequest.getTitle());
        
        // Validate sender exists
        User sender = userRepository.findById(notificationRequest.getSenderId())
            .orElseThrow(() -> new IllegalArgumentException("Sender not found with ID: " + notificationRequest.getSenderId()));
        
        // Create notification entity
        Notification notification = new Notification();
        notification.setTitle(notificationRequest.getTitle());
        notification.setContent(notificationRequest.getContent());
        notification.setSender(sender);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRecipientType(notificationRequest.getRecipientType());
        notification.setUnsent(false);
        notification.setSystemGenerated(false);
        
        // Save notification to get ID
        logger.info("Saving notification to database");
        notification = notificationRepository.save(notification);
        
        // Process recipients based on type
        switch (notificationRequest.getRecipientType()) {
            case INDIVIDUAL:
                processIndividualRecipients(notification, notificationRequest.getRecipientIds());
                break;
            case CLASS:
                processClassRecipients(notification, notificationRequest.getRecipientIds());
                break;
            case ALL_STUDENTS:
                processAllStudentsRecipients(notification);
                break;
            case ALL_OUTSRC_STUDENTS:
                processAllOutsrcStudentsRecipients(notification);
                break;
            case ALL_LECTURERS:
                processAllLecturersRecipients(notification);
                break;
            case ALL:
                processAllUsersRecipients(notification);
                break;
            default:
                throw new IllegalArgumentException("Invalid recipient type: " + notificationRequest.getRecipientType());
        }
        
        // Send email notifications if requested
        if (notificationRequest.isSendEmail()) {
            // Logic to send email notifications would go here
            logger.info("Email notifications requested but not implemented yet");
        }
        
        // Return response
        return convertToResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse createNotificationWithAttachment(NotificationRequest notificationRequest, MultipartFile file) {
        logger.info("Creating notification with attachment. Title: {}", notificationRequest.getTitle());
        
        // First create the notification
        NotificationResponse response = createNotification(notificationRequest);
        
        // If file is provided, save it and update the notification with attachment info
        if (file != null && !file.isEmpty()) {
            try {
                // Get the notification by ID
                Integer notificationId = response.getId();
                Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
                
                // Generate a unique filename
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".dat";
                String uniqueFilename = "notification_" + notificationId + "_" + System.currentTimeMillis() + fileExtension;
                
                // TODO: Replace with your actual file storage logic
                // This is a placeholder for where you would save the file to your storage system
                // String savedFilePath = yourFileStorageService.saveFile(file, NOTIFICATION_ATTACHMENTS_PATH, uniqueFilename);
                
                // For now, let's assume we have a URL pattern for attachments
                String attachmentUrl = "/api/notifications/" + notificationId + "/attachment/" + uniqueFilename;
                
                // Update notification with attachment info
                notification.setAttachmentUrl(attachmentUrl);
                notification.setAttachmentName(originalFilename);
                notification = notificationRepository.save(notification);
                
                // Update the response
                response.setAttachmentPath(attachmentUrl);
                response.setAttachmentType(originalFilename);
                
                logger.info("Attachment added to notification. ID: {}, Filename: {}", notificationId, originalFilename);
            } catch (Exception e) {
                logger.error("Error saving attachment for notification", e);
                // We don't throw the exception here because the notification was already created successfully
            }
        }
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Integer userId) {
        logger.info("Getting notifications for user ID: {}", userId);
        
        // Validate user exists
        userRepository.findById(userId).orElseThrow(() -> 
            new IllegalArgumentException("User not found with ID: " + userId));
        
        // Get notification recipients for the user
        List<NotificationRecipient> recipients = notificationRecipientRepository.findByRecipientIdOrderByNotificationCreatedAtDesc(userId);
        
        // Convert to response DTOs
        return recipients.stream()
            .map(recipient -> {
                NotificationResponse response = convertToResponse(recipient.getNotification());
                response.setRead(recipient.isRead());
                response.setReadAt(recipient.getReadAt());
                return response;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotificationsForUser(Integer userId) {
        logger.info("Getting unread notifications for user ID: {}", userId);
        
        // Validate user exists
        userRepository.findById(userId).orElseThrow(() -> 
            new IllegalArgumentException("User not found with ID: " + userId));
        
        // Get unread notification recipients for the user
        List<NotificationRecipient> unreadRecipients = notificationRecipientRepository.findUnreadByRecipientIdOrderByNotificationCreatedAtDesc(userId);
        
        // Convert to response DTOs
        return unreadRecipients.stream()
            .map(recipient -> {
                NotificationResponse response = convertToResponse(recipient.getNotification());
                response.setRead(false);
                response.setReadAt(null);
                return response;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long countUnreadNotifications(Integer userId) {
        // Validate user exists
        userRepository.findById(userId).orElseThrow(() -> 
            new IllegalArgumentException("User not found with ID: " + userId));
            
        // Return count of unread notifications
        return notificationRecipientRepository.countUnreadByRecipientId(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markNotificationAsRead(Integer notificationId, Integer userId) {
        logger.info("Marking notification {} as read for user {}", notificationId, userId);
        
        // Find notification
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
        
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Find notification recipient
        NotificationRecipient recipient = notificationRecipientRepository.findByNotificationAndRecipient(notification, user);
        
        if (recipient == null) {
            throw new IllegalArgumentException("User is not a recipient of this notification");
        }
        
        // Mark as read if not already read
        if (!recipient.isRead()) {
            recipient.markAsRead();
            notificationRecipientRepository.save(recipient);
        }
        
        // Create response
        NotificationResponse response = convertToResponse(notification);
        response.setRead(true);
        response.setReadAt(recipient.getReadAt());
        
        return response;
    }

    @Override
    @Transactional
    public List<NotificationResponse> markAllNotificationsAsRead(Integer userId) {
        logger.info("Marking all notifications as read for user {}", userId);
        
        // Find user
        userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Find all unread notifications for the user
        List<NotificationRecipient> unreadRecipients = 
            notificationRecipientRepository.findUnreadByRecipientIdOrderByNotificationCreatedAtDesc(userId);
        
        // Mark all as read
        LocalDateTime now = LocalDateTime.now();
        for (NotificationRecipient recipient : unreadRecipients) {
            recipient.markAsRead();
            notificationRecipientRepository.save(recipient);
        }
        
        // Create responses
        return unreadRecipients.stream()
            .map(recipient -> {
                NotificationResponse response = convertToResponse(recipient.getNotification());
                response.setRead(true);
                response.setReadAt(recipient.getReadAt());
                return response;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteNotification(Integer notificationId, Integer userId) {
        logger.info("Deleting notification {} for user {}", notificationId, userId);
        
        // Find notification
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
        
        // Check if user is the sender or an admin
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Only allow sender or admin to delete
        if (notification.getSender().getId().equals(userId) || "ADMIN".equals(user.getRole())) {
            notificationRepository.delete(notification);
            logger.info("Notification {} deleted by user {}", notificationId, userId);
        } else {
            throw new IllegalArgumentException("User is not authorized to delete this notification");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsSentByUser(Integer userId) {
        logger.info("Getting notifications sent by user ID: {}", userId);
        
        // Validate user exists
        User sender = userRepository.findById(userId).orElseThrow(() -> 
            new IllegalArgumentException("User not found with ID: " + userId));
        
        // Get notifications sent by the user
        List<Notification> sentNotifications = notificationRepository.findBySenderAndUnsentFalseOrderByCreatedAtDesc(sender);
        
        // Convert to response DTOs
        return sentNotifications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationResponse unsendNotification(Integer notificationId, Integer senderId) {
        logger.info("Unsending notification {} by sender {}", notificationId, senderId);
        
        // Find notification
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
        
        // Check if user is the sender
        if (!notification.getSender().getId().equals(senderId)) {
            throw new IllegalArgumentException("User is not the sender of this notification");
        }
        
        // Mark as unsent
        notification.setUnsent(true);
        notification = notificationRepository.save(notification);
        
        return convertToResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Integer notificationId) {
        logger.info("Getting notification by ID: {}", notificationId);
        
        // Find notification
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
        
        return convertToResponse(notification);
    }
    
    // Helper methods would be here
    
    // Helper method to process individual recipients
    private void processIndividualRecipients(Notification notification, List<String> recipientIds) {
        if (recipientIds == null || recipientIds.isEmpty()) {
            logger.warn("No recipient IDs provided for INDIVIDUAL notification");
            return;
        }
        
        logger.info("Processing {} individual recipients", recipientIds.size());
        for (String recipientIdStr : recipientIds) {
            try {
                Integer recipientId = Integer.valueOf(recipientIdStr);
                Optional<User> recipientOpt = userRepository.findById(recipientId);
                
                if (recipientOpt.isPresent()) {
                    User recipient = recipientOpt.get();
                    NotificationRecipient notificationRecipient = new NotificationRecipient();
                    notificationRecipient.setNotification(notification);
                    notificationRecipient.setRecipient(recipient);
                    notificationRecipient.setRead(false);
                    notificationRecipient.setReadAt(null);
                    
                    notificationRecipientRepository.save(notificationRecipient);
                    logger.info("Added recipient: {}", recipientId);
                } else {
                    logger.warn("Recipient not found with ID: {}", recipientId);
                }
            } catch (NumberFormatException e) {
                logger.error("Invalid recipient ID format: {}", recipientIdStr);
            }
        }
    }
    
    // Helper method to process class recipients
    @Transactional
    private void processClassRecipients(Notification notification, List<String> classIds) {
        if (classIds == null || classIds.isEmpty()) {
            logger.warn("No class IDs provided for CLASS notification");
            return;
        }
        
        logger.info("Processing {} class recipients with class IDs: {}", classIds.size(), classIds);
        for (String classId : classIds) {
            try {
                logger.info("Processing class with ID: {}", classId);
                Optional<Class> classOpt = classRepository.findById(classId);
                
                if (classOpt.isPresent()) {
                    Class classEntity = classOpt.get();
                    logger.info("Found class: {} ({})", classEntity.getClassName(), classId);
                    
                    // Add the class to the notification's target classes
                    notification.getTargetClasses().add(classEntity);
                    notificationRepository.save(notification); // Save to ensure the relationship is persisted
                    
                    // Use a JOIN query to get all students in the class
                    String query = "SELECT u.* FROM users u " +
                                  "JOIN students s ON u.id = s.user_id " +
                                  "WHERE s.class_id = ?";
                    
                    logger.info("Executing SQL query: {} with parameter: {}", query, classId);
                    List<User> students = new ArrayList<>();
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
                            User student = new User();
                            student.setId(rs.getInt("id"));
                            student.setUsername(rs.getString("username"));
                            student.setEmail(rs.getString("email"));
                            student.setFullName(rs.getString("full_name"));
                            student.setRole(rs.getString("role"));
                            students.add(student);
                            logger.debug("Found student: {} (ID: {}) in class {}", student.getUsername(), student.getId(), classId);
                        }
                        logger.info("SQL query returned {} students for class {}", count, classId);
                    } catch (Exception e) {
                        logger.error("Error executing SQL query: {}", e.getMessage(), e);
                        throw new RuntimeException("Error retrieving students for class", e);
                    } finally {
                        if (rs != null) try { rs.close(); } catch (Exception e) { logger.warn("Error closing ResultSet: {}", e.getMessage()); }
                        if (ps != null) try { ps.close(); } catch (Exception e) { logger.warn("Error closing PreparedStatement: {}", e.getMessage()); }
                        if (conn != null) try { conn.close(); } catch (Exception e) { logger.warn("Error closing Connection: {}", e.getMessage()); }
                    }
                    
                    // Add students as notification recipients in a separate transaction
                    if (!students.isEmpty()) {
                        logger.info("Adding {} students from class {} as notification recipients", students.size(), classId);
                        
                        for (User student : students) {
                            try {
                                // Get the full user entity from the repository to avoid LazyInitializationException
                                User fullStudent = userRepository.findById(student.getId())
                                    .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + student.getId()));
                                
                                NotificationRecipient notificationRecipient = new NotificationRecipient();
                                notificationRecipient.setNotification(notification);
                                notificationRecipient.setRecipient(fullStudent);
                                notificationRecipient.setRead(false);
                                notificationRecipient.setReadAt(null);
                                
                                notificationRecipientRepository.save(notificationRecipient);
                                logger.debug("Added student {} (ID: {}) as notification recipient", student.getUsername(), student.getId());
                            } catch (Exception e) {
                                logger.error("Error adding student {} (ID: {}) as notification recipient: {}", 
                                    student.getUsername(), student.getId(), e.getMessage(), e);
                            }
                        }
                        
                        logger.info("Successfully added {} students from class: {} as notification recipients", students.size(), classId);
                    } else {
                        logger.warn("No students found in class {}", classId);
                    }
                } else {
                    logger.warn("Class not found with ID: {}", classId);
                }
            } catch (Exception e) {
                logger.error("Error processing class with ID: {}", classId, e);
                throw new RuntimeException("Error processing class notifications", e);
            }
        }
    }
    
    // Helper method to process all students recipients
    private void processAllStudentsRecipients(Notification notification) {
        logger.info("Processing ALL_STUDENTS recipients");
        List<User> students = userRepository.findByRole("STUDENT");
        
        for (User student : students) {
            NotificationRecipient notificationRecipient = new NotificationRecipient();
            notificationRecipient.setNotification(notification);
            notificationRecipient.setRecipient(student);
            notificationRecipient.setRead(false);
            notificationRecipient.setReadAt(null);
            
            notificationRecipientRepository.save(notificationRecipient);
        }
        logger.info("Added {} students as recipients", students.size());
    }
    
    // Helper method to process all outsource students recipients
    private void processAllOutsrcStudentsRecipients(Notification notification) {
        logger.info("Processing ALL_OUTSRC_STUDENTS recipients");
        List<User> outsrcStudents = userRepository.findByRole("OUTSRC_STUDENT");
        
        for (User student : outsrcStudents) {
            NotificationRecipient notificationRecipient = new NotificationRecipient();
            notificationRecipient.setNotification(notification);
            notificationRecipient.setRecipient(student);
            notificationRecipient.setRead(false);
            notificationRecipient.setReadAt(null);
            
            notificationRecipientRepository.save(notificationRecipient);
        }
        logger.info("Added {} outsource students as recipients", outsrcStudents.size());
    }
    
    // Helper method to process all lecturers recipients
    private void processAllLecturersRecipients(Notification notification) {
        logger.info("Processing ALL_LECTURERS recipients");
        List<User> lecturers = userRepository.findByRole("LECTURER");
        
        for (User lecturer : lecturers) {
            NotificationRecipient notificationRecipient = new NotificationRecipient();
            notificationRecipient.setNotification(notification);
            notificationRecipient.setRecipient(lecturer);
            notificationRecipient.setRead(false);
            notificationRecipient.setReadAt(null);
            
            notificationRecipientRepository.save(notificationRecipient);
        }
        logger.info("Added {} lecturers as recipients", lecturers.size());
    }
    
    // Helper method to process all users recipients
    private void processAllUsersRecipients(Notification notification) {
        logger.info("Processing ALL recipients");
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            NotificationRecipient notificationRecipient = new NotificationRecipient();
            notificationRecipient.setNotification(notification);
            notificationRecipient.setRecipient(user);
            notificationRecipient.setRead(false);
            notificationRecipient.setReadAt(null);
            
            notificationRecipientRepository.save(notificationRecipient);
        }
        logger.info("Added {} users as recipients", users.size());
    }
    
    // Helper method to convert notification entity to response DTO
    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setContent(notification.getContent());
        response.setSenderId(notification.getSender().getId());
        response.setSenderName(notification.getSender().getUsername());
        response.setCreatedAt(notification.getCreatedAt());
        response.setAttachmentPath(notification.getAttachmentUrl());
        response.setAttachmentType(notification.getAttachmentName());
        response.setUnsent(notification.isUnsent());
        
        // Add sender profile image URL
        if (notification.getSender() != null) {
            response.setSenderProfileImage(notification.getSender().getProfileImageUrl());
        }
        
        return response;
    }
} 