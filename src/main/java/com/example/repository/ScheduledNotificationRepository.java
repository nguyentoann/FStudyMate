package com.example.repository;

import com.example.model.ScheduledNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduledNotificationRepository extends JpaRepository<ScheduledNotification, Long> {
    
    /**
     * Find all scheduled notifications that should be sent and haven't been sent yet
     * 
     * @param currentTime The current time
     * @return List of scheduled notifications that need to be sent
     */
    List<ScheduledNotification> findByScheduledDateBeforeAndSentFalse(LocalDateTime currentTime);
    
    /**
     * Find all scheduled notifications for a specific user
     * 
     * @param userId The user ID
     * @return List of scheduled notifications for the user
     */
    List<ScheduledNotification> findByUserIdOrderByScheduledDateAsc(Long userId);
} 