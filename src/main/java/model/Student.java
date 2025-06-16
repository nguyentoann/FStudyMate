package model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Student {
    @JsonProperty("studentId")
    private String studentId;
    
    @JsonProperty("userId")
    private int userId;
    
    @JsonProperty("fullName")
    private String fullName;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("dateOfBirth")
    private String dateOfBirth;
    
    @JsonProperty("gender")
    private String gender;
    
    @JsonProperty("classId")
    private String classId;
    
    @JsonProperty("academicMajor")
    private String academicMajor;
    
    @JsonProperty("enrollmentTerm")
    private String enrollmentTerm;

    public Student() {
    }

    public Student(String studentId, int userId, String fullName, String email, String dateOfBirth, 
                  String gender, String classId, String academicMajor, String enrollmentTerm) {
        this.studentId = studentId;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.classId = classId;
        this.academicMajor = academicMajor;
        this.enrollmentTerm = enrollmentTerm;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getAcademicMajor() {
        return academicMajor;
    }

    public void setAcademicMajor(String academicMajor) {
        this.academicMajor = academicMajor;
    }

    public String getEnrollmentTerm() {
        return enrollmentTerm;
    }

    public void setEnrollmentTerm(String enrollmentTerm) {
        this.enrollmentTerm = enrollmentTerm;
    }
} 