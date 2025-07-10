package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "notifications")
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "attachment_url")
    private String attachmentUrl;
    
    @Column(name = "attachment_name")
    private String attachmentName;
    
    @Column(name = "recipient_type", nullable = false)
    private String recipientType; // INDIVIDUAL, CLASS, ALL_STUDENTS, etc.
    
    @Column(name = "is_unsent", nullable = false)
    private boolean unsent = false;
    
    @Column(name = "is_system_generated", nullable = false)
    private boolean isSystemGenerated = false;
    
    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NotificationRecipient> recipients = new HashSet<>();
    
    @ManyToMany
    @JoinTable(
        name = "notification_classes",
        joinColumns = @JoinColumn(name = "notification_id"),
        inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    private Set<Class> targetClasses = new HashSet<>();
    
    // Default constructor
    public Notification() {
    }
    
    // Custom constructor with essential fields
    public Notification(String title, String content, User sender, String recipientType) {
        this.title = title;
        this.content = content;
        this.sender = sender;
        this.recipientType = recipientType;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public User getSender() {
        return sender;
    }
    
    public void setSender(User sender) {
        this.sender = sender;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getAttachmentUrl() {
        return attachmentUrl;
    }
    
    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }
    
    public String getAttachmentName() {
        return attachmentName;
    }
    
    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }
    
    public String getRecipientType() {
        return recipientType;
    }
    
    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }
    
    public boolean isUnsent() {
        return unsent;
    }
    
    public void setUnsent(boolean unsent) {
        this.unsent = unsent;
    }
    
    public boolean isSystemGenerated() {
        return isSystemGenerated;
    }
    
    public void setSystemGenerated(boolean isSystemGenerated) {
        this.isSystemGenerated = isSystemGenerated;
    }
    
    public Set<NotificationRecipient> getRecipients() {
        return recipients;
    }
    
    public void setRecipients(Set<NotificationRecipient> recipients) {
        this.recipients = recipients;
    }
    
    public Set<Class> getTargetClasses() {
        return targetClasses;
    }
    
    public void setTargetClasses(Set<Class> targetClasses) {
        this.targetClasses = targetClasses;
    }
} 