package com.mycompany.fstudymate.dto;

/**
 * DTO chứa thông tin tìm kiếm môn học
 */
public class SubjectSearchDTO {
    private Integer id;
    private String code;
    private String name;
    private Integer termNo;
    private Boolean active;
    
    public SubjectSearchDTO() {
    }
    
    public SubjectSearchDTO(Integer id, String code, String name, Integer termNo, Boolean active) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.termNo = termNo;
        this.active = active;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getTermNo() {
        return termNo;
    }
    
    public void setTermNo(Integer termNo) {
        this.termNo = termNo;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
} 