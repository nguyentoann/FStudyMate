package com.mycompany.fstudymate;

import dao.ChatDAO;
import dao.ChatFileDAO;
import model.ChatFile;
import service.OpenAIService;
import util.FileStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    private ChatFileDAO chatFileDAO;
    
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
            
            int messageId = chatDAO.sendMessage(senderId, receiverId, message);
            
            if (messageId > 0) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message sent successfully",
                    "messageId", messageId
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
            
            int messageId = chatDAO.sendGroupMessage(groupId, senderId, message);
            
            if (messageId > 0) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message sent successfully",
                    "messageId", messageId
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

    /**
     * Upload a file for chat
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") int userId,
            @RequestParam("messageId") int messageId,
            @RequestParam("messageType") String messageType) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "File is empty"
                ));
            }
            
            // Upload file to SMB server
            boolean isGroupChat = "group".equals(messageType);
            String filePath = FileStorageService.uploadChatFile(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType(),
                userId,
                isGroupChat
            );
            
            // Save file info to database
            ChatFile chatFile = new ChatFile(
                file.getOriginalFilename(),
                filePath,
                file.getSize(),
                file.getContentType(),
                userId
            );
            
            int fileId = chatFileDAO.saveFile(chatFile);
            
            if (fileId > 0) {
                // Link file to message
                boolean linked = chatFileDAO.linkFileToMessage(messageId, fileId, messageType);
                
                if (linked) {
                    Map<String, Object> fileInfo = new HashMap<>();
                    fileInfo.put("id", fileId);
                    fileInfo.put("fileName", file.getOriginalFilename());
                    fileInfo.put("fileSize", file.getSize());
                    fileInfo.put("fileType", file.getContentType());
                    fileInfo.put("isViewable", chatFile.isViewable());
                    fileInfo.put("category", chatFile.getFileCategory());
                    
                    return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "File uploaded successfully",
                        "file", fileInfo
                    ));
                }
            }
            
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Failed to save file information"
            ));
            
        } catch (IOException e) {
            logger.severe("Error uploading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error uploading file: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get files attached to a message
     */
    @GetMapping("/files/{messageId}")
    public ResponseEntity<List<Map<String, Object>>> getMessageFiles(
            @PathVariable int messageId,
            @RequestParam String messageType) {
        
        try {
            List<Map<String, Object>> files = chatFileDAO.getMessageFiles(messageId, messageType);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            logger.severe("Error getting message files: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Download a file
     */
    @GetMapping("/files/download/{fileId}")
    public ResponseEntity<?> downloadFile(@PathVariable int fileId) {
        try {
            ChatFile chatFile = chatFileDAO.getFileById(fileId);
            
            if (chatFile == null) {
                return ResponseEntity.notFound().build();
            }
            
            File file = FileStorageService.downloadFile(chatFile.getFilePath());
            Path path = Paths.get(file.getAbsolutePath());
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + chatFile.getFileName() + "\"");
                
                return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(file.length())
                    .contentType(MediaType.parseMediaType(chatFile.getFileType()))
                    .body(resource);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "File could not be read"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error downloading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error downloading file: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Delete a file
     */
    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<Map<String, Object>> deleteFile(
            @PathVariable int fileId,
            @RequestParam int userId) {
        
        try {
            boolean success = chatFileDAO.softDeleteFile(fileId, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "File deleted successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to delete file or file does not belong to user"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error deleting file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error deleting file: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Unsend a direct message
     */
    @PostMapping("/unsend/{messageId}")
    public ResponseEntity<Map<String, Object>> unsendMessage(
            @PathVariable int messageId,
            @RequestParam int userId) {
        
        try {
            boolean success = chatDAO.unsendMessage(messageId, userId);
            
            if (success) {
                // Mark any attached files as deleted
                chatFileDAO.markFilesDeletedByMessage(messageId, "direct");
                
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message unsent successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to unsend message or message does not belong to user"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error unsending message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error unsending message: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Unsend a group message
     */
    @PostMapping("/groups/unsend/{messageId}")
    public ResponseEntity<Map<String, Object>> unsendGroupMessage(
            @PathVariable int messageId,
            @RequestParam int userId) {
        
        try {
            boolean success = chatDAO.unsendGroupMessage(messageId, userId);
            
            if (success) {
                // Mark any attached files as deleted
                chatFileDAO.markFilesDeletedByMessage(messageId, "group");
                
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message unsent successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to unsend message or message does not belong to user"
                ));
            }
        } catch (Exception e) {
            logger.severe("Error unsending group message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error unsending message: " + e.getMessage()
            ));
        }
    }
} 