package com.mycompany.fstudymate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mycompany.fstudymate.model.Notification;
import com.mycompany.fstudymate.model.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    // Find notifications sent by a specific user
    List<Notification> findBySenderAndIsUnsentFalseOrderByCreatedAtDesc(User sender);
    
    // Find system-generated notifications
    List<Notification> findByIsSystemGeneratedTrueAndIsUnsentFalseOrderByCreatedAtDesc();
    
    // Find notifications with specific IDs that are not unsent
    @Query("SELECT n FROM Notification n WHERE n.id IN :ids AND n.isUnsent = false ORDER BY n.createdAt DESC")
    List<Notification> findByIdsAndNotUnsent(@Param("ids") List<Integer> notificationIds);
    
    // Count unsent notifications
    Long countByIsUnsentTrue();
} 