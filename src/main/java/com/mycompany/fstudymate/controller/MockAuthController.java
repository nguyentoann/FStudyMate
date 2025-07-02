package com.mycompany.fstudymate.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * Mock authentication controller for testing frontend without database
 * This should only be used during development
 */
@RestController
@RequestMapping("/open")
@CrossOrigin(
    origins = {"*"}, 
    allowedHeaders = "*", 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
    allowCredentials = "true"
)
public class MockAuthController {

    private static final Logger logger = Logger.getLogger(MockAuthController.class.getName());
    
    /**
     * Mock login endpoint that always succeeds with test credentials
     * 
     * @param loginRequest The login request containing email/username and password
     * @return A mock user object
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        logger.info("Mock login requested");
        
        String identifier = loginRequest.get("email");
        if (identifier == null) {
            identifier = loginRequest.get("username");
        }
        
        String password = loginRequest.get("password");
        
        logger.info("Login attempt with: " + identifier);
        
        // For testing, create a mock user response
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", UUID.randomUUID().toString());
        userResponse.put("username", identifier);
        userResponse.put("email", identifier.contains("@") ? identifier : identifier + "@example.com");
        userResponse.put("role", "student");
        userResponse.put("firstName", "Test");
        userResponse.put("lastName", "User");
        userResponse.put("token", "mock-jwt-token-" + UUID.randomUUID().toString());
        
        return ResponseEntity.ok(userResponse);
    }
    
    /**
     * Mock registration endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerRequest) {
        logger.info("Mock registration requested");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful");
        response.put("requiresVerification", false);
        
        return ResponseEntity.ok(response);
    }
} 