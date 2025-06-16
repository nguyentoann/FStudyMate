package com.mycompany.fstudymate.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.fstudymate.service.StorageService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000"}, allowCredentials = "true")
public class AdminController {

    private static final Logger logger = Logger.getLogger(AdminController.class.getName());
    
    @Autowired
    private StorageService storageService;
    
    /**
     * Get Samba storage information
     */
    @GetMapping("/storage-info")
    public ResponseEntity<Map<String, Object>> getStorageInfo() {
        try {
            logger.info("Fetching storage information");
            
            // Use StorageService to get real storage information
            Map<String, Object> storageInfo = storageService.getStorageInfo();
            
            logger.info("Storage information fetched successfully");
            return ResponseEntity.ok(storageInfo);
        } catch (Exception e) {
            logger.severe("Error fetching storage information: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Set development mode for testing
     * This enables test data if file counts are zero
     */
    @PostMapping("/set-dev-mode")
    public ResponseEntity<Map<String, Object>> setDevMode(@RequestParam boolean enabled) {
        try {
            logger.info("Setting development mode: " + enabled);
            
            // Set system property for development mode
            if (enabled) {
                System.setProperty("spring.profiles.active", "development");
                logger.info("Development mode enabled");
            } else {
                System.setProperty("spring.profiles.active", "production");
                logger.info("Production mode enabled");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mode", enabled ? "development" : "production");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error setting development mode: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 