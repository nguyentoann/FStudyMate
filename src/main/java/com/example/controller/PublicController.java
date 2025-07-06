package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class PublicController {

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test endpoint is working!");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        // Simple test implementation
        boolean exists = username.equals("admin") || username.equals("test");
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        // Simple test implementation
        boolean exists = email.equals("admin@example.com") || email.equals("test@example.com");
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestParam String phone) {
        // Simple test implementation
        boolean exists = phone.equals("1234567890") || phone.equals("0987654321");
        return ResponseEntity.ok(Map.of("exists", exists));
    }
} 