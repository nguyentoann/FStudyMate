package com.mycompany.fstudymate;

import dao.ChatDAO;
import dao.ChatFileDAO;
import dao.UserDAO;
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
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
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
                
                // Handle Unicode characters in filenames using RFC 5987 encoding
                String encodedFilename = encodeFilename(chatFile.getFileName());
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename);
                
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
     * Encode filename for Content-Disposition header according to RFC 5987.
     * This ensures Unicode characters are properly handled.
     */
    private String encodeFilename(String filename) {
        try {
            return java.net.URLEncoder.encode(filename, "UTF-8").replace("+", "%20");
        } catch (java.io.UnsupportedEncodingException e) {
            logger.warning("Failed to encode filename: " + e.getMessage());
            // Fall back to ASCII filename
            return filename.replaceAll("[^\\x00-\\x7F]", "_");
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
            // Get file details for logging
            ChatFile chatFile = chatFileDAO.getFileById(fileId);
            String filePath = chatFile != null ? chatFile.getFilePath() : "unknown";
            
            logger.info("Deleting file ID: " + fileId + ", Path: " + filePath + ", UserId: " + userId);
            
            // Use hardDeleteFile instead of softDeleteFile to delete the physical file
            boolean success = chatFileDAO.hardDeleteFile(fileId, userId);
            
            if (success) {
                logger.info("File deleted successfully - ID: " + fileId + ", Path: " + filePath);
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "File deleted successfully"
                ));
            } else {
                logger.warning("Failed to delete file - ID: " + fileId + ", Path: " + filePath);
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
            logger.info("Unsending message ID: " + messageId + " by user: " + userId);
            
            // First, get the files associated with this message so we can delete them physically
            List<Map<String, Object>> messageFiles = chatFileDAO.getMessageFiles(messageId, "direct");
            
            boolean success = chatDAO.unsendMessage(messageId, userId);
            
            if (success) {
                logger.info("Message unsent successfully. Now handling attached files.");
                
                // Process each file for physical deletion
                for (Map<String, Object> fileInfo : messageFiles) {
                    try {
                        int fileId = (int) fileInfo.get("id");
                        String filePath = (String) fileInfo.get("filePath");
                        
                        logger.info("Deleting file ID: " + fileId + ", Path: " + filePath);
                        
                        // Use hardDeleteFile to physically remove the file
                        boolean fileDeleted = chatFileDAO.hardDeleteFile(fileId, userId);
                        
                        logger.info("File " + fileId + " deletion result: " + fileDeleted);
                    } catch (Exception e) {
                        logger.warning("Error deleting file during unsend: " + e.getMessage());
                    }
                }
                
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
            logger.info("Unsending group message ID: " + messageId + " by user: " + userId);
            
            // First, get the files associated with this message so we can delete them physically
            List<Map<String, Object>> messageFiles = chatFileDAO.getMessageFiles(messageId, "group");
            
            boolean success = chatDAO.unsendGroupMessage(messageId, userId);
            
            if (success) {
                logger.info("Group message unsent successfully. Now handling attached files.");
                
                // Process each file for physical deletion
                for (Map<String, Object> fileInfo : messageFiles) {
                    try {
                        int fileId = (int) fileInfo.get("id");
                        String filePath = (String) fileInfo.get("filePath");
                        
                        logger.info("Deleting file ID: " + fileId + ", Path: " + filePath);
                        
                        // Use hardDeleteFile to physically remove the file
                        boolean fileDeleted = chatFileDAO.hardDeleteFile(fileId, userId);
                        
                        logger.info("File " + fileId + " deletion result: " + fileDeleted);
                    } catch (Exception e) {
                        logger.warning("Error deleting file during unsend: " + e.getMessage());
                    }
                }
                
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

    /**
     * Create a custom chat group
     */
    @PostMapping("/groups/create")
    public ResponseEntity<Map<String, Object>> createCustomChatGroup(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            int creatorId = Integer.parseInt(payload.get("creatorId").toString());
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Group name cannot be empty"
                ));
            }
            
            int groupId = chatDAO.createCustomChatGroup(name, creatorId);
            
            if (groupId > 0) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Group created successfully",
                    "groupId", groupId
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to create group"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error creating custom chat group: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error creating custom chat group: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Add a member to a chat group
     */
    @PostMapping("/groups/{groupId}/members/add")
    public ResponseEntity<Map<String, Object>> addGroupMember(
            @PathVariable int groupId,
            @RequestBody Map<String, Object> payload) {
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());
            int addedById = Integer.parseInt(payload.get("addedById").toString());
            
            boolean success = chatDAO.addGroupMember(groupId, userId, addedById);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Member added successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to add member or insufficient permissions"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error adding group member: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error adding group member: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Remove a member from a chat group
     */
    @DeleteMapping("/groups/{groupId}/members/{userId}")
    public ResponseEntity<Map<String, Object>> removeGroupMember(
            @PathVariable int groupId,
            @PathVariable int userId,
            @RequestParam int removedById) {
        try {
            boolean success = chatDAO.removeGroupMember(groupId, userId, removedById);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Member removed successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Failed to remove member or insufficient permissions"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error removing group member: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error removing group member: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get all members of a chat group
     */
    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<List<Map<String, Object>>> getGroupMembers(@PathVariable int groupId) {
        try {
            List<Map<String, Object>> members = chatDAO.getGroupMembers(groupId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            logger.severe("Error getting group members: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get all custom groups a user is a member of
     */
    @GetMapping("/groups/custom/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserCustomGroups(@PathVariable int userId) {
        try {
            List<Map<String, Object>> groups = chatDAO.getUserCustomGroups(userId);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            logger.severe("Error getting user custom groups: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get student count for a class group
     */
    @GetMapping("/class/{classId}/student-count")
    public ResponseEntity<Map<String, Object>> getClassStudentCount(@PathVariable String classId) {
        try {
            UserDAO userDAO = new UserDAO();
            int count = userDAO.countStudentsByClassId(classId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            logger.severe("Error getting class student count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Uploads or updates a group image
     */
    @PostMapping("/groups/{groupId}/image")
    public ResponseEntity<Map<String, Object>> uploadGroupImage(
            @PathVariable int groupId,
            @RequestParam("image") MultipartFile image,
            @RequestParam("userId") int userId) {
        
        try {
            logger.info("Uploading image for group: " + groupId + " by user: " + userId);
            
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "No file provided"
                ));
            }
            
            // Check if file is an image
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Only image files are allowed"
                ));
            }
            
            // Upload the image to Samba storage
            String filePath = FileStorageService.uploadGroupImage(
                image.getInputStream(), 
                image.getOriginalFilename(), 
                image.getContentType(), 
                groupId
            );
            
            // Update the group record with the image path
            boolean success = chatDAO.updateGroupImage(groupId, filePath, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Group image updated successfully",
                    "imagePath", filePath
                ));
            } else {
                return ResponseEntity.status(403).body(Map.of(
                    "status", "error",
                    "message", "You do not have permission to update this group's image"
                ));
            }
            
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Failed to upload image: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Removes a group image
     */
    @DeleteMapping("/groups/{groupId}/image")
    public ResponseEntity<Map<String, Object>> removeGroupImage(
            @PathVariable int groupId,
            @RequestParam int userId) {
        
        try {
            logger.info("Removing image for group: " + groupId + " by user: " + userId);
            
            boolean success = chatDAO.removeGroupImage(groupId, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Group image removed successfully"
                ));
            } else {
                return ResponseEntity.status(403).body(Map.of(
                    "status", "error",
                    "message", "You do not have permission to remove this group's image"
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Failed to remove image: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get a group image
     */
    @GetMapping("/groups/image/{groupId}")
    public ResponseEntity<?> getGroupImage(@PathVariable int groupId) {
        try {
            // Get the group details first to get the image path
            List<Map<String, Object>> groupMembers = chatDAO.getGroupMembers(groupId);
            
            if (groupMembers.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // The first result will have the group details
            String imagePath = (String) groupMembers.get(0).get("imagePath");
            
            if (imagePath == null || imagePath.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if the file exists in the Samba storage
            if (!FileStorageService.fileExists(imagePath)) {
                return ResponseEntity.notFound().build();
            }
            
            // Download the file from Samba and serve it
            File file = FileStorageService.downloadFile(imagePath);
            Path path = Paths.get(file.getAbsolutePath());
            Resource resource = new UrlResource(path.toUri());
            
            String contentType = determineContentType(imagePath);
            
            // Get filename from the path
            String filename = path.getFileName().toString();
            
            // Encode the filename for Content-Disposition header
            String encodedFilename = encodeFilename(filename);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error retrieving group image: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Determine content type based on file extension
     */
    private String determineContentType(String filePath) {
        String extension = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();
        
        switch (extension) {
            case "png": return "image/png";
            case "jpg":
            case "jpeg": return "image/jpeg";
            case "gif": return "image/gif";
            case "webp": return "image/webp";
            case "bmp": return "image/bmp";
            default: return "application/octet-stream";
        }
    }

    /**
     * Get all class groups (Admin only)
     */
    @GetMapping("/groups/class/all")
    public ResponseEntity<List<Map<String, Object>>> getAllClassGroups(@RequestHeader(name = "X-User-Role", required = false) String userRole) {
        try {
            // Only allow admins to access this endpoint
            if (!"admin".equalsIgnoreCase(userRole)) {
                return ResponseEntity.status(403).body(List.of(Map.of(
                    "status", "error",
                    "message", "Access denied. Admin privileges required."
                )));
            }
            
            List<Map<String, Object>> classGroups = chatDAO.getAllClassGroups();
            return ResponseEntity.ok(classGroups);
        } catch (Exception e) {
            logger.severe("Error getting all class groups: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 