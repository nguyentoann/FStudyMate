package com.mycompany.fstudymate;

import dao.UserDAO;
import model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
@RequestMapping("/api")
public class UpdateProfileController {

    @PostMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> profileData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract user ID
            Integer userId = profileData.get("userId") instanceof Number 
                ? ((Number) profileData.get("userId")).intValue() 
                : Integer.parseInt((String) profileData.get("userId"));
            
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
            }
            
            // Create a User object with the updated data
            User updatedUser = new User();
            updatedUser.setId(userId);
            
            // Set basic user details
            if (profileData.containsKey("fullName")) {
                updatedUser.setFullName((String) profileData.get("fullName"));
            }
            if (profileData.containsKey("phoneNumber")) {
                updatedUser.setPhoneNumber((String) profileData.get("phoneNumber"));
            }
            if (profileData.containsKey("profileImageUrl")) {
                updatedUser.setProfileImageUrl((String) profileData.get("profileImageUrl"));
            }
            
            // Use UserDAO to update the user
            UserDAO userDAO = UserDAO.getInstance();
            boolean success = userDAO.updateUserProfile(updatedUser, profileData);
            
            if (success) {
                // Return the updated user data
                response.put("id", updatedUser.getId());
                response.put("fullName", updatedUser.getFullName());
                response.put("phoneNumber", updatedUser.getPhoneNumber());
                response.put("profileImageUrl", updatedUser.getProfileImageUrl());
                
                // Add role-specific data if needed
                response.putAll(profileData);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Failed to update user profile"));
            }
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }
} 