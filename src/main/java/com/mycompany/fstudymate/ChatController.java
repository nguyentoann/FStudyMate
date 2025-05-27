package com.mycompany.fstudymate;

import dao.ChatDAO;
import service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.logging.Logger;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
@RequestMapping("/api/chat")
public class ChatController {
    private static final Logger logger = Logger.getLogger(ChatController.class.getName());

    @Autowired
    private ChatDAO chatDAO;
    
    @Autowired
    private OpenAIService openAIService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> payload) {
        try {
            int senderId = Integer.parseInt(payload.get("senderId").toString());
            int receiverId = Integer.parseInt(payload.get("receiverId").toString());
            String message = (String) payload.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Message cannot be empty"
                ));
            }
            
            boolean success = chatDAO.sendMessage(senderId, receiverId, message);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message sent successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to send message"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error sending message: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/messages/{user1Id}/{user2Id}")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable int user1Id, 
            @PathVariable int user2Id,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        try {
            List<Map<String, Object>> messages = chatDAO.getMessagesBetweenUsers(user1Id, user2Id, limit, offset);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@PathVariable int userId) {
        try {
            List<Map<String, Object>> conversations = chatDAO.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable int userId) {
        try {
            int count = chatDAO.getUnreadMessageCount(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("unreadCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable int messageId,
            @RequestParam int userId) {
        try {
            boolean success = chatDAO.deleteMessage(messageId, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message deleted successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to delete message or message does not belong to user"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error deleting message: " + e.getMessage()
            ));
        }
    }
    
    // AI Chat endpoints
    
    @PostMapping("/ai/send")
    public ResponseEntity<Map<String, Object>> sendMessageToAI(@RequestBody Map<String, Object> payload) {
        try {
            logger.info("Received AI chat request with payload keys: " + payload.keySet());
            
            int userId = Integer.parseInt(payload.get("userId").toString());
            String message = (String) payload.get("message");
            
            // Log if image is present in the request
            boolean hasImage = payload.containsKey("image");
            logger.info("Request contains image: " + hasImage);
            if (hasImage) {
                Object imageData = payload.get("image");
                logger.info("Image data type: " + (imageData != null ? imageData.getClass().getName() : "null"));
                logger.info("Image data length: " + (imageData instanceof String ? ((String)imageData).length() : "N/A"));
            }
            
            // Extract user information if available
            Map<String, Object> userInfo = new HashMap<>();
            if (payload.containsKey("userInfo") && payload.get("userInfo") instanceof Map) {
                userInfo = (Map<String, Object>) payload.get("userInfo");
                logger.info("User info extracted from payload: " + userInfo);
            } else {
                // Add basic user ID if no detailed information is provided
                userInfo.put("id", userId);
                logger.warning("No user info in payload, using default with ID: " + userId);
            }
            
            if (message == null || message.trim().isEmpty()) {
                logger.warning("Empty message received in AI chat request");
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Message cannot be empty"
                ));
            }
            
            // Add image to userInfo if present
            if (hasImage) {
                userInfo.put("image", payload.get("image"));
            }
            
            // Store user message
            boolean messageSaved = chatDAO.sendMessageToAI(userId, message);
            
            if (!messageSaved) {
                logger.warning("Failed to save user message for user ID: " + userId);
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", 
                    "message", "Failed to save user message"
                ));
            }
            
            // Get conversation history for context (last 10 messages)
            List<Map<String, String>> conversationHistory = chatDAO.getOpenAIConversationHistory(userId, 10);
            logger.info("Retrieved " + conversationHistory.size() + " previous messages for context");
            
            // Ensure user info has a name value
            if (!userInfo.containsKey("name") || userInfo.get("name") == null || userInfo.get("name").toString().isEmpty()) {
                userInfo.put("name", "Student");
                logger.info("Added default name 'Student' to user info");
            }
            
            // Generate AI response with user information
            String aiResponse = openAIService.generateAIResponse(message, conversationHistory, userInfo);
            logger.info("Generated AI response: " + (aiResponse.length() > 50 ? aiResponse.substring(0, 50) + "..." : aiResponse));
            
            // Store AI response
            boolean responseSaved = chatDAO.storeAIResponse(userId, aiResponse);
            
            if (!responseSaved) {
                logger.warning("Failed to save AI response for user ID: " + userId);
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to save AI response"
                ));
            }
            
            logger.info("Successfully processed AI chat request for user ID: " + userId);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Message processed successfully",
                "response", aiResponse
            ));
            
        } catch (Exception e) {
            logger.severe("Error processing AI message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error processing AI message: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/ai/messages/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getAIChatHistory(
            @PathVariable int userId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        try {
            List<Map<String, Object>> messages = chatDAO.getAIChatHistory(userId, limit, offset);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Group Chat endpoints
    
    @GetMapping("/groups/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserGroups(
            @PathVariable int userId,
            @RequestParam(required = false) String role) {
        try {
            if (role == null || role.isEmpty()) {
                // Get user role from database if not provided
                // For now, defaulting to "student" if not specified
                role = "student";
            }
            
            List<Map<String, Object>> groups = chatDAO.getUserGroups(userId, role);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            logger.severe("Error getting user groups: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/groups/messages/{groupId}")
    public ResponseEntity<List<Map<String, Object>>> getGroupMessages(
            @PathVariable int groupId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        try {
            List<Map<String, Object>> messages = chatDAO.getGroupMessages(groupId, limit, offset);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.severe("Error getting group messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/groups/send")
    public ResponseEntity<Map<String, Object>> sendGroupMessage(@RequestBody Map<String, Object> payload) {
        try {
            int groupId = Integer.parseInt(payload.get("groupId").toString());
            int senderId = Integer.parseInt(payload.get("senderId").toString());
            String message = (String) payload.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Message cannot be empty"
                ));
            }
            
            boolean success = chatDAO.sendGroupMessage(groupId, senderId, message);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message sent successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to send message"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error sending group message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error sending message: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/groups/createOrGet/{classId}")
    public ResponseEntity<Map<String, Object>> createOrGetClassGroup(@PathVariable String classId) {
        try {
            int groupId = chatDAO.createOrGetClassGroup(classId);
            
            if (groupId > 0) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "groupId", groupId
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to create or get class group"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error creating/getting class group: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error processing request: " + e.getMessage()
            ));
        }
    }
} 