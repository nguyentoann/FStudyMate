package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.service.SambaSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for manually triggering Samba synchronization
 */
@RestController
@RequestMapping("/api/admin/sync")
public class SambaSyncController {

    @Autowired
    private SambaSyncService sambaSyncService;

    /**
     * Manually trigger a Samba directory synchronization
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startSync() {
        try {
            long startTime = System.currentTimeMillis();
            Map<String, Object> syncResults = sambaSyncService.syncSambaDirectories();
            long endTime = System.currentTimeMillis();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Samba directory synchronization completed successfully");
            response.put("executionTimeMs", endTime - startTime);
            response.put("results", syncResults);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error during Samba directory synchronization: " + e.getMessage());
            response.put("errorType", e.getClass().getSimpleName());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 