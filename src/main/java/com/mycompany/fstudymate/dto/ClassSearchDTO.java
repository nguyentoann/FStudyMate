package com.mycompany.fstudymate.dto;

/**
 * DTO chứa thông tin tìm kiếm lớp học
 */
public class ClassSearchDTO {
    private String classId;
    private String className;
    private Integer currentStudents;
    private Integer maxStudents;
    private Boolean isActive;
    private String majorName;
    private String termName;
    private UserSearchDTO homeroomTeacher;
    
    public ClassSearchDTO() {
    }
    
    public ClassSearchDTO(String classId, String className, Integer currentStudents, 
                          Integer maxStudents, Boolean isActive, String majorName, 
                          String termName) {
        this.classId = classId;
        this.className = className;
        this.currentStudents = currentStudents;
        this.maxStudents = maxStudents;
        this.isActive = isActive;
        this.majorName = majorName;
        this.termName = termName;
    }
    
    // Getters and Setters
    public String getClassId() {
        return classId;
    }
    
    public void setClassId(String classId) {
        this.classId = classId;
    }
    
    public String getClassName() {
        return className;
    }
    
    public void setClassName(String className) {
        this.className = className;
    }
    
    public Integer getCurrentStudents() {
        return currentStudents;
    }
    
    public void setCurrentStudents(Integer currentStudents) {
        this.currentStudents = currentStudents;
    }
    
    public Integer getMaxStudents() {
        return maxStudents;
    }
    
    public void setMaxStudents(Integer maxStudents) {
        this.maxStudents = maxStudents;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getMajorName() {
        return majorName;
    }
    
    public void setMajorName(String majorName) {
        this.majorName = majorName;
    }
    
    public String getTermName() {
        return termName;
    }
    
    public void setTermName(String termName) {
        this.termName = termName;
    }
    
    public UserSearchDTO getHomeroomTeacher() {
        return homeroomTeacher;
    }
    
    public void setHomeroomTeacher(UserSearchDTO homeroomTeacher) {
        this.homeroomTeacher = homeroomTeacher;
    }
} 