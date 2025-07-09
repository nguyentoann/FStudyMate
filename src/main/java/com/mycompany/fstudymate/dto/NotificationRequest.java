package com.mycompany.fstudymate.dto;

import java.util.List;

/**
 * Request DTO for creating notifications
 */
public class NotificationRequest {
    private String title;
    private String message;
    private String notificationType; // ALL, CLASS, GROUP, ROLE
    private String targetRole;       // For ROLE type notifications
    private String classId;          // For CLASS type notifications
    private Integer groupId;         // For GROUP type notifications
    private List<Integer> userIds;   // For specific users
    
    // Default constructor
    public NotificationRequest() {
    }
    
    // Getters and setters
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
    
    public String getNotificationType() {
        return notificationType;
    }
    
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
    
    public String getTargetRole() {
        return targetRole;
    }
    
    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }
    
    public String getClassId() {
        return classId;
    }
    
    public void setClassId(String classId) {
        this.classId = classId;
    }
    
    public Integer getGroupId() {
        return groupId;
    }
    
    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }
    
    public List<Integer> getUserIds() {
        return userIds;
    }
    
    public void setUserIds(List<Integer> userIds) {
        this.userIds = userIds;
    }
} 