package com.example.service.impl;

import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.EmailService;
import com.example.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Override
    public boolean sendNotification(Long userId, String subject, String message) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            logger.error("User not found with ID: {}", userId);
            return false;
        }
        
        User user = userOptional.get();
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
} 