package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.FeedbackReplyRequest;
import com.mycompany.fstudymate.dto.FeedbackReplyResponse;
import com.mycompany.fstudymate.service.FeedbackReplyService;
import com.mycompany.fstudymate.util.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback-replies")
@CrossOrigin(origins = "*")
public class FeedbackReplyController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackReplyController.class);
    
    private final FeedbackReplyService replyService;
    private final JwtUtils jwtUtils;
    
    @Autowired
    public FeedbackReplyController(FeedbackReplyService replyService, JwtUtils jwtUtils) {
        this.replyService = replyService;
        this.jwtUtils = jwtUtils;
    }
    
    @PostMapping
    public ResponseEntity<?> createReply(@Valid @RequestBody FeedbackReplyRequest replyRequest, HttpServletRequest request) {
        logger.info("Received request to create reply for feedback ID: {}", replyRequest.getFeedbackId());
        
        // Extract user ID from token if available
        Integer userId = jwtUtils.extractUserIdFromRequest(request);
        
        // If userId is provided in the request and user is authenticated, use it
        if (replyRequest.getUserId() != null && userId != null) {
            replyRequest.setUserId(userId);
        }
        
        try {
            FeedbackReplyResponse createdReply = replyService.createReply(replyRequest, replyRequest.getUserId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReply);
        } catch (Exception e) {
            logger.error("Error creating reply: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{parentReplyId}/replies")
    public ResponseEntity<?> createNestedReply(
            @PathVariable Long parentReplyId,
            @Valid @RequestBody FeedbackReplyRequest replyRequest,
            HttpServletRequest request) {
        
        logger.info("Received request to create nested reply for parent reply ID: {}", parentReplyId);
        
        // Extract user ID from token if available
        Integer userId = jwtUtils.extractUserIdFromRequest(request);
        
        // If userId is provided in the request and user is authenticated, use it
        if (replyRequest.getUserId() != null && userId != null) {
            replyRequest.setUserId(userId);
        }
        
        try {
            FeedbackReplyResponse createdReply = replyService.createNestedReply(parentReplyId, replyRequest, replyRequest.getUserId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReply);
        } catch (Exception e) {
            logger.error("Error creating nested reply: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<List<FeedbackReplyResponse>> getRepliesByFeedbackId(@PathVariable Long feedbackId) {
        logger.info("Fetching replies for feedback ID: {}", feedbackId);
        
        List<FeedbackReplyResponse> replies = replyService.getRepliesByFeedbackId(feedbackId);
        return ResponseEntity.ok(replies);
    }
    
    @GetMapping("/parent/{parentReplyId}")
    public ResponseEntity<List<FeedbackReplyResponse>> getNestedReplies(@PathVariable Long parentReplyId) {
        logger.info("Fetching nested replies for parent reply ID: {}", parentReplyId);
        
        List<FeedbackReplyResponse> replies = replyService.getNestedReplies(parentReplyId);
        return ResponseEntity.ok(replies);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackReplyResponse>> getRepliesByUser(@PathVariable Integer userId) {
        logger.info("Fetching replies for user ID: {}", userId);
        
        List<FeedbackReplyResponse> replies = replyService.getRepliesByUser(userId);
        return ResponseEntity.ok(replies);
    }
    
    @PutMapping("/{replyId}")
    public ResponseEntity<?> updateReply(
            @PathVariable Long replyId,
            @Valid @RequestBody FeedbackReplyRequest replyRequest,
            HttpServletRequest request) {
        
        logger.info("Received request to update reply ID: {}", replyId);
        
        // Extract user ID from token
        Integer userId = jwtUtils.extractUserIdFromRequest(request);
        
        // Temporarily bypass authentication for testing
        if (userId == null) {
            logger.warn("No authentication found, using default user ID for testing");
            userId = 1; // Use a default user ID (e.g., admin)
        }
        
        try {
            // For update operations, we don't require the feedbackId field
            // It will be retrieved from the existing reply in the service layer
            FeedbackReplyResponse updatedReply = replyService.updateReply(replyId, replyRequest, userId);
            return ResponseEntity.ok(updatedReply);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating reply: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating reply: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Có lỗi xảy ra khi cập nhật phản hồi"));
        }
    }
    
    @DeleteMapping("/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable Long replyId, HttpServletRequest request) {
        logger.info("Received request to delete reply ID: {}", replyId);
        
        // Extract user ID from token
        Integer userId = jwtUtils.extractUserIdFromRequest(request);
        
        // Temporarily allow deletion without authentication
        // If no user ID from token, use a default value for testing
        if (userId == null) {
            logger.warn("No authentication found, using default user ID for testing");
            userId = 1; // Use a default user ID (e.g., admin)
        }
        
        boolean deleted = replyService.deleteReply(replyId, userId);
        
        if (deleted) {
            logger.info("Reply ID: {} deleted successfully by user ID: {}", replyId, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Phản hồi đã được xóa thành công"));
        } else {
            logger.warn("Failed to delete reply ID: {} by user ID: {}", replyId, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Không thể xóa phản hồi này"));
        }
    }
} 