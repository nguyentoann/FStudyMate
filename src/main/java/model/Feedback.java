package model;

import java.sql.Timestamp;

/**
 * Model class representing user feedback and ratings for the FStudyMate platform
 */
public class Feedback {
    private int id;
    private int userId;
    private String userName; // Store username for display
    private int rating; // 1-5 star rating
    private String comment;
    private Timestamp createdAt;
    private boolean isVisible; // Admin can hide inappropriate comments

    // Default constructor
    public Feedback() {
    }

    // Constructor with fields
    public Feedback(int id, int userId, String userName, int rating, String comment, Timestamp createdAt, boolean isVisible) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.isVisible = isVisible;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isVisible() {
        return isVisible;
    }

    public void setVisible(boolean visible) {
        isVisible = visible;
    }

    @Override
    public String toString() {
        return "Feedback{" +
                "id=" + id +
                ", userId=" + userId +
                ", userName='" + userName + '\'' +
                ", rating=" + rating +
                ", comment='" + comment + '\'' +
                ", createdAt=" + createdAt +
                ", isVisible=" + isVisible +
                '}';
    }
} 