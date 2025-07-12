package model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Subject {
    @JsonProperty("id")
    private int id;
    
    @JsonProperty("code")
    private String code;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("active")
    private boolean active;
    
    @JsonProperty("termNo")
    private Integer termNo;

    public Subject() {
    }

    public Subject(int id, String name, boolean active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }
    
    public Subject(int id, String code, String name, boolean active) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.active = active;
    }
    
    public Subject(int id, String code, String name, boolean active, Integer termNo) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.active = active;
        this.termNo = termNo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
    
    public Integer getTermNo() {
        return termNo;
    }
    
    public void setTermNo(Integer termNo) {
        this.termNo = termNo;
    }
} 