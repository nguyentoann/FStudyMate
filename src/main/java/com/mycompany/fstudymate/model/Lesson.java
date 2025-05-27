package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "Lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;
    
    @Column(name = "SubjectId")
    private Integer subjectId;
    
    @Column(name = "Title")
    private String title;
    
    @Column(name = "Content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "Date")
    private Date date;
    
    @Column(name = "LecturerId")
    private Integer lecturerId;
    
    @Column(name = "Likes")
    private Integer likes;
    
    @Column(name = "ViewCount")
    private Integer viewCount;
    
    // Manual getters and setters since Lombok isn't working on Windows
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getSubjectId() {
        return subjectId;
    }
    
    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Date getDate() {
        return date;
    }
    
    public void setDate(Date date) {
        this.date = date;
    }
    
    public Integer getLecturerId() {
        return lecturerId;
    }
    
    public void setLecturerId(Integer lecturerId) {
        this.lecturerId = lecturerId;
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
} 