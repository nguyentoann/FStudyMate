package com.mycompany.fstudymate.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Controller for handling IR device commands directly in the main application
 * This eliminates the need for a separate IR Remote server
 */
@RestController
@RequestMapping("/api/device")
public class IRDeviceController {

    // Queue of pending commands for ESP32 devices
    private final Map<String, ConcurrentLinkedQueue<IRCommand>> deviceCommandQueues = new ConcurrentHashMap<>();
    
    // Track command IDs
    private final AtomicLong commandIdGenerator = new AtomicLong(1);
    
    // Store device last seen timestamp
    private final Map<String, Long> deviceLastSeen = new ConcurrentHashMap<>();
    
    // ESP32 polls this endpoint to check for commands
    @GetMapping("/{deviceId}/commands")
    public ResponseEntity<?> getNextCommand(@PathVariable String deviceId) {
        // Update last seen timestamp
        deviceLastSeen.put(deviceId, System.currentTimeMillis());
        
        // Initialize queue if it doesn't exist
        deviceCommandQueues.putIfAbsent(deviceId, new ConcurrentLinkedQueue<>());
        
        // Get the next command for this device
        IRCommand nextCommand = deviceCommandQueues.get(deviceId).poll();
        
        if (nextCommand != null) {
            System.out.println("Device " + deviceId + " retrieved command: " + nextCommand.getType() + ", " + nextCommand.getCode());
            return ResponseEntity.ok(nextCommand);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
    
    // Client sends a command to be executed by a specific ESP32
    @PostMapping("/{deviceId}/command")
    public ResponseEntity<IRCommand> sendCommand(
            @PathVariable String deviceId,
            @RequestBody IRCommand command) {
        
        // Initialize queue if it doesn't exist
        deviceCommandQueues.putIfAbsent(deviceId, new ConcurrentLinkedQueue<>());
        
        // Set command ID
        command.setId(commandIdGenerator.getAndIncrement());
        
        // Add command to the device's queue
        deviceCommandQueues.get(deviceId).add(command);
        
        System.out.println("Queued command for device " + deviceId + ": " + command.getType() + ", " + command.getCode());
        return ResponseEntity.ok(command);
    }
    
    // ESP32 acknowledges a command was executed
    @PostMapping("/{deviceId}/ack/{commandId}")
    public ResponseEntity<Map<String, String>> acknowledgeCommand(
            @PathVariable String deviceId,
            @PathVariable long commandId) {
        
        // Update last seen timestamp
        deviceLastSeen.put(deviceId, System.currentTimeMillis());
        System.out.println("Device " + deviceId + " acknowledged command " + commandId);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "acknowledged");
        return ResponseEntity.ok(response);
    }
    
    // Get device status (online/offline)
    @GetMapping("/{deviceId}/status")
    public ResponseEntity<Map<String, Object>> getDeviceStatus(@PathVariable String deviceId) {
        Map<String, Object> status = new HashMap<>();
        
        Long lastSeenTime = deviceLastSeen.get(deviceId);
        boolean isOnline = lastSeenTime != null && 
                          (System.currentTimeMillis() - lastSeenTime < 30000); // 30 seconds threshold
        
        status.put("deviceId", deviceId);
        status.put("online", isOnline);
        status.put("lastSeen", lastSeenTime);
        status.put("pendingCommands", 
                   deviceCommandQueues.containsKey(deviceId) ? 
                   deviceCommandQueues.get(deviceId).size() : 0);
        
        return ResponseEntity.ok(status);
    }
    
    // Get all known devices and their status
    @GetMapping("/devices")
    public ResponseEntity<List<Map<String, Object>>> getAllDevices() {
        List<Map<String, Object>> devices = new ArrayList<>();
        
        // Combine the set of all device IDs from both maps
        Set<String> allDeviceIds = new HashSet<>();
        allDeviceIds.addAll(deviceLastSeen.keySet());
        allDeviceIds.addAll(deviceCommandQueues.keySet());
        
        for (String deviceId : allDeviceIds) {
            Map<String, Object> device = new HashMap<>();
            
            Long lastSeenTime = deviceLastSeen.get(deviceId);
            boolean isOnline = lastSeenTime != null && 
                              (System.currentTimeMillis() - lastSeenTime < 30000);
            
            device.put("deviceId", deviceId);
            device.put("online", isOnline);
            device.put("lastSeen", lastSeenTime);
            device.put("pendingCommands", 
                       deviceCommandQueues.containsKey(deviceId) ? 
                       deviceCommandQueues.get(deviceId).size() : 0);
            
            devices.add(device);
        }
        
        return ResponseEntity.ok(devices);
    }
    
    // Inner class for IRCommand
    public static class IRCommand {
        private long id;
        private String type; // "raw", "nec", "samsung", etc.
        private String code; // hex code or raw timing array as JSON string
        private String description; // human-readable description
        
        // Default constructor for Jackson
        public IRCommand() {}
        
        public IRCommand(String type, String code, String description) {
            this.type = type;
            this.code = code;
            this.description = description;
        }
        
        public long getId() {
            return id;
        }
        
        public void setId(long id) {
            this.id = id;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getCode() {
            return code;
        }
        
        public void setCode(String code) {
            this.code = code;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
    }
} 