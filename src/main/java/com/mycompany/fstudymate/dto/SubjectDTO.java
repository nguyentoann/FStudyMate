package com.mycompany.fstudymate.dto;

import com.mycompany.fstudymate.model.Subject;

public class SubjectDTO {
    private Long id;
    private String code;
    private String name;
    private Boolean active;
    private Integer termNo;

    public SubjectDTO() {
    }

    public SubjectDTO(Subject subject) {
        this.id = Long.valueOf(subject.getId());
        this.code = subject.getCode();
        this.name = subject.getName();
        this.active = subject.getActive();
        this.termNo = subject.getTermNo();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Integer getTermNo() {
        return termNo;
    }

    public void setTermNo(Integer termNo) {
        this.termNo = termNo;
    }
} 