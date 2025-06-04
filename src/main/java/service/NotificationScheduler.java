package service;

import dao.QuizDAO;
import dao.UserDAO;
import model.Quiz;
import model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class NotificationScheduler {
    
    private static final Logger LOGGER = Logger.getLogger(NotificationScheduler.class.getName());
    
    @Autowired
    private NotificationService notificationService;
    
    private QuizDAO quizDAO;
    private UserDAO userDAO;
    
    public NotificationScheduler() {
        try {
            this.quizDAO = new QuizDAO();
            this.userDAO = new UserDAO();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error initializing NotificationScheduler", e);
        }
    }
    
    /**
     * Runs daily at 8:00 AM to send reminders for upcoming tests
     */
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendTestReminders() {
        LOGGER.info("Running scheduled test reminder notifications");
        
        try {
            // Get quizzes scheduled in the next 2 days
            List<Quiz> upcomingQuizzes = quizDAO.getUpcomingQuizzes(2);
            
            for (Quiz quiz : upcomingQuizzes) {
                // Get all students that should take this quiz
                List<User> eligibleUsers = quizDAO.getEligibleUsers(quiz.getId());
                
                for (User user : eligibleUsers) {
                    // Send test reminder notification
                    notificationService.sendTestReminderNotification(user, quiz);
                }
                
                LOGGER.info("Sent test reminders for quiz: " + quiz.getTitle() + " to " + eligibleUsers.size() + " users");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error sending test reminders", e);
        }
    }
    
    /**
     * Runs weekly at 1:00 AM on Sunday to clean up old notifications
     */
    @Scheduled(cron = "0 0 1 ? * SUN")
    public void cleanupOldNotifications() {
        LOGGER.info("Running scheduled cleanup of old notifications");
        
        try {
            // Delete notifications older than 30 days
            notificationService.cleanupOldNotifications(30);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error cleaning up old notifications", e);
        }
    }
    
    /**
     * Runs daily at 7:00 AM to check for overdue quizzes and send reminders
     */
    @Scheduled(cron = "0 0 7 * * ?")
    public void sendOverdueQuizReminders() {
        LOGGER.info("Running scheduled overdue quiz reminder notifications");
        
        try {
            // Get all scheduled quizzes
            List<Quiz> scheduledQuizzes = quizDAO.getAllScheduledQuizzes();
            LocalDate today = LocalDate.now();
            
            for (Quiz quiz : scheduledQuizzes) {
                if (quiz.getScheduledDate() != null) {
                    LocalDate quizDate = quiz.getScheduledDate().toLocalDate();
                    
                    // If the quiz is today, send a reminder
                    if (quizDate.equals(today)) {
                        // Get all students that should take this quiz
                        List<User> eligibleUsers = quizDAO.getEligibleUsers(quiz.getId());
                        
                        for (User user : eligibleUsers) {
                            String title = "Today's Quiz: " + quiz.getTitle();
                            String message = "Don't forget you have a quiz today: " + quiz.getTitle();
                            
                            // Create a system notification
                            notificationService.sendScheduleUpdateNotification(
                                user, title, message, quiz.getId()
                            );
                        }
                        
                        LOGGER.info("Sent today's quiz reminders for: " + quiz.getTitle() + " to " + 
                                    eligibleUsers.size() + " users");
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error sending overdue quiz reminders", e);
        }
    }
} 