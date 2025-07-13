package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feedback_replies")
public class FeedbackReply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "feedback_id", nullable = false)
    private Long feedbackId;
    
    @Column(name = "parent_reply_id")
    private Long parentReplyId;
    
    @Column(name = "content", nullable = false, length = 2000)
    private String content;
    
    @Column(name = "created_by")
    private Integer createdBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Feedback feedback;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_reply_id", referencedColumnName = "id", insertable = false, updatable = false)
    private FeedbackReply parentReply;
    
    @OneToMany(mappedBy = "parentReply", cascade = CascadeType.ALL)
    private List<FeedbackReply> childReplies;
    
    // Constructors
    public FeedbackReply() {
        this.createdAt = LocalDateTime.now();
    }
    
    public FeedbackReply(Long feedbackId, String content, Integer createdBy) {
        this.feedbackId = feedbackId;
        this.content = content;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }
    
    public FeedbackReply(Long feedbackId, Long parentReplyId, String content, Integer createdBy) {
        this.feedbackId = feedbackId;
        this.parentReplyId = parentReplyId;
        this.content = content;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
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
    
    public Feedback getFeedback() {
        return feedback;
    }
    
    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public FeedbackReply getParentReply() {
        return parentReply;
    }
    
    public void setParentReply(FeedbackReply parentReply) {
        this.parentReply = parentReply;
    }
    
    public List<FeedbackReply> getChildReplies() {
        return childReplies;
    }
    
    public void setChildReplies(List<FeedbackReply> childReplies) {
        this.childReplies = childReplies;
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
} 