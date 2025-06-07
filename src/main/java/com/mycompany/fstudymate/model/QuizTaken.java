package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "QuizTaken")
public class QuizTaken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "quiz_id", nullable = false)
    private Integer quizId;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "submit_time")
    private LocalDateTime submitTime;
    
    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score = BigDecimal.ZERO;
    
    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore = BigDecimal.ZERO;
    
    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage = BigDecimal.ZERO;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private QuizStatus status = QuizStatus.IN_PROGRESS;
    
    @Column(name = "selected_answers", columnDefinition = "json")
    private String selectedAnswers;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "activity_log", columnDefinition = "json")
    private String activityLog;
    
    @Column(name = "completion_time")
    private Integer completionTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Quiz quiz;
    
    public enum QuizStatus {
        COMPLETED,
        IN_PROGRESS,
        ABANDONED,
        FAILED
    }
    
    // Add a log entry to the activity log
    public void addLogEntry(String eventType, String details) {
        String logEntry = String.format("{\"timestamp\":\"%s\",\"event\":\"%s\",\"details\":\"%s\"}",
                LocalDateTime.now(), eventType, details);
        
        if (this.activityLog == null || this.activityLog.isEmpty()) {
            this.activityLog = "[" + logEntry + "]";
        } else {
            // Remove the closing bracket, add the new entry, and close the array
            this.activityLog = this.activityLog.substring(0, this.activityLog.length() - 1) 
                + "," + logEntry + "]";
        }
    }
    
    // Calculate completion time when quiz is submitted
    public void calculateCompletionTime() {
        if (this.startTime != null && this.submitTime != null) {
            this.completionTime = (int) java.time.Duration.between(this.startTime, this.submitTime).getSeconds();
        }
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getQuizId() {
        return quizId;
    }

    public void setQuizId(Integer quizId) {
        this.quizId = quizId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getSubmitTime() {
        return submitTime;
    }

    public void setSubmitTime(LocalDateTime submitTime) {
        this.submitTime = submitTime;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public BigDecimal getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(BigDecimal maxScore) {
        this.maxScore = maxScore;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public QuizStatus getStatus() {
        return status;
    }

    public void setStatus(QuizStatus status) {
        this.status = status;
    }

    public String getSelectedAnswers() {
        return selectedAnswers;
    }

    public void setSelectedAnswers(String selectedAnswers) {
        this.selectedAnswers = selectedAnswers;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getActivityLog() {
        return activityLog;
    }

    public void setActivityLog(String activityLog) {
        this.activityLog = activityLog;
    }

    public Integer getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(Integer completionTime) {
        this.completionTime = completionTime;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }
    
    // Constructors
    public QuizTaken() {
    }
    
    public QuizTaken(Integer userId, Integer quizId, LocalDateTime startTime, QuizStatus status) {
        this.userId = userId;
        this.quizId = quizId;
        this.startTime = startTime;
        this.status = status;
    }
} 