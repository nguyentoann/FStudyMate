package com.mycompany.fstudymate.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/test")
    public Map<String, Object> test() {
        System.out.println("Test endpoint called!");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test endpoint is working!");
        return response;
    }
    
    @GetMapping("/validate/username")
    public Map<String, Object> validateUsername(@RequestParam String username) {
        System.out.println("Validating username: " + username);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", username.equals("admin") || username.equals("test"));
        return response;
    }
    
    @GetMapping("/validate/email")
    public Map<String, Object> validateEmail(@RequestParam String email) {
        System.out.println("Validating email: " + email);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", email.equals("admin@example.com") || email.equals("test@example.com"));
        return response;
    }
    
    @GetMapping("/validate/phone")
    public Map<String, Object> validatePhone(@RequestParam String phone) {
        System.out.println("Validating phone: " + phone);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", phone.equals("1234567890") || phone.equals("0987654321"));
        return response;
    }
} 