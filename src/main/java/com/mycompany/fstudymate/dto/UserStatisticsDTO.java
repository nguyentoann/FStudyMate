package com.mycompany.fstudymate.dto;

public class UserStatisticsDTO {
    private Integer totalUsers;
    private Integer activeUsers;
    private Integer newUsersToday;
    private Integer averageSessionTime;
    private Integer expiredSessions;
    
    // Constructors
    public UserStatisticsDTO() {
    }
    
    public UserStatisticsDTO(Integer totalUsers, Integer activeUsers, Integer newUsersToday, Integer averageSessionTime) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.newUsersToday = newUsersToday;
        this.averageSessionTime = averageSessionTime;
        this.expiredSessions = 0;
    }
    
    public UserStatisticsDTO(Integer totalUsers, Integer activeUsers, Integer newUsersToday, Integer averageSessionTime, Integer expiredSessions) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.newUsersToday = newUsersToday;
        this.averageSessionTime = averageSessionTime;
        this.expiredSessions = expiredSessions;
    }
    
    // Getters and Setters
    public Integer getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(Integer totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public Integer getActiveUsers() {
        return activeUsers;
    }
    
    public void setActiveUsers(Integer activeUsers) {
        this.activeUsers = activeUsers;
    }
    
    public Integer getNewUsersToday() {
        return newUsersToday;
    }
    
    public void setNewUsersToday(Integer newUsersToday) {
        this.newUsersToday = newUsersToday;
    }
    
    public Integer getAverageSessionTime() {
        return averageSessionTime;
    }
    
    public void setAverageSessionTime(Integer averageSessionTime) {
        this.averageSessionTime = averageSessionTime;
    }
    
    public Integer getExpiredSessions() {
        return expiredSessions;
    }
    
    public void setExpiredSessions(Integer expiredSessions) {
        this.expiredSessions = expiredSessions;
    }
} 