package com.mycompany.fstudymate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class FeedbackReplyRequest {

    // Remove @NotNull to make it optional for updates
    private Long feedbackId;
    
    // Optional - only required for nested replies
    private Long parentReplyId;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 2, max = 2000, message = "Nội dung phải từ 2 đến 2000 ký tự")
    private String content;
    
    // Trường không bắt buộc, có thể được thiết lập từ token
    private Integer userId;

    // Constructors
    public FeedbackReplyRequest() {
    }

    public FeedbackReplyRequest(Long feedbackId, String content) {
        this.feedbackId = feedbackId;
        this.content = content;
    }
    
    public FeedbackReplyRequest(Long feedbackId, Long parentReplyId, String content) {
        this.feedbackId = feedbackId;
        this.parentReplyId = parentReplyId;
        this.content = content;
    }
    
    public FeedbackReplyRequest(Long feedbackId, Long parentReplyId, String content, Integer userId) {
        this.feedbackId = feedbackId;
        this.parentReplyId = parentReplyId;
        this.content = content;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Long feedbackId) {
        this.feedbackId = feedbackId;
    }
    
    public Long getParentReplyId() {
        return parentReplyId;
    }
    
    public void setParentReplyId(Long parentReplyId) {
        this.parentReplyId = parentReplyId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
} 