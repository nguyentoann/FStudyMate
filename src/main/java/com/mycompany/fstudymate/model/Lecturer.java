package com.mycompany.fstudymate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lecturers")
public class Lecturer {
    
    @Id
    @Column(name = "lecturer_id")
    private String lecturerId;
    
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "specializations", columnDefinition = "text")
    private String specializations;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;

    public Lecturer() {
    }

    public Lecturer(String lecturerId, Integer userId, String department, String specializations) {
        this.lecturerId = lecturerId;
        this.userId = userId;
        this.department = department;
        this.specializations = specializations;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
} 