package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        
        // Check database connection
        try {
            Boolean dbStatus = jdbcTemplate.queryForObject("SELECT 1", Boolean.class);
            response.put("database", dbStatus != null && dbStatus ? "UP" : "DOWN");
        } catch (Exception e) {
            response.put("database", "DOWN");
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
} 