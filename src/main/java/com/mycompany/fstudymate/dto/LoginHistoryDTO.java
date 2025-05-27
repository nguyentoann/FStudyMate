package com.mycompany.fstudymate.dto;

public class LoginHistoryDTO {
    private String date;
    private Integer count;
    
    // Constructors
    public LoginHistoryDTO() {
    }
    
    public LoginHistoryDTO(String date, Integer count) {
        this.date = date;
        this.count = count;
    }
    
    // Getters and Setters
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public Integer getCount() {
        return count;
    }
    
    public void setCount(Integer count) {
        this.count = count;
    }
} 