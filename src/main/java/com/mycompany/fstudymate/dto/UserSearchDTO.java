package com.mycompany.fstudymate.dto;

/**
 * DTO chứa thông tin tìm kiếm người dùng
 */
public class UserSearchDTO {
    private Integer id;
    private String username;
    private String fullName;
    private String studentId;
    private String profileImageUrl;
    private String role;
    
    public UserSearchDTO() {
    }
    
    public UserSearchDTO(Integer id, String username, String fullName, String studentId, 
                         String profileImageUrl, String role) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.studentId = studentId;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
} 