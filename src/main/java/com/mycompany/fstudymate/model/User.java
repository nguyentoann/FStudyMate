package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @Column(name = "role", length = 255)
    private String role;
    
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "profile_image_url", length = 255)
    private String profileImageUrl;
    
    @Column(name = "class_id", length = 20)
    private String classId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "verified")
    private Boolean verified = false;
    
    @Column(name = "active")
    private Boolean active = true;
    
    @Column(name = "auth_provider", length = 20)
    private String authProvider;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Quiz> quizzes;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<QuizTaken> quizTakens;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Methods for OAuth2 authentication
    
    /**
     * Get the user's display name
     * @return the fullName if present, otherwise the username
     */
    public String getName() {
        return fullName != null ? fullName : username;
    }
    
    /**
     * Set the user's display name
     * @param name the name to set
     */
    public void setName(String name) {
        this.fullName = name;
    }
    
    /**
     * Get the authentication provider (e.g., GOOGLE, FACEBOOK, LOCAL)
     * @return the authentication provider
     */
    public String getAuthProvider() {
        return authProvider;
    }
    
    /**
     * Set the authentication provider
     * @param authProvider the authentication provider to set
     */
    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }
    
    /**
     * Check if the user account is active
     * @return true if active, false otherwise
     */
    public Boolean isActive() {
        return active;
    }
    
    /**
     * Set the active status of the user account
     * @param active the active status to set
     */
    public void setActive(Boolean active) {
        this.active = active;
    }
} 