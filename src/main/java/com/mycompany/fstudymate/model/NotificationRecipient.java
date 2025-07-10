package com.mycompany.fstudymate.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "notification_recipients")
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
    
    // Default constructor
    public NotificationRecipient() {
    }
    
    // Constructor with essential fields
    public NotificationRecipient(Notification notification, User recipient, String recipientType) {
        this.notification = notification;
        this.recipient = recipient;
        this.recipientType = recipientType;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Notification getNotification() {
        return notification;
    }

    public void setNotification(Notification notification) {
        this.notification = notification;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public String getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
    
    // Mark notification as read
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
} 