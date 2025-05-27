package com.mycompany.fstudymate.dto;

public class UserStatisticsDTO {
    private Integer totalUsers;
    private Integer activeUsers;
    private Integer newUsersToday;
    private Integer averageSessionTime;
    
    // Constructors
    public UserStatisticsDTO() {
    }
    
    public UserStatisticsDTO(Integer totalUsers, Integer activeUsers, Integer newUsersToday, Integer averageSessionTime) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.newUsersToday = newUsersToday;
        this.averageSessionTime = averageSessionTime;
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
} 