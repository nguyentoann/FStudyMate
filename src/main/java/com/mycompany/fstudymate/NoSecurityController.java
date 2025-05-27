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
                // Check if this is due to unverified account
                boolean accountExists = userDAO.checkAccountExists(login);
                
                if (accountExists) {
                    // Assuming this is an unverified account - generate new OTP
                    response.put("status", "unverified");
                    response.put("message", "Account needs verification. A new verification code has been sent.");
                    response.put("email", email);
                    response.put("requiresVerification", true);
                    
                    // Try to resend the OTP through emergency controller
                    try {
                        java.net.URL url = new java.net.URL("http://localhost:8080/emergency/generate-otp");
                        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("POST");
                        conn.setRequestProperty("Content-Type", "application/json");
                        conn.setRequestProperty("Accept", "application/json");
                        conn.setDoOutput(true);
                        
                        String jsonInputString = "{\"email\": \"" + email + "\"}";
                        
                        try (java.io.OutputStream os = conn.getOutputStream()) {
                            byte[] input = jsonInputString.getBytes("utf-8");
                            os.write(input, 0, input.length);
                        }
                        
                        int responseCode = conn.getResponseCode();
                        System.out.println("OTP generation on login response code: " + responseCode);
                    } catch (Exception e) {
                        System.err.println("Failed to trigger OTP generation: " + e.getMessage());
                    }
                    
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                } else {
                    // Authentication failed due to invalid credentials
                    response.put("status", "error");
                    response.put("message", "Invalid username/email or password");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
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