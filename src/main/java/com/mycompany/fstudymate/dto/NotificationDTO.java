package com.mycompany.fstudymate.dto;

import com.mycompany.fstudymate.model.Notification;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Notification
 */
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private boolean isRead;
    private String notificationType;
    private String classId;
    private Integer senderId;
    private String senderName;
    
    // Default constructor
    public NotificationDTO() {
    }
    
    // Constructor from entity
    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.createdAt = notification.getCreatedAt();
        this.isRead = notification.isRead();
        this.notificationType = notification.getNotificationType().toString();
        this.classId = notification.getClassId();
        
        if (notification.getSender() != null) {
            this.senderId = notification.getSender().getId();
            this.senderName = notification.getSender().getFullName();
        }
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public String getNotificationType() {
        return notificationType;
    }
    
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
    
    public String getClassId() {
        return classId;
    }
    
    public void setClassId(String classId) {
        this.classId = classId;
    }
    
    public Integer getSenderId() {
        return senderId;
    }
    
    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderName() {
        return senderName;
    }
    
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
} 