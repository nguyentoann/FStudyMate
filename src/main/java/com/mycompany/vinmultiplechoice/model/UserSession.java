package com.mycompany.vinmultiplechoice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Index;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "user_sessions", 
    indexes = {
        @Index(name = "idx_user_session_token", columnList = "session_token"),
        @Index(name = "idx_user_session_last_activity", columnList = "last_activity"),
        @Index(name = "idx_user_session_user_id", columnList = "user_id")
    }
)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "session_token", nullable = false, length = 255)
    private String sessionToken;
    
    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // New fields for activity tracking
    
    @Column(name = "current_page")
    private String currentPage;
    
    @Column(name = "page_views")
    private Integer pageViews;
    
    @Column(name = "duration")
    private Integer duration;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    // toString method for better logging
    @Override
    public String toString() {
        return "UserSession{" +
               "id=" + id +
               ", userId=" + userId +
               ", sessionToken='" + sessionToken + '\'' +
               ", lastActivity=" + lastActivity +
               ", createdAt=" + createdAt +
               ", currentPage='" + currentPage + '\'' +
               ", pageViews=" + pageViews +
               ", duration=" + duration +
               ", ipAddress='" + ipAddress + '\'' +
               '}';
    }
    
    // Getters and Setters
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getSessionToken() {
        return sessionToken;
    }
    
    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }
    
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }
    
    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
} 