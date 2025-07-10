package com.mycompany.fstudymate;

import dao.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Search users by name or username
     * 
     * @param term Search term
     * @return List of matching users
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(
            @RequestParam String term,
            @RequestParam(required = false) String role) {
        if (term == null || term.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            UserDAO userDAO = new UserDAO();
            List<Map<String, Object>> users;
            
            if (role != null && !role.trim().isEmpty()) {
                // Search users by term and role
                users = userDAO.searchUsersByRole(term, role);
            } else {
                // Search all users by term
                users = userDAO.searchUsers(term);
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get users by role with optional filter for unassigned students
     * 
     * @param role The user role to filter by, or "ALL" to get all users
     * @param unassigned If true, only return students without a class assignment
     * @return List of users with the specified role
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole(
            @RequestParam String role,
            @RequestParam(required = false, defaultValue = "false") boolean unassigned) {
        if (role == null || role.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            UserDAO userDAO = new UserDAO();
            List<Map<String, Object>> users;
            
            if ("ALL".equalsIgnoreCase(role)) {
                // Get all users regardless of role
                users = userDAO.getAllUsers();
            } else if (unassigned && "STUDENT".equalsIgnoreCase(role)) {
                // Get unassigned students (without a class)
                users = userDAO.getUnassignedStudents();
            } else {
                // Get all users with the specified role
                users = userDAO.getUsersByRole(role);
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{userId}/assign-class")
    public ResponseEntity<Map<String, Object>> assignUserToClass(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> request) {
        
        String classId = request.get("classId");
        Map<String, Object> response = new HashMap<>();
        
        try {
            UserDAO userDAO = new UserDAO();
            boolean success = userDAO.updateStudentClassAssignment(userId, classId);
            
            if (success) {
                response.put("success", true);
                response.put("message", "User assigned to class successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to assign user to class");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error assigning user to class: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 