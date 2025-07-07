package com.example.service.impl;

import com.example.model.Notification;
import com.example.model.User;
import com.example.repository.NotificationRepository;
import com.example.repository.UserRepository;
import com.example.service.EmailService;
import com.example.service.NotificationService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Override
    public boolean sendNotification(Long userId, String subject, String message) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            logger.error("User not found with ID: {}", userId);
            return false;
        }
        
        User user = userOptional.get();
        
        // Create an in-app notification
        createNotification(userId, "SYSTEM", subject, message, null, null);
        
        // Send email notification
        String email = user.getEmail();
        return sendNotificationByEmail(email, subject, message);
    }
    
    @Override
    public boolean sendNotificationByEmail(String email, String subject, String message) {
        try {
            logger.info("Sending notification email to: {}", email);
            return emailService.sendNotificationEmail(email, subject, message);
        } catch (Exception e) {
            logger.error("Failed to send notification email to {}: {}", email, e.getMessage());
            return false;
        }
    }
    
    @Override
    public Notification createNotification(Long userId, String type, String title, String message, String link, Long resourceId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            logger.error("User not found with ID: {}", userId);
            return null;
        }
        
        User user = userOptional.get();
        Notification notification = new Notification(user, type, title, message);
        
        if (link != null) {
            notification.setLink(link);
        }
        
        if (resourceId != null) {
            notification.setResourceId(resourceId);
        }
        
        return notificationRepository.save(notification);
    }
    
    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    @Override
    public boolean markAsRead(Long notificationId) {
        Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
        
        if (notificationOptional.isEmpty()) {
            logger.error("Notification not found with ID: {}", notificationId);
            return false;
        }
        
        Notification notification = notificationOptional.get();
        notification.setRead(true);
        notificationRepository.save(notification);
        
        return true;
    }
    
    @Override
    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId);
    }
    
    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    @Override
    @Transactional
    public int deleteOldNotifications(int days) {
        return notificationRepository.deleteOldNotifications(days);
    }
    
    @Override
    public List<Notification> sendNotificationToRole(String role, String type, String title, String message, String link, Long resourceId) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getRole().equalsIgnoreCase(role))
                .collect(Collectors.toList());
        
        List<Notification> notifications = new ArrayList<>();
        for (User user : users) {
            Notification notification = createNotification(
                    user.getId(), type, title, message, link, resourceId);
            if (notification != null) {
                notifications.add(notification);
            }
        }
        
        logger.info("Sent notification to {} users with role '{}'", notifications.size(), role);
        return notifications;
    }
    
    @Override
    public List<Notification> sendNotificationToClass(String classId, String type, String title, String message, String link, Long resourceId) {
        List<User> users = userRepository.findByClassId(classId).stream()
                .filter(user -> user.getRole().equalsIgnoreCase("student") || 
                              user.getRole().equalsIgnoreCase("outsrc_student"))
                .collect(Collectors.toList());
        
        List<Notification> notifications = new ArrayList<>();
        for (User user : users) {
            Notification notification = createNotification(
                    user.getId(), type, title, message, link, resourceId);
            if (notification != null) {
                notifications.add(notification);
            }
        }
        
        logger.info("Sent notification to {} students in class '{}'", notifications.size(), classId);
        return notifications;
    }
    
    @Override
    public List<Notification> sendNotificationToAll(String type, String title, String message, String link, Long resourceId) {
        List<User> allUsers = userRepository.findAll();
        
        List<Notification> notifications = new ArrayList<>();
        for (User user : allUsers) {
            Notification notification = createNotification(
                    user.getId(), type, title, message, link, resourceId);
            if (notification != null) {
                notifications.add(notification);
            }
        }
        
        logger.info("Sent notification to all {} users", notifications.size());
        return notifications;
    }
} 