package com.mycompany.fstudymate.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public class NotificationRequest {
    private String title;
    private String content;
    private Integer senderId;
    private String recipientType;  // INDIVIDUAL, CLASS, ALL_STUDENTS, ALL_OUTSRC_STUDENTS, ALL_LECTURERS, ALL
    private List<String> recipientIds;  // User IDs or Class IDs based on recipientType
    private boolean sendEmail;
    private MultipartFile attachment;
    
    // Default constructor
    public NotificationRequest() {
    }
    
    // Getters and Setters
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
    
    public Integer getSenderId() {
        return senderId;
    }
    
    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }
    
    public String getRecipientType() {
        return recipientType;
    }
    
    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }
    
    public List<String> getRecipientIds() {
        return recipientIds;
    }
    
    public void setRecipientIds(List<String> recipientIds) {
        this.recipientIds = recipientIds;
    }
    
    public boolean isSendEmail() {
        return sendEmail;
    }
    
    public void setSendEmail(boolean sendEmail) {
        this.sendEmail = sendEmail;
    }
    
    public MultipartFile getAttachment() {
        return attachment;
    }
    
    public void setAttachment(MultipartFile attachment) {
        this.attachment = attachment;
    }
} 