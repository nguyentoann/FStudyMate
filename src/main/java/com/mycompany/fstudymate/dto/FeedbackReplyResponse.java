package com.mycompany.fstudymate.dto;

import com.mycompany.fstudymate.model.FeedbackReply;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FeedbackReplyResponse {

    private Long id;
    private Long feedbackId;
    private Long parentReplyId;
    private String content;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private String userFullName;
    private String userRole;
    private String userProfileImage;
    private List<FeedbackReplyResponse> childReplies = new ArrayList<>();
    private String replyToUserName; // Name of the user being replied to

    // Constructors
    public FeedbackReplyResponse() {
    }

    public FeedbackReplyResponse(FeedbackReply reply) {
        this.id = reply.getId();
        this.feedbackId = reply.getFeedbackId();
        this.parentReplyId = reply.getParentReplyId();
        this.content = reply.getContent();
        this.createdBy = reply.getCreatedBy();
        this.createdAt = reply.getCreatedAt();
        
        if (reply.getUser() != null) {
            this.userFullName = reply.getUser().getFullName();
            this.userRole = reply.getUser().getRole();
            this.userProfileImage = reply.getUser().getProfileImageUrl();
        } else {
            // Đặt giá trị mặc định cho phản hồi ẩn danh
            this.userFullName = "Người dùng ẩn danh";
            this.userRole = "Khách";
            this.userProfileImage = "/images/default-avatar.svg";
        }
        
        // Set reply to username if this is a nested reply
        if (reply.getParentReply() != null && reply.getParentReply().getUser() != null) {
            this.replyToUserName = reply.getParentReply().getUser().getFullName();
        }
        
        // Add child replies if any
        if (reply.getChildReplies() != null && !reply.getChildReplies().isEmpty()) {
            this.childReplies = reply.getChildReplies().stream()
                .map(FeedbackReplyResponse::new)
                .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getUserProfileImage() {
        return userProfileImage;
    }

    public void setUserProfileImage(String userProfileImage) {
        this.userProfileImage = userProfileImage;
    }
    
    public List<FeedbackReplyResponse> getChildReplies() {
        return childReplies;
    }
    
    public void setChildReplies(List<FeedbackReplyResponse> childReplies) {
        this.childReplies = childReplies;
    }
    
    public String getReplyToUserName() {
        return replyToUserName;
    }
    
    public void setReplyToUserName(String replyToUserName) {
        this.replyToUserName = replyToUserName;
    }
    
    public boolean hasChildReplies() {
        return childReplies != null && !childReplies.isEmpty();
    }
} 