package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "password_hash", nullable = false)
    private String password;
    
    @Column(name = "email", unique = true)
    private String email;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "role")
    private String role;
    
    @Column(name = "class_id")
    private String classId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Quiz> quizzes;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<QuizTaken> quizTakens;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getClassId() {
        return classId;
    }
    
    public void setClassId(String classId) {
        this.classId = classId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<Quiz> getQuizzes() {
        return quizzes;
    }
    
    public void setQuizzes(List<Quiz> quizzes) {
        this.quizzes = quizzes;
    }
    
    public List<QuizTaken> getQuizTakens() {
        return quizTakens;
    }
    
    public void setQuizTakens(List<QuizTaken> quizTakens) {
        this.quizTakens = quizTakens;
    }
    
    // Constructors
    
    public User() {
    }
    
    public User(String username, String password, String email, String fullName, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
} 