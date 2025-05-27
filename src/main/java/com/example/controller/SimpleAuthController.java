package com.example.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/simple-auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SimpleAuthController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        System.out.println("Simple login called with: " + credentials);
        Map<String, Object> response = new HashMap<>();
        
        // Basic validation
        if (credentials.get("email") == null || credentials.get("password") == null) {
            response.put("success", false);
            response.put("error", "Email and password are required");
            return response;
        }
        
        // Hardcoded admin login
        if ("admin@example.com".equals(credentials.get("email")) && 
            "admin123".equals(credentials.get("password"))) {
            
            response.put("success", true);
            response.put("id", 1);
            response.put("email", "admin@example.com");
            response.put("role", "admin");
            response.put("username", "admin");
            response.put("fullName", "System Administrator");
            return response;
        }
        
        // Default "successful" login for testing
        response.put("success", true);
        response.put("id", 999);
        response.put("email", credentials.get("email"));
        response.put("role", "student");
        response.put("username", "testuser");
        response.put("fullName", "Test User");
        return response;
    }
    
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> userData) {
        System.out.println("Simple register called with: " + userData);
        Map<String, Object> response = new HashMap<>();
        
        response.put("success", true);
        response.put("id", 999);
        response.put("email", userData.get("email"));
        response.put("username", userData.get("username"));
        response.put("fullName", userData.get("fullName"));
        response.put("role", userData.get("role"));
        
        return response;
    }
} 