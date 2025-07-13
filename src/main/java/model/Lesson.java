package model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class Lesson {
    @JsonProperty("id")
    private int id;
    
    @JsonProperty("subjectId")
    private int subjectId;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("content")
    private String content;
    
    @JsonProperty("date")
    private Date date;
    
    @JsonProperty("lecturerId")
    private int lecturerId;
    
    @JsonProperty("lecturer")
    private User lecturer;
    
    @JsonProperty("likes")
    private int likes;
    
    @JsonProperty("isFavorite")
    private boolean isFavorite;
    
    @JsonProperty("isLiked")
    private boolean isLiked;
    
    @JsonProperty("viewCount")
    private int viewCount;
    
    @JsonProperty("subjectCode")
    private String subjectCode;
    
    @JsonProperty("termNo")
    private Integer termNo;
    
    @JsonProperty("subject")
    private Subject subject;

    public Lesson() {
        this.date = new Date();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(int subjectId) {
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

    public int getLecturerId() {
        return lecturerId;
    }

    public void setLecturerId(int lecturerId) {
        this.lecturerId = lecturerId;
    }

    public User getLecturer() {
        return lecturer;
    }

    public void setLecturer(User lecturer) {
        this.lecturer = lecturer;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }

    public int getViewCount() {
        return viewCount;
    }

    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
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
    
    public Subject getSubject() {
        return subject;
    }
    
    public void setSubject(Subject subject) {
        this.subject = subject;
    }
} 