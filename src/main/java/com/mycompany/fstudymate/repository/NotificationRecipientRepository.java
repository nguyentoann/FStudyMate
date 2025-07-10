package com.mycompany.fstudymate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mycompany.fstudymate.model.Notification;
import com.mycompany.fstudymate.model.NotificationRecipient;
import com.mycompany.fstudymate.model.User;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Integer> {
    
    // Find notifications for a specific recipient
    @Query("SELECT nr FROM NotificationRecipient nr WHERE nr.recipient.id = :recipientId AND nr.notification.unsent = false ORDER BY nr.notification.createdAt DESC")
    List<NotificationRecipient> findByRecipientIdOrderByNotificationCreatedAtDesc(@Param("recipientId") Integer recipientId);
    
    // Find unread notifications for a specific recipient
    @Query("SELECT nr FROM NotificationRecipient nr WHERE nr.recipient.id = :recipientId AND nr.isRead = false AND nr.notification.unsent = false ORDER BY nr.notification.createdAt DESC")
    List<NotificationRecipient> findUnreadByRecipientIdOrderByNotificationCreatedAtDesc(@Param("recipientId") Integer recipientId);
    
    // Count unread notifications for a specific recipient
    @Query("SELECT COUNT(nr) FROM NotificationRecipient nr WHERE nr.recipient.id = :recipientId AND nr.isRead = false AND nr.notification.unsent = false")
    Long countUnreadByRecipientId(@Param("recipientId") Integer recipientId);
    
    // Find recipients for a specific notification
    List<NotificationRecipient> findByNotification(Notification notification);
    
    // Delete all recipients for a notification
    void deleteByNotification(Notification notification);
    
    // Find a specific notification for a specific recipient
    NotificationRecipient findByNotificationAndRecipient(Notification notification, User recipient);
} 