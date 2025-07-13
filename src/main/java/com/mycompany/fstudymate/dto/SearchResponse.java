package com.mycompany.fstudymate.dto;

import java.util.List;
import java.util.ArrayList;

/**
 * DTO chứa kết quả tìm kiếm tổng hợp từ nhiều loại đối tượng
 */
public class SearchResponse {
    private List<UserSearchDTO> users;
    private List<SubjectSearchDTO> subjects;
    private List<ClassSearchDTO> classes;
    private List<LessonSearchDTO> lessons;
    
    public SearchResponse() {
        this.users = new ArrayList<>();
        this.subjects = new ArrayList<>();
        this.classes = new ArrayList<>();
        this.lessons = new ArrayList<>();
    }
    
    // Getters and Setters
    public List<UserSearchDTO> getUsers() {
        return users;
    }
    
    public void setUsers(List<UserSearchDTO> users) {
        this.users = users;
    }
    
    public List<SubjectSearchDTO> getSubjects() {
        return subjects;
    }
    
    public void setSubjects(List<SubjectSearchDTO> subjects) {
        this.subjects = subjects;
    }
    
    public List<ClassSearchDTO> getClasses() {
        return classes;
    }
    
    public void setClasses(List<ClassSearchDTO> classes) {
        this.classes = classes;
    }
    
    public List<LessonSearchDTO> getLessons() {
        return lessons;
    }
    
    public void setLessons(List<LessonSearchDTO> lessons) {
        this.lessons = lessons;
    }
} 