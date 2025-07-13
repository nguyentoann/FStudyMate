package com.mycompany.fstudymate.dto;

public class LecturerDTO {
    private String lecturerId;
    private Integer userId;
    private String department;
    private String specializations;
    private String fullName;
    private String profileImageUrl;
    private String email;
    
    public LecturerDTO() {
    }
    
    public LecturerDTO(String lecturerId, Integer userId, String department, String specializations, 
                      String fullName, String profileImageUrl, String email) {
        this.lecturerId = lecturerId;
        this.userId = userId;
        this.department = department;
        this.specializations = specializations;
        this.fullName = fullName;
        this.profileImageUrl = profileImageUrl;
        this.email = email;
    }

    public String getLecturerId() {
        return lecturerId;
    }

    public void setLecturerId(String lecturerId) {
        this.lecturerId = lecturerId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSpecializations() {
        return specializations;
    }

    public void setSpecializations(String specializations) {
        this.specializations = specializations;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
} 