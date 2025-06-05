package model;

import java.util.HashMap;
import java.util.Map;

public class User {
    private int id;
    private String username;
    private String email;
    private String passwordHash;
    private String role;
    private String fullName;
    private String phoneNumber;
    private String profileImageUrl;
    
    // Map to store role-specific properties
    private Map<String, String> properties = new HashMap<>();
    
    public User() {
    }
    
    public User(int id, String username, String email, String passwordHash, String role, String fullName, 
                String phoneNumber, String profileImageUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
    }

    // Constructor for registration
    public User(String username, String email, String passwordHash, String role, String fullName) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.fullName = fullName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        // Ensure phone number starts with '0'
        if (phoneNumber != null && !phoneNumber.isEmpty() && !phoneNumber.startsWith("0")) {
            this.phoneNumber = "0" + phoneNumber;
        } else {
            this.phoneNumber = phoneNumber;
        }
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    
    /**
     * Sets a role-specific property
     * @param key Property name
     * @param value Property value
     */
    public void setProperty(String key, String value) {
        properties.put(key, value);
    }
    
    /**
     * Gets a role-specific property
     * @param key Property name
     * @return Property value or null if not found
     */
    public String getProperty(String key) {
        return properties.get(key);
    }
    
    /**
     * Gets all properties as a map
     * @return Map of properties
     */
    public Map<String, String> getProperties() {
        return properties;
    }
    
    /**
     * Check if this user has admin role
     * @return true if user has admin role, false otherwise
     */
    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(this.role);
    }
} 