package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Notification;
import com.mycompany.fstudymate.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a specific user
    @Query("SELECT n FROM Notification n JOIN n.recipients r WHERE r.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientId(@Param("userId") Integer userId);
    
    // Find notifications for a specific user with pagination
    @Query("SELECT n FROM Notification n JOIN n.recipients r WHERE r.id = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientId(@Param("userId") Integer userId, Pageable pageable);
    
    // Find unread notifications for a specific user
    @Query("SELECT n FROM Notification n JOIN n.recipients r WHERE r.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByRecipientId(@Param("userId") Integer userId);
    
    // Count unread notifications for a specific user
    @Query("SELECT COUNT(n) FROM Notification n JOIN n.recipients r WHERE r.id = :userId AND n.isRead = false")
    Long countUnreadByRecipientId(@Param("userId") Integer userId);
    
    // Find notifications for users with a specific role
    @Query("SELECT n FROM Notification n JOIN n.recipients r WHERE r.role = :role ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientRole(@Param("role") String role);
    
    // Find notifications for a specific class
    List<Notification> findByClassIdOrderByCreatedAtDesc(String classId);
    
    // Find notifications by type
    List<Notification> findByNotificationTypeOrderByCreatedAtDesc(Notification.NotificationType type);
} 