package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.dto.NotificationDTO;
import com.mycompany.fstudymate.dto.NotificationRequest;
import com.mycompany.fstudymate.model.Notification;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.NotificationRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public NotificationDTO createNotificationForAll(NotificationRequest request, Integer senderId) {
        logger.info("Creating notification for all users");
        
        Optional<User> senderOptional = userRepository.findById(senderId);
        if (senderOptional.isEmpty()) {
            logger.error("Sender not found with ID: {}", senderId);
            throw new IllegalArgumentException("Sender not found");
        }
        
        User sender = senderOptional.get();
        
        Notification notification = new Notification(
            request.getTitle(),
            request.getMessage(),
            Notification.NotificationType.ALL,
            sender
        );
        
        // Add all users as recipients
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notification.addRecipient(user);
        }
        
        notification = notificationRepository.save(notification);
        
        return new NotificationDTO(notification);
    }
    
    @Override
    @Transactional
    public NotificationDTO createNotificationForRole(NotificationRequest request, Integer senderId) {
        logger.info("Creating notification for users with role: {}", request.getTargetRole());
        
        if (request.getTargetRole() == null || request.getTargetRole().isEmpty()) {
            logger.error("Target role is required for role-based notifications");
            throw new IllegalArgumentException("Target role is required");
        }
        
        Optional<User> senderOptional = userRepository.findById(senderId);
        if (senderOptional.isEmpty()) {
            logger.error("Sender not found with ID: {}", senderId);
            throw new IllegalArgumentException("Sender not found");
        }
        
        User sender = senderOptional.get();
        
        Notification notification = new Notification(
            request.getTitle(),
            request.getMessage(),
            Notification.NotificationType.ROLE,
            sender
        );
        
        // Add users with the target role as recipients
        List<User> usersWithRole = userRepository.findByRole(request.getTargetRole());
        for (User user : usersWithRole) {
            notification.addRecipient(user);
        }
        
        notification = notificationRepository.save(notification);
        
        return new NotificationDTO(notification);
    }
    
    @Override
    @Transactional
    public NotificationDTO createNotificationForClass(NotificationRequest request, Integer senderId) {
        logger.info("Creating notification for class: {}", request.getClassId());
        
        if (request.getClassId() == null || request.getClassId().isEmpty()) {
            logger.error("Class ID is required for class-based notifications");
            throw new IllegalArgumentException("Class ID is required");
        }
        
        Optional<User> senderOptional = userRepository.findById(senderId);
        if (senderOptional.isEmpty()) {
            logger.error("Sender not found with ID: {}", senderId);
            throw new IllegalArgumentException("Sender not found");
        }
        
        User sender = senderOptional.get();
        
        Notification notification = new Notification(
            request.getTitle(),
            request.getMessage(),
            Notification.NotificationType.CLASS,
            sender
        );
        
        notification.setClassId(request.getClassId());
        
        // Add users in the class as recipients
        List<User> usersInClass = userRepository.findByClassId(request.getClassId());
        for (User user : usersInClass) {
            notification.addRecipient(user);
        }
        
        notification = notificationRepository.save(notification);
        
        return new NotificationDTO(notification);
    }
    
    @Override
    @Transactional
    public NotificationDTO createNotificationForUsers(NotificationRequest request, Integer senderId) {
        logger.info("Creating notification for specific users");
        
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            logger.error("User IDs are required for user-specific notifications");
            throw new IllegalArgumentException("User IDs are required");
        }
        
        Optional<User> senderOptional = userRepository.findById(senderId);
        if (senderOptional.isEmpty()) {
            logger.error("Sender not found with ID: {}", senderId);
            throw new IllegalArgumentException("Sender not found");
        }
        
        User sender = senderOptional.get();
        
        Notification notification = new Notification(
            request.getTitle(),
            request.getMessage(),
            Notification.NotificationType.GROUP,
            sender
        );
        
        // Add specific users as recipients
        for (Integer userId : request.getUserIds()) {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                notification.addRecipient(userOptional.get());
            } else {
                logger.warn("User not found with ID: {}", userId);
            }
        }
        
        notification = notificationRepository.save(notification);
        
        return new NotificationDTO(notification);
    }
    
    @Override
    public List<NotificationDTO> getNotificationsForUser(Integer userId) {
        logger.info("Getting notifications for user: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByRecipientId(userId);
        return notifications.stream()
            .map(NotificationDTO::new)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<NotificationDTO> getUnreadNotificationsForUser(Integer userId) {
        logger.info("Getting unread notifications for user: {}", userId);
        
        List<Notification> notifications = notificationRepository.findUnreadByRecipientId(userId);
        return notifications.stream()
            .map(NotificationDTO::new)
            .collect(Collectors.toList());
    }
    
    @Override
    public Long countUnreadNotificationsForUser(Integer userId) {
        logger.info("Counting unread notifications for user: {}", userId);
        
        return notificationRepository.countUnreadByRecipientId(userId);
    }
    
    @Override
    @Transactional
    public boolean markNotificationAsRead(Long notificationId, Integer userId) {
        logger.info("Marking notification {} as read for user {}", notificationId, userId);
        
        Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
        if (notificationOptional.isEmpty()) {
            logger.error("Notification not found with ID: {}", notificationId);
            return false;
        }
        
        Notification notification = notificationOptional.get();
        
        // Check if the user is a recipient of this notification
        boolean isRecipient = notification.getRecipients().stream()
            .anyMatch(user -> user.getId().equals(userId));
        
        if (!isRecipient) {
            logger.error("User {} is not a recipient of notification {}", userId, notificationId);
            return false;
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
        
        return true;
    }
    
    @Override
    @Transactional
    public int markAllNotificationsAsRead(Integer userId) {
        logger.info("Marking all notifications as read for user: {}", userId);
        
        List<Notification> unreadNotifications = notificationRepository.findUnreadByRecipientId(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        
        return unreadNotifications.size();
    }
} 