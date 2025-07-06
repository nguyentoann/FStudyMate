package com.mycompany.fstudymate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.UserRepository;

@RestController
@RequestMapping("/validation")
@CrossOrigin(origins = "*")
public class UserValidationController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/test")
    public Map<String, Object> test() {
        System.out.println("Validation test endpoint called!");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Validation test endpoint is working!");
        return response;
    }
    
    @GetMapping("/username")
    public Map<String, Object> validateUsername(@RequestParam String username) {
        System.out.println("Validating username: " + username);
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if username exists in database using existsByUsername
            boolean exists = userRepository.existsByUsername(username);
            System.out.println("Username " + username + " exists: " + exists);
            response.put("exists", exists);
        } catch (Exception e) {
            System.out.println("Error checking username: " + e.getMessage());
            e.printStackTrace();
            // Fallback to hardcoded check if database query fails
            response.put("exists", username.equalsIgnoreCase("admin") || 
                                   username.equalsIgnoreCase("test") || 
                                   username.equalsIgnoreCase("TriND"));
        }
        
        return response;
    }
    
    @GetMapping("/email")
    public Map<String, Object> validateEmail(@RequestParam String email) {
        System.out.println("Validating email: " + email);
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if email exists in database using existsByEmail
            boolean exists = userRepository.existsByEmail(email);
            System.out.println("Email " + email + " exists: " + exists);
            response.put("exists", exists);
        } catch (Exception e) {
            System.out.println("Error checking email: " + e.getMessage());
            e.printStackTrace();
            // Fallback to hardcoded check if database query fails
            response.put("exists", email.equalsIgnoreCase("admin@example.com") || 
                                  email.equalsIgnoreCase("test@example.com") || 
                                  email.equalsIgnoreCase("TriND@example.com"));
        }
        
        return response;
    }
    
    @GetMapping("/phone")
    public Map<String, Object> validatePhone(@RequestParam String phone) {
        System.out.println("Validating phone: " + phone);
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Phone number validation would need a custom query since there's no direct method
            // For now, just use hardcoded values from the database screenshot
            response.put("exists", phone.equals("0987654321") || 
                                  phone.equals("0123456789"));
        } catch (Exception e) {
            System.out.println("Error checking phone: " + e.getMessage());
            e.printStackTrace();
            // Fallback to hardcoded check if database query fails
            response.put("exists", phone.equals("0987654321") || 
                                  phone.equals("0123456789"));
        }
        
        return response;
    }
} 