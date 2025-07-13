package com.mycompany.fstudymate.dto;

import com.mycompany.fstudymate.model.Feedback;
import com.mycompany.fstudymate.model.Feedback.FeedbackType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FeedbackResponse {

    private Long id;
    private String content;
    private Integer rating;
    private FeedbackType type;
    private String targetId;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private String userFullName;
    private String userRole;
    private String userProfileImage;
    
    // Lesson feedback fields
    private Integer lessonId;
    private String lessonTitle;
    private Integer subjectId;
    private String subjectName;
    private String subjectCode;
    private Integer termNo;
    
    // Lecturer feedback fields
    private String lecturerId;
    private String lecturerFullName;
    private String lecturerDepartment;
    private String lecturerSpecializations;
    private String lecturerProfileImage;
    
    // Replies
    private List<FeedbackReplyResponse> replies = new ArrayList<>();
    private int replyCount;

    // Constructors
    public FeedbackResponse() {
    }

    public FeedbackResponse(Feedback feedback) {
        this.id = feedback.getId();
        this.content = feedback.getContent();
        this.rating = feedback.getRating();
        this.type = feedback.getType();
        this.targetId = feedback.getTargetId();
        this.createdBy = feedback.getCreatedBy();
        this.createdAt = feedback.getCreatedAt();
        
        // Set lesson ID if available
        this.lessonId = feedback.getLessonId();
        
        if (feedback.getUser() != null) {
            this.userFullName = feedback.getUser().getFullName();
            this.userRole = feedback.getUser().getRole();
            this.userProfileImage = feedback.getUser().getProfileImageUrl();
        } else {
            // Đặt giá trị mặc định cho phản hồi ẩn danh
            this.userFullName = "Người dùng ẩn danh";
            this.userRole = "Khách";
            this.userProfileImage = "/images/default-avatar.svg";
        }
        
        // Set lesson information if available
        if (feedback.getLesson() != null) {
            this.lessonTitle = feedback.getLesson().getTitle();
            this.subjectId = feedback.getLesson().getSubjectId();
            
            // Set subject information if available
            if (feedback.getLesson().getSubject() != null) {
                this.subjectName = feedback.getLesson().getSubject().getName();
                this.subjectCode = feedback.getLesson().getSubject().getCode();
                this.termNo = feedback.getLesson().getSubject().getTermNo();
            }
        }
        
        // Set lecturer information if available
        if (feedback.getType() == FeedbackType.LECTURER && feedback.getLecturer() != null) {
            this.lecturerId = feedback.getLecturer().getLecturerId();
            this.lecturerDepartment = feedback.getLecturer().getDepartment();
            this.lecturerSpecializations = feedback.getLecturer().getSpecializations();
            
            if (feedback.getLecturer().getUser() != null) {
                this.lecturerFullName = feedback.getLecturer().getUser().getFullName();
                this.lecturerProfileImage = feedback.getLecturer().getUser().getProfileImageUrl();
            }
        }
        
        // Set replies if available
        if (feedback.getReplies() != null && !feedback.getReplies().isEmpty()) {
            this.replies = feedback.getReplies().stream()
                .map(FeedbackReplyResponse::new)
                .collect(Collectors.toList());
        }
        
        this.replyCount = this.replies.size();
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
    
    public Integer getLessonId() {
        return lessonId;
    }
    
    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }
    
    public String getLessonTitle() {
        return lessonTitle;
    }
    
    public void setLessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
    }
    
    public Integer getSubjectId() {
        return subjectId;
    }
    
    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }
    
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    
    public String getSubjectCode() {
        return subjectCode;
    }
    
    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }
    
    public Integer getTermNo() {
        return termNo;
    }
    
    public void setTermNo(Integer termNo) {
        this.termNo = termNo;
    }
    
    public String getLecturerId() {
        return lecturerId;
    }
    
    public void setLecturerId(String lecturerId) {
        this.lecturerId = lecturerId;
    }
    
    public String getLecturerFullName() {
        return lecturerFullName;
    }
    
    public void setLecturerFullName(String lecturerFullName) {
        this.lecturerFullName = lecturerFullName;
    }
    
    public String getLecturerDepartment() {
        return lecturerDepartment;
    }
    
    public void setLecturerDepartment(String lecturerDepartment) {
        this.lecturerDepartment = lecturerDepartment;
    }
    
    public String getLecturerSpecializations() {
        return lecturerSpecializations;
    }
    
    public void setLecturerSpecializations(String lecturerSpecializations) {
        this.lecturerSpecializations = lecturerSpecializations;
    }
    
    public String getLecturerProfileImage() {
        return lecturerProfileImage;
    }
    
    public void setLecturerProfileImage(String lecturerProfileImage) {
        this.lecturerProfileImage = lecturerProfileImage;
    }
    
    public List<FeedbackReplyResponse> getReplies() {
        return replies;
    }
    
    public void setReplies(List<FeedbackReplyResponse> replies) {
        this.replies = replies;
        this.replyCount = replies.size();
    }
    
    public int getReplyCount() {
        return replyCount;
    }
    
    public void setReplyCount(int replyCount) {
        this.replyCount = replyCount;
    }
} 