package com.mycompany.fstudymate.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_recipients")
@Data
@NoArgsConstructor
public class NotificationRecipient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "notification_id")
    private Notification notification;
    
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;
    
    @Column(name = "recipient_type")
    private String recipientType;  // INDIVIDUAL, CLASS, ALL_STUDENTS, ALL_OUTSRC_STUDENTS, ALL_LECTURERS, ALL
    
    @Column(name = "class_id")
    private String classId;  // Changed from Class classObj to match VARCHAR(20)
    
    @Column(name = "is_read")
    private boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    // Constructor with essential fields
    public NotificationRecipient(Notification notification, User recipient, String recipientType) {
        this.notification = notification;
        this.recipient = recipient;
        this.recipientType = recipientType;
    }
    
    // Mark notification as read
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
} 