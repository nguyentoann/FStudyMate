package com.mycompany.fstudymate;

import dao.UserDAO;
import model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "false")
public class NoSecurityController {

    @GetMapping("/open/test")
    public Map<String, String> test() {
        return Map.of("status", "success", "message", "Open endpoint is working");
    }
    
    @PostMapping("/open/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody(required = false) Map<String, Object> credentials) {
        System.out.println("Open login called with: " + credentials);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (credentials == null) {
                response.put("status", "error");
                response.put("message", "No credentials provided");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Accept either "email" or "username" as the login field
            String login = (String) credentials.get("email");
            if (login == null) {
                login = (String) credentials.get("username");
            }
            String password = (String) credentials.get("password");
            
            if (login == null || password == null) {
                response.put("status", "error");
                response.put("message", "Username/Email and password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Check if login is email or username
            String email = login;
            if (!login.contains("@")) {
                // If login is username, we need to get the email
                try {
                    UserDAO tempDAO = new UserDAO();
                    email = tempDAO.getEmailFromUsername(login);
                    if (email == null) {
                        // Username not found
                        response.put("status", "error");
                        response.put("message", "Invalid username or password");
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                    }
                } catch (Exception e) {
                    // Continue with login as username
                    email = login;
                }
            }
            
            // Authenticate user using UserDAO
            UserDAO userDAO = new UserDAO();
            User user = userDAO.authenticate(login, password);
            
            if (user != null) {
                // Authentication successful
                response.put("status", "success");
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("fullName", user.getFullName());
                response.put("phoneNumber", user.getPhoneNumber());
                response.put("profileImageUrl", user.getProfileImageUrl());
                
                // Add role-specific properties
                if (user.getProperties() != null) {
                    response.putAll(user.getProperties());
                }
                
                return ResponseEntity.ok(response);
            } else {
                // Authentication failed - don't send OTP, just return error
                response.put("status", "error");
                response.put("message", "Invalid username/email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            System.err.println("Error in login: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 