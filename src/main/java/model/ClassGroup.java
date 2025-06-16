package model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ClassGroup {
    @JsonProperty("classId")
    private String classId;
    
    @JsonProperty("className")
    private String className;
    
    @JsonProperty("studentCount")
    private int studentCount;
    
    @JsonProperty("academicYear")
    private String academicYear;
    
    @JsonProperty("active")
    private boolean active;

    public ClassGroup() {
    }

    public ClassGroup(String classId, String className, int studentCount, String academicYear, boolean active) {
        this.classId = classId;
        this.className = className;
        this.studentCount = studentCount;
        this.academicYear = academicYear;
        this.active = active;
    }

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

    public int getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(int studentCount) {
        this.studentCount = studentCount;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
} 