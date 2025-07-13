package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "feedbacks")
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "content", nullable = false, length = 2000)
    private String content;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private FeedbackType type;
    
    @Column(name = "target_id", nullable = false)
    private String targetId;
    
    @Column(name = "created_by", nullable = true)
    private Integer createdBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "lesson_id", nullable = true)
    private Integer lessonId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", referencedColumnName = "ID", insertable = false, updatable = false)
    private Lesson lesson;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", referencedColumnName = "lecturer_id", insertable = false, updatable = false)
    private Lecturer lecturer;
    
    @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedbackReply> replies = new ArrayList<>();
    
    // Enum cho các loại feedback
    public enum FeedbackType {
        LESSON,
        LECTURER,
        SYSTEM,
        USER
    }
    
    // Constructors
    public Feedback() {
    }
    
    public Feedback(String content, Integer rating, FeedbackType type, String targetId, Integer createdBy) {
        this.content = content;
        this.rating = rating;
        this.type = type;
        this.targetId = targetId;
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Integer getLessonId() {
        return lessonId;
    }
    
    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }
    
    public Lesson getLesson() {
        return lesson;
    }
    
    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }
    
    public Lecturer getLecturer() {
        return lecturer;
    }
    
    public void setLecturer(Lecturer lecturer) {
        this.lecturer = lecturer;
    }
    
    public List<FeedbackReply> getReplies() {
        return replies;
    }
    
    public void setReplies(List<FeedbackReply> replies) {
        this.replies = replies;
    }
    
    public void addReply(FeedbackReply reply) {
        replies.add(reply);
        reply.setFeedback(this);
    }
    
    public void removeReply(FeedbackReply reply) {
        replies.remove(reply);
        reply.setFeedback(null);
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
} 