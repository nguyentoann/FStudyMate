package com.mycompany.fstudymate.api;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/video-call")
@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3000"}, allowCredentials = "true")
public class VideoCallController {
    private static final Logger logger = Logger.getLogger(VideoCallController.class.getName());
    
    // In-memory store for call signaling data
    // In a production environment, use a message broker or WebSockets
    private final Map<String, Map<String, Object>> signalStore = new ConcurrentHashMap<>();
    
    // Store for pending calls
    private final Map<String, Map<String, Object>> pendingCalls = new ConcurrentHashMap<>();
    
    // Store for active users and their last polling time (for better localhost detection)
    private final Map<String, Long> activeUsers = new ConcurrentHashMap<>();
    
    @PostMapping("/signal")
    public ResponseEntity<Map<String, Object>> signal(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Log auth info (without exposing the actual token)
        if (authHeader != null && !authHeader.isEmpty()) {
            logger.info("[CALL-FLOW] Signal API called with auth token");
        } else {
            logger.info("[CALL-FLOW] Signal API called without auth token");
        }
        
        // Convert potential Integer IDs to String
        String senderId = String.valueOf(payload.get("senderId"));
        String senderName = (String) payload.get("senderName");
        String receiverId = String.valueOf(payload.get("receiverId"));
        Object signal = payload.get("signal");
        String type = (String) payload.get("type");
        
        logger.info(String.format("[CALL-FLOW] Received %s signal from user %s (%s) to user %s", 
            type, senderId, senderName, receiverId));
        
        // Enhanced logging for signal details
        if (signal instanceof Map) {
            Map<String, Object> signalMap = (Map<String, Object>) signal;
            if (signalMap.containsKey("type")) {
                logger.info("[CALL-FLOW] Signal type: " + signalMap.get("type"));
                
                // Log SDP offer/answer type for debugging
                if ("offer".equals(signalMap.get("type")) || "answer".equals(signalMap.get("type"))) {
                    logger.info("[CALL-FLOW] SDP exchange: " + signalMap.get("type"));
                }
            } else if (signalMap.containsKey("candidate")) {
                logger.info("[CALL-FLOW] ICE candidate signal received");
                
                // Extract candidate type (host/srflx/relay) for debugging
                if (signalMap.get("candidate") instanceof Map) {
                    Map<String, Object> candidate = (Map<String, Object>) signalMap.get("candidate");
                    if (candidate.containsKey("candidate")) {
                        String candidateStr = String.valueOf(candidate.get("candidate"));
                        if (candidateStr.contains("host")) {
                            logger.info("[CALL-FLOW] HOST candidate");
                        } else if (candidateStr.contains("srflx")) {
                            logger.info("[CALL-FLOW] SERVER-REFLEXIVE candidate");
                        } else if (candidateStr.contains("relay")) {
                            logger.info("[CALL-FLOW] RELAY candidate");
                        }
                    }
                }
            }
        }
        
        // Mark sender as active
        activeUsers.put(senderId, System.currentTimeMillis());
        
        // Store signal data keyed by receiver ID
        if (!signalStore.containsKey(receiverId)) {
            signalStore.put(receiverId, new HashMap<>());
            logger.info("[CALL-FLOW] Created new signal store for receiver: " + receiverId);
        }
        
        Map<String, Object> userSignals = signalStore.get(receiverId);
        Map<String, Object> signalData = new HashMap<>();
        signalData.put("signal", signal);
        signalData.put("type", type);
        signalData.put("senderName", senderName);
        signalData.put("timestamp", System.currentTimeMillis());
        
        userSignals.put(senderId, signalData);
        logger.info("[CALL-FLOW] Stored signal from " + senderId + " for " + receiverId + " of type " + type);
        
        // If this is an offer, add to pending calls
        if ("offer".equals(type)) {
            if (!pendingCalls.containsKey(receiverId)) {
                pendingCalls.put(receiverId, new HashMap<>());
                logger.info("[CALL-FLOW] Created new pending calls store for receiver: " + receiverId);
            }
            
            Map<String, Object> callData = new HashMap<>();
            callData.put("callerId", senderId);
            callData.put("callerName", senderName);
            callData.put("signal", signal);
            callData.put("timestamp", System.currentTimeMillis());
            
            pendingCalls.get(receiverId).put(senderId, callData);
            
            logger.info(String.format("[CALL-FLOW] Stored pending call from %s to %s", senderId, receiverId));
            
            // Log the current state of pending calls for all users
            logPendingCallsState();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Signal data stored");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/get-signal")
    public ResponseEntity<Map<String, Object>> getSignal(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Log auth info (without exposing the actual token)
        if (authHeader != null && !authHeader.isEmpty()) {
            logger.info("[CALL-FLOW] Get-signal API called with auth token");
        } else {
            logger.info("[CALL-FLOW] Get-signal API called without auth token");
        }
        
        // Convert potential Integer IDs to String
        String userId = String.valueOf(payload.get("userId"));
        String fromUserId = String.valueOf(payload.get("fromUserId"));
        
        // Update active status for user
        activeUsers.put(userId, System.currentTimeMillis());
        
        logger.info(String.format("[CALL-FLOW] Checking for signals for user %s from user %s", userId, fromUserId));
        
        Map<String, Object> response = new HashMap<>();
        
        // Check if there is signal data for this user
        if (signalStore.containsKey(userId) && signalStore.get(userId).containsKey(fromUserId)) {
            Map<String, Object> signalData = (Map<String, Object>) signalStore.get(userId).get(fromUserId);
            
            response.put("success", true);
            response.put("signal", signalData.get("signal"));
            response.put("type", signalData.get("type"));
            response.put("senderName", signalData.get("senderName"));
            
            // For localhost testing, log the data being returned
            Object signalObj = signalData.get("signal");
            if (signalObj instanceof Map) {
                Map<String, Object> signalMap = (Map<String, Object>) signalObj;
                if (signalMap.containsKey("type")) {
                    logger.info(String.format("[CALL-FLOW] Returning %s signal to user %s", 
                        signalMap.get("type"), userId));
                } else if (signalMap.containsKey("candidate")) {
                    logger.info(String.format("[CALL-FLOW] Returning ICE candidate signal to user %s", userId));
                }
            }
            
            // Remove the signal data after it's retrieved (one-time use)
            signalStore.get(userId).remove(fromUserId);
            logger.info(String.format("[CALL-FLOW] Removed signal from %s for %s after retrieval", 
                fromUserId, userId));
            
            // If this was an offer retrieval, also remove from pending calls
            if ("offer".equals(signalData.get("type")) && 
                pendingCalls.containsKey(userId) && 
                pendingCalls.get(userId).containsKey(fromUserId)) {
                pendingCalls.get(userId).remove(fromUserId);
                logger.info(String.format("[CALL-FLOW] Removed pending call from %s to %s after retrieval", 
                    fromUserId, userId));
                
                // Log the updated pending calls state
                logPendingCallsState();
            }
            
            logger.info(String.format("[CALL-FLOW] Signal found and returned for user %s from user %s", 
                userId, fromUserId));
        } else {
            response.put("success", false);
            response.put("message", "No signal data available");
            logger.fine(String.format("[CALL-FLOW] No signal found for user %s from user %s", 
                userId, fromUserId));
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/check-calls")
    public ResponseEntity<Map<String, Object>> checkCalls(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Log auth info (without exposing the actual token)
        if (authHeader != null && !authHeader.isEmpty()) {
            logger.info("[CALL-FLOW] Check-calls API called with auth token");
        } else {
            logger.info("[CALL-FLOW] Check-calls API called without auth token");
        }
        
        // Convert potential Integer IDs to String
        String userId = String.valueOf(payload.get("userId"));
        
        // Update active status for user
        activeUsers.put(userId, System.currentTimeMillis());
        
        logger.info(String.format("[CALL-FLOW] Checking for pending calls for user %s", userId));
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasIncomingCall", false);
        
        // Check if there are any pending calls for this user
        if (pendingCalls.containsKey(userId) && !pendingCalls.get(userId).isEmpty()) {
            // Get the most recent call
            String callerId = pendingCalls.get(userId).keySet().iterator().next();
            Map<String, Object> callData = (Map<String, Object>) pendingCalls.get(userId).get(callerId);
            
            // Check if the call is recent (within last 60 seconds)
            long callTime = (long) callData.get("timestamp");
            long currentTime = System.currentTimeMillis();
            long callAge = currentTime - callTime;
            
            // Only consider recent calls (60 seconds for testing)
            if (callAge <= 60000) {
                response.put("hasIncomingCall", true);
                response.put("callerId", callData.get("callerId"));
                response.put("callerName", callData.get("callerName"));
                response.put("signal", callData.get("signal"));
                response.put("timestamp", callTime);
                
                logger.info(String.format("[CALL-FLOW] Found pending call for user %s from user %s (age: %d ms)", 
                    userId, callerId, callAge));
            } else {
                // Clean up old calls
                pendingCalls.get(userId).remove(callerId);
                logger.info(String.format("[CALL-FLOW] Removed expired call from %s to %s (age: %d ms)", 
                    callerId, userId, callAge));
                
                // Log the updated pending calls state
                logPendingCallsState();
            }
        } else {
            logger.info(String.format("[CALL-FLOW] No pending calls found for user %s", userId));
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reject")
    public ResponseEntity<Map<String, Object>> rejectCall(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Convert potential Integer IDs to String
        String senderId = String.valueOf(payload.get("senderId"));
        String receiverId = String.valueOf(payload.get("receiverId"));
        
        logger.info(String.format("[CALL-FLOW] User %s rejected call from %s", senderId, receiverId));
        
        // Remove any pending calls or signals
        if (pendingCalls.containsKey(senderId)) {
            pendingCalls.get(senderId).remove(receiverId);
            logger.info(String.format("[CALL-FLOW] Removed pending call for user %s from user %s", 
                senderId, receiverId));
        }
        
        if (signalStore.containsKey(senderId)) {
            signalStore.get(senderId).remove(receiverId);
            logger.info(String.format("[CALL-FLOW] Removed signal for user %s from user %s", 
                senderId, receiverId));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Call rejected");
        
        return ResponseEntity.ok(response);
    }
    
    // Special endpoint to ensure calls are visible across localhost browsers
    @GetMapping("/active-users")
    public ResponseEntity<Map<String, Object>> getActiveUsers() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> users = new HashMap<>();
        
        long now = System.currentTimeMillis();
        for (Map.Entry<String, Long> entry : activeUsers.entrySet()) {
            String userId = entry.getKey();
            long lastActive = entry.getValue();
            long activeAge = now - lastActive;
            
            if (activeAge <= 60000) { // active in last minute
                users.put(userId, Map.of(
                    "lastActive", lastActive,
                    "age", activeAge
                ));
            } else {
                // Clean up old entries
                activeUsers.remove(userId);
            }
        }
        
        response.put("activeUsers", users);
        response.put("count", users.size());
        response.put("timestamp", now);
        
        return ResponseEntity.ok(response);
    }
    
    // Debug endpoint for localhost testing
    @GetMapping("/debug-status")
    public ResponseEntity<Map<String, Object>> debugStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        logger.info("[CALL-FLOW] Debug status requested");
        
        Map<String, Object> response = new HashMap<>();
        
        // Redact actual signal data but include counts and metadata
        Map<String, Object> debugData = new HashMap<>();
        
        int totalPendingCalls = 0;
        Map<String, Integer> pendingCallsPerUser = new HashMap<>();
        for (String userId : pendingCalls.keySet()) {
            int count = pendingCalls.get(userId).size();
            pendingCallsPerUser.put(userId, count);
            totalPendingCalls += count;
        }
        
        int totalSignals = 0;
        Map<String, Integer> signalsPerUser = new HashMap<>();
        for (String userId : signalStore.keySet()) {
            int count = signalStore.get(userId).size();
            signalsPerUser.put(userId, count);
            totalSignals += count;
        }
        
        debugData.put("totalPendingCalls", totalPendingCalls);
        debugData.put("pendingCallsPerUser", pendingCallsPerUser);
        debugData.put("totalSignals", totalSignals);
        debugData.put("signalsPerUser", signalsPerUser);
        debugData.put("timestamp", System.currentTimeMillis());
        
        response.put("debug", debugData);
        response.put("success", true);
        
        logger.info(String.format("[CALL-FLOW] Debug status: %d pending calls, %d signals", 
            totalPendingCalls, totalSignals));
        
        return ResponseEntity.ok(response);
    }
    
    // Helper method to log the current state of all pending calls
    private void logPendingCallsState() {
        StringBuilder sb = new StringBuilder("[CALL-FLOW] Current pending calls state: ");
        int totalCalls = 0;
        
        for (String userId : pendingCalls.keySet()) {
            int count = pendingCalls.get(userId).size();
            if (count > 0) {
                sb.append(userId).append("(").append(count).append(") ");
                totalCalls += count;
            }
        }
        
        if (totalCalls > 0) {
            logger.info(sb.toString());
        } else {
            logger.info("[CALL-FLOW] No pending calls in the system");
        }
    }
} 