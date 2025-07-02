package com.mycompany.fstudymate.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Controller for health check endpoints
 */
@RestController
@CrossOrigin(
    origins = {"*"}, 
    allowedHeaders = "*", 
    methods = {RequestMethod.GET, RequestMethod.OPTIONS},
    allowCredentials = "true"
)
public class HealthController {

    private static final Logger logger = Logger.getLogger(HealthController.class.getName());
    
    /**
     * Basic health check endpoint accessible without authentication
     * 
     * @return Simple health status
     */
    @GetMapping("/open/health")
    public ResponseEntity<?> healthCheck() {
        logger.info("Health check requested");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "API is running");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * CORS test endpoint
     * 
     * @return CORS test response
     */
    @GetMapping("/open/cors-test")
    public ResponseEntity<?> corsTest() {
        logger.info("CORS test requested");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "CORS is properly configured");
        
        return ResponseEntity.ok(response);
    }
} 