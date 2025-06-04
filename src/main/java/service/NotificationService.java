package service;

import dao.NotificationDAO;
import dao.UserDAO;
import model.Notification;
import model.User;
import model.Quiz;
import model.Lesson;
import model.Notification.NotificationType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class NotificationService {
    
    private static final Logger LOGGER = Logger.getLogger(NotificationService.class.getName());
    
    private final NotificationDAO notificationDAO;
    private final UserDAO userDAO;
    
    @Autowired
    private JavaMailSender emailSender;
    
    public NotificationService() {
        try {
            this.notificationDAO = new NotificationDAO();
            this.userDAO = new UserDAO();
            
            // Ensure notification table exists
            notificationDAO.createNotificationTableIfNotExists();
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error initializing NotificationService", e);
            throw new RuntimeException("Failed to initialize NotificationService", e);
        }
    }
    
    public List<Notification> getUserNotifications(long userId) {
        try {
            return notificationDAO.getNotificationsByUser(userId);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting user notifications", e);
            throw new RuntimeException("Failed to get user notifications", e);
        }
    }
    
    public List<Notification> getUnreadNotifications(long userId) {
        try {
            return notificationDAO.getUnreadNotificationsByUser(userId);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting unread notifications", e);
            throw new RuntimeException("Failed to get unread notifications", e);
        }
    }
    
    public void markAsRead(long notificationId) {
        try {
            notificationDAO.markAsRead(notificationId);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking notification as read", e);
            throw new RuntimeException("Failed to mark notification as read", e);
        }
    }
    
    public void markAllAsRead(long userId) {
        try {
            notificationDAO.markAllAsRead(userId);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking all notifications as read", e);
            throw new RuntimeException("Failed to mark all notifications as read", e);
        }
    }
    
    // Schedule update notification
    public void sendScheduleUpdateNotification(User user, String title, String details, Long relatedEntityId) {
        try {
            Notification notification = new Notification(
                user, 
                title, 
                details, 
                NotificationType.SCHEDULE_UPDATE, 
                relatedEntityId
            );
            
            notificationDAO.saveNotification(notification);
            
            // Send email notification if user has email notifications enabled
            if (user.isEmailNotificationsEnabled()) {
                sendEmailNotification(user.getEmail(), title, details);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error sending schedule update notification", e);
            throw new RuntimeException("Failed to send schedule update notification", e);
        }
    }
    
    // Test reminder notification
    public void sendTestReminderNotification(User user, Quiz quiz) {
        try {
            String title = "Test Reminder: " + quiz.getTitle();
            String message = "Don't forget about your upcoming test: " + quiz.getTitle() + 
                             ". Scheduled for: " + quiz.getScheduledDate();
            
            Notification notification = new Notification(
                user, 
                title, 
                message, 
                NotificationType.TEST_REMINDER, 
                quiz.getId()
            );
            
            notificationDAO.saveNotification(notification);
            
            // Send email notification if user has email notifications enabled
            if (user.isEmailNotificationsEnabled()) {
                sendEmailNotification(user.getEmail(), title, message);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error sending test reminder notification", e);
            throw new RuntimeException("Failed to send test reminder notification", e);
        }
    }
    
    // New material notification
    public void sendNewMaterialNotification(User user, Lesson lesson) {
        try {
            String title = "New Learning Material Available";
            String message = "New material has been added: " + lesson.getTitle() + 
                             ". Check it out to enhance your learning!";
            
            Notification notification = new Notification(
                user, 
                title, 
                message, 
                NotificationType.NEW_MATERIAL, 
                lesson.getId()
            );
            
            notificationDAO.saveNotification(notification);
            
            // Send email notification if user has email notifications enabled
            if (user.isEmailNotificationsEnabled()) {
                sendEmailNotification(user.getEmail(), title, message);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error sending new material notification", e);
            throw new RuntimeException("Failed to send new material notification", e);
        }
    }
    
    // Quiz result notification
    public void sendQuizResultNotification(User user, Quiz quiz, double score) {
        try {
            String title = "Quiz Results Available";
            String message = "Your results for " + quiz.getTitle() + " are now available. " +
                             "Your score: " + score + "%.";
            
            Notification notification = new Notification(
                user, 
                title, 
                message, 
                NotificationType.QUIZ_RESULT, 
                quiz.getId()
            );
            
            notificationDAO.saveNotification(notification);
            
            // Send email notification if user has email notifications enabled
            if (user.isEmailNotificationsEnabled()) {
                sendEmailNotification(user.getEmail(), title, message);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error sending quiz result notification", e);
            throw new RuntimeException("Failed to send quiz result notification", e);
        }
    }
    
    // System notification for all users
    public void sendSystemNotificationToAllUsers(String title, String message) {
        try {
            List<User> allUsers = userDAO.getAllUsers();
            for (User user : allUsers) {
                Notification notification = new Notification(
                    user, 
                    title, 
                    message, 
                    NotificationType.SYSTEM, 
                    null
                );
                
                notificationDAO.saveNotification(notification);
                
                // Send email notification if user has email notifications enabled
                if (user.isEmailNotificationsEnabled()) {
                    sendEmailNotification(user.getEmail(), title, message);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error sending system notification to all users", e);
            throw new RuntimeException("Failed to send system notification to all users", e);
        }
    }
    
    private void sendEmailNotification(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            emailSender.send(message);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to send email notification", e);
            // Don't throw exception here as email sending is a secondary notification method
        }
    }
    
    // Clean up old notifications (e.g., older than 30 days)
    public void cleanupOldNotifications(int daysOld) {
        try {
            int deleted = notificationDAO.deleteOldNotifications(daysOld);
            LOGGER.info("Deleted " + deleted + " notifications older than " + daysOld + " days");
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error cleaning up old notifications", e);
            throw new RuntimeException("Failed to clean up old notifications", e);
        }
    }
} 