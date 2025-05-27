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
public class PasswordUpdateController {

    @PostMapping("/update-password")
    public ResponseEntity<Map<String, Object>> updatePassword(@RequestBody Map<String, Object> passwordData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract data
            Integer userId = passwordData.get("userId") instanceof Number 
                ? ((Number) passwordData.get("userId")).intValue() 
                : Integer.parseInt((String) passwordData.get("userId"));
            String currentPassword = (String) passwordData.get("currentPassword");
            String newPassword = (String) passwordData.get("newPassword");
            
            // Validate input
            if (userId == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User ID, current password, and new password are required"
                ));
            }
            
            // Update password
            UserDAO userDAO = new UserDAO();
            int result = userDAO.updatePassword(userId, currentPassword, newPassword);
            
            if (result == 1) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Password updated successfully"
                ));
            } else if (result == 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Current password is incorrect"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error updating password: " + e.getMessage()
            ));
        }
    }
} 