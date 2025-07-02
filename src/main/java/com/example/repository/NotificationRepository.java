package com.example.repository;

import com.example.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for a specific user
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find all unread notifications for a specific user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    // Count unread notifications for a user
    long countByUserIdAndIsReadFalse(Long userId);
    
    // Get paginated notifications for a user
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find notifications by type for a user
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, String type);
    
    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);
    
    // Delete old notifications (older than specified days)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < DATEADD(DAY, -:days, CURRENT_DATE) AND n.isRead = true")
    int deleteOldNotifications(@Param("days") int days);
} 