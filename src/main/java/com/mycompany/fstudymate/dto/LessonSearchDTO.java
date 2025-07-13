package com.mycompany.fstudymate.dto;

import java.time.LocalDateTime;

/**
 * DTO chứa thông tin tìm kiếm bài học
 */
public class LessonSearchDTO {
    private Integer id;
    private String title;
    private String contentPreview;
    private LocalDateTime date;
    private Integer likes;
    private Integer viewCount;
    private SubjectSearchDTO subject;
    private UserSearchDTO lecturer;
    
    public LessonSearchDTO() {
    }
    
    public LessonSearchDTO(Integer id, String title, String contentPreview, LocalDateTime date,
                           Integer likes, Integer viewCount) {
        this.id = id;
        this.title = title;
        this.contentPreview = contentPreview;
        this.date = date;
        this.likes = likes;
        this.viewCount = viewCount;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContentPreview() {
        return contentPreview;
    }
    
    public void setContentPreview(String contentPreview) {
        this.contentPreview = contentPreview;
    }
    
    public LocalDateTime getDate() {
        return date;
    }
    
    public void setDate(LocalDateTime date) {
        this.date = date;
    }
    
    public Integer getLikes() {
        return likes;
    }
    
    public void setLikes(Integer likes) {
        this.likes = likes;
    }
    
    public Integer getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
    
    public SubjectSearchDTO getSubject() {
        return subject;
    }
    
    public void setSubject(SubjectSearchDTO subject) {
        this.subject = subject;
    }
    
    public UserSearchDTO getLecturer() {
        return lecturer;
    }
    
    public void setLecturer(UserSearchDTO lecturer) {
        this.lecturer = lecturer;
    }
} 