package com.mycompany.vinmultiplechoice.dto;

import java.util.Map;

public class UserActivityDTO {
    private Integer userId;
    private String username;
    private String sessionToken;
    private Integer duration;
    private String currentPage;
    private Integer pageViews;
    private String ipAddress;
    private Map<String, Object> device;
    private Boolean isFinal;
    
    // Constructors
    public UserActivityDTO() {
    }
    
    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getSessionToken() {
        return sessionToken;
    }
    
    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getCurrentPage() {
        return currentPage;
    }
    
    public void setCurrentPage(String currentPage) {
        this.currentPage = currentPage;
    }
    
    public Integer getPageViews() {
        return pageViews;
    }
    
    public void setPageViews(Integer pageViews) {
        this.pageViews = pageViews;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public Map<String, Object> getDevice() {
        return device;
    }
    
    public void setDevice(Map<String, Object> device) {
        this.device = device;
    }
    
    public Boolean getIsFinal() {
        return isFinal;
    }
    
    public void setIsFinal(Boolean isFinal) {
        this.isFinal = isFinal;
    }
} 