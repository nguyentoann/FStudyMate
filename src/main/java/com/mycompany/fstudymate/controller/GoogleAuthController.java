package com.mycompany.fstudymate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);

    /**
     * Endpoint that now returns a message that Google OAuth is disabled
     */
    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        logger.info("Google OAuth login attempt received but feature is disabled");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Google login has been disabled for this application");
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
} 