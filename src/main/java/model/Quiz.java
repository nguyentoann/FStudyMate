package model;

import java.sql.Timestamp;

public class Quiz {
    private int id;
    private String title;
    private String description;
    private int userId;
    private String maMon;
    private String maDe;
    private boolean isAiGenerated;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private String password;
    private Integer timeLimit;  // in minutes
    private int securityLevel;  // 0-5 anti-cheating level

    // Constructor with all fields
    public Quiz(int id, String title, String description, int userId, String maMon, String maDe, 
                boolean isAiGenerated, Timestamp createdAt, Timestamp updatedAt, 
                String password, Integer timeLimit, int securityLevel) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.maMon = maMon;
        this.maDe = maDe;
        this.isAiGenerated = isAiGenerated;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.password = password;
        this.timeLimit = timeLimit;
        this.securityLevel = securityLevel;
    }

    // Constructor without ID (for creating new quizzes)
    public Quiz(String title, String description, int userId, String maMon, String maDe,
                boolean isAiGenerated, String password, Integer timeLimit, int securityLevel) {
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.maMon = maMon;
        this.maDe = maDe;
        this.isAiGenerated = isAiGenerated;
        this.password = password;
        this.timeLimit = timeLimit;
        this.securityLevel = securityLevel;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getMaMon() {
        return maMon;
    }

    public void setMaMon(String maMon) {
        this.maMon = maMon;
    }

    public String getMaDe() {
        return maDe;
    }

    public void setMaDe(String maDe) {
        this.maDe = maDe;
    }

    public boolean isIsAiGenerated() {
        return isAiGenerated;
    }

    public void setIsAiGenerated(boolean isAiGenerated) {
        this.isAiGenerated = isAiGenerated;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }

    public int getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(int securityLevel) {
        this.securityLevel = securityLevel;
    }
} 