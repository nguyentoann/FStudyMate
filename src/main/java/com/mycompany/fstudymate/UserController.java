package com.mycompany.fstudymate;

import dao.UserDAO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/user")
public class UserController {

    /**
     * Search users by name or username
     * 
     * @param term Search term
     * @return List of matching users
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam String term) {
        if (term == null || term.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            UserDAO userDAO = new UserDAO();
            List<Map<String, Object>> users = userDAO.searchUsers(term);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 