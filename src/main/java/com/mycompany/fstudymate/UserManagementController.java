package com.mycompany.fstudymate;

import dao.UserDAO;
import model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
@RequestMapping("/api/admin")
public class UserManagementController {

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            UserDAO userDAO = UserDAO.getInstance();
            List<Map<String, Object>> users = userDAO.getAllUsers();
            
            // Ensure all phone numbers have leading zero
            for (Map<String, Object> user : users) {
                ensurePhoneNumberFormat(user);
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable int id) {
        try {
            UserDAO userDAO = UserDAO.getInstance();
            Map<String, Object> user = userDAO.getUserById(id);
            
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Ensure phone number has leading zero
            ensurePhoneNumberFormat(user);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable int id, 
            @RequestBody Map<String, Object> userData) {
        try {
            // Ensure phone number has leading zero before updating
            if (userData.containsKey("phoneNumber")) {
                String phoneNumber = (String) userData.get("phoneNumber");
                userData.put("phoneNumber", formatPhoneNumber(phoneNumber));
            }
            
            UserDAO userDAO = UserDAO.getInstance();
            boolean success = userDAO.updateUserByAdmin(id, userData);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "User updated successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to update user"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error updating user: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable int id) {
        try {
            UserDAO userDAO = UserDAO.getInstance();
            boolean success = userDAO.deleteUser(id);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "User deleted successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to delete user"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error deleting user: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/class-stats")
    public ResponseEntity<Map<String, Integer>> getClassStats() {
        try {
            UserDAO userDAO = UserDAO.getInstance();
            Map<String, Integer> stats = userDAO.getStudentClassStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/class-ids")
    public ResponseEntity<List<String>> getClassIds() {
        try {
            UserDAO userDAO = UserDAO.getInstance();
            List<String> classIds = userDAO.getAllClassIds();
            return ResponseEntity.ok(classIds);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Helper method to ensure phone numbers have a leading zero
     */
    private void ensurePhoneNumberFormat(Map<String, Object> userData) {
        if (userData.containsKey("phoneNumber")) {
            String phoneNumber = (String) userData.get("phoneNumber");
            userData.put("phoneNumber", formatPhoneNumber(phoneNumber));
        }
    }
    
    /**
     * Formats a phone number to ensure it has a leading zero
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return phoneNumber;
        }
        
        // Remove ".0" suffix if present (happens when number is stored as numeric type)
        if (phoneNumber.endsWith(".0")) {
            phoneNumber = phoneNumber.substring(0, phoneNumber.length() - 2);
        }
        
        // Add leading zero if missing
        if (!phoneNumber.startsWith("0")) {
            return "0" + phoneNumber;
        }
        
        return phoneNumber;
    }
} 