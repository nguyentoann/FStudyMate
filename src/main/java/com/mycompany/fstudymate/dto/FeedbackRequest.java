package com.mycompany.fstudymate.dto;

import com.mycompany.fstudymate.model.Feedback.FeedbackType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class FeedbackRequest {

    @NotBlank(message = "Content cannot be empty")
    @Size(min = 10, max = 2000, message = "Content must be between 10 and 2000 characters")
    private String content;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot be more than 5")
    private Integer rating;

    @NotNull(message = "Feedback type is required")
    private FeedbackType type;

    @NotBlank(message = "Target ID cannot be empty")
    private String targetId;
    
    // Optional user ID field for direct user identification
    private Integer userId;
    
    // Optional fields for lesson feedback
    private Integer lessonId;
    private Integer subjectId;
    private Integer termNo;

    // Constructors
    public FeedbackRequest() {
    }

    public FeedbackRequest(String content, Integer rating, FeedbackType type, String targetId) {
        this.content = content;
        this.rating = rating;
        this.type = type;
        this.targetId = targetId;
    }
    
    public FeedbackRequest(String content, Integer rating, FeedbackType type, String targetId, Integer userId) {
        this.content = content;
        this.rating = rating;
        this.type = type;
        this.targetId = targetId;
        this.userId = userId;
    }
    
    public FeedbackRequest(String content, Integer rating, FeedbackType type, String targetId, Integer userId, 
                          Integer lessonId, Integer subjectId, Integer termNo) {
        this.content = content;
        this.rating = rating;
        this.type = type;
        this.targetId = targetId;
        this.userId = userId;
        this.lessonId = lessonId;
        this.subjectId = subjectId;
        this.termNo = termNo;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public FeedbackType getType() {
        return type;
    }

    public void setType(FeedbackType type) {
        this.type = type;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Integer getLessonId() {
        return lessonId;
    }
    
    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }
    
    public Integer getSubjectId() {
        return subjectId;
    }
    
    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }
    
    public Integer getTermNo() {
        return termNo;
    }
    
    public void setTermNo(Integer termNo) {
        this.termNo = termNo;
    }
} 