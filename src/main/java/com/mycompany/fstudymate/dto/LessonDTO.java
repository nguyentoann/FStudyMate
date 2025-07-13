package com.mycompany.fstudymate.dto;

import com.mycompany.fstudymate.model.Lesson;

public class LessonDTO {
    private Long id;
    private String title;
    private String content;
    private Long subjectId;
    private String subjectName; // Optional, if needed

    public LessonDTO() {
    }

    public LessonDTO(Lesson lesson) {
        this.id = Long.valueOf(lesson.getId());
        this.title = lesson.getTitle();
        this.content = lesson.getContent();
        this.subjectId = lesson.getSubject() != null ? Long.valueOf(lesson.getSubject().getId()) : null;
    }

    // Add subject name if needed
    public LessonDTO(Lesson lesson, String subjectName) {
        this(lesson);
        this.subjectName = subjectName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
} 