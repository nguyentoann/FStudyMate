package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.FeedbackRequest;
import com.mycompany.fstudymate.dto.FeedbackResponse;
import com.mycompany.fstudymate.model.Feedback.FeedbackType;
import com.mycompany.fstudymate.service.FeedbackService;
import com.mycompany.fstudymate.util.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);
    
    private final FeedbackService feedbackService;
    private final JwtUtils jwtUtils;
    
    @Autowired
    public FeedbackController(
            @Qualifier("feedbackServiceV2") FeedbackService feedbackService,
            JwtUtils jwtUtils) {
        this.feedbackService = feedbackService;
        this.jwtUtils = jwtUtils;
    }
    
    /**
     * API để tạo feedback mới
     * 
     * @param feedbackRequest DTO chứa thông tin feedback
     * @return ResponseEntity chứa thông tin feedback đã được tạo
     */
    @PostMapping
    public ResponseEntity<?> createFeedback(@Valid @RequestBody FeedbackRequest feedbackRequest) {
        logger.info("Received request to create feedback of type: {}", feedbackRequest.getType());
        
        try {
            // Lấy thông tin user từ Security Context hoặc từ request
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            logger.info("Authentication object: {}", auth);
            
            Integer userId = feedbackRequest.getUserId(); // Lấy userId từ request nếu có
            
            // Log thông tin về userId từ request
            if (userId != null) {
                logger.info("Received userId from request: {}", userId);
            } else {
                logger.info("No userId provided in request");
                
                // Nếu không có userId từ request, thử lấy từ authentication
                if (auth != null && !"anonymousUser".equals(auth.getName())) {
                    logger.info("Authentication name: {}, authorities: {}", auth.getName(), auth.getAuthorities());
                    try {
                        userId = Integer.parseInt(auth.getName());
                        logger.info("Authenticated user {} creating feedback", userId);
                    } catch (NumberFormatException e) {
                        logger.warn("Could not parse user ID from authentication, treating as anonymous. Error: {}", e.getMessage());
                    }
                }
            }
            
            logger.info("Final userId for feedback: {}", userId != null ? userId : "anonymous");
            
            // Gọi service để tạo feedback với userId có thể là null
            logger.info("Calling feedbackService.createFeedback with userId: {}", userId);
            FeedbackResponse createdFeedback = feedbackService.createFeedback(feedbackRequest, userId);
            logger.info("Feedback created successfully with ID: {}", createdFeedback.getId());
            return new ResponseEntity<>(createdFeedback, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating feedback: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "Có lỗi xảy ra khi xử lý yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * API để lấy danh sách feedback theo loại và targetId
     * 
     * @param type Loại feedback
     * @param targetId ID của đối tượng được feedback
     * @param lessonId ID của bài học (chỉ sử dụng khi type là LESSON)
     * @return ResponseEntity chứa danh sách feedback
     */
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getFeedbacks(
            @RequestParam(required = false) FeedbackType type,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) Integer lessonId) {
        
        logger.info("Retrieving feedbacks with type: {}, targetId: {}, lessonId: {}", 
                type, targetId, lessonId);
        
        if (type == FeedbackType.LESSON && lessonId != null) {
            // Nếu là feedback về bài học và có lessonId, tìm theo lessonId
            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByLessonId(lessonId);
            return ResponseEntity.ok(feedbacks);
        } else if (type != null && targetId != null) {
            // Nếu có cả type và targetId, tìm theo cả hai
            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByTypeAndTargetId(type, targetId);
            return ResponseEntity.ok(feedbacks);
        } else if (type != null) {
            // Nếu chỉ có type, tìm theo type
            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByType(type);
            return ResponseEntity.ok(feedbacks);
        } else {
            // Nếu không có tham số nào, trả về lỗi
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * API để lấy danh sách feedback của chính người dùng hiện tại
     * 
     * @return ResponseEntity chứa danh sách feedback
     */
    @GetMapping("/mine")
    public ResponseEntity<?> getMyFeedbacks() {
        logger.info("Retrieving feedbacks for current user");
        
        // Lấy thông tin user từ Security Context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
       
        // Kiểm tra nếu người dùng chưa đăng nhập
        if (auth == null || "anonymousUser".equals(auth.getName())) {
            logger.warn("Unauthorized attempt to get my feedbacks - user not authenticated");
            Map<String, String> response = new HashMap<>();
            response.put("error", "Bạn cần đăng nhập để xem phản hồi của mình");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        try {
            // Chuyển đổi userId từ chuỗi sang số nguyên
            Integer userId = Integer.parseInt(auth.getName());
            
            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByUser(userId);
            return ResponseEntity.ok(feedbacks);
        } catch (NumberFormatException e) {
            logger.error("Error parsing user ID: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Không thể xác định người dùng. Vui lòng đăng nhập lại.");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }
    
    /**
     * API để lấy feedback theo ID
     * 
     * @param id ID của feedback
     * @return ResponseEntity chứa thông tin feedback
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long id) {
        logger.info("Retrieving feedback with ID: {}", id);
        
        try {
            FeedbackResponse feedback = feedbackService.getFeedbackById(id);
            return ResponseEntity.ok(feedback);
        } catch (IllegalArgumentException e) {
            logger.error("Error retrieving feedback: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error retrieving feedback: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Có lỗi xảy ra khi xử lý yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * API để cập nhật feedback
     * 
     * @param id ID của feedback cần cập nhật
     * @param feedbackRequest DTO chứa thông tin feedback mới
     * @param request HTTP request
     * @return ResponseEntity chứa thông tin feedback đã được cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeedback(
            @PathVariable Long id, 
            @Valid @RequestBody FeedbackRequest feedbackRequest,
            HttpServletRequest request) {
        
        logger.info("Received request to update feedback with ID: {}", id);
        
        // Extract user ID from token
        Integer userId = jwtUtils.extractUserIdFromRequest(request);
        
        if (userId == null) {
            logger.warn("Unauthorized attempt to update feedback - user not authenticated");
            Map<String, String> response = new HashMap<>();
            response.put("error", "Bạn cần đăng nhập để cập nhật phản hồi");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        try {
            FeedbackResponse updatedFeedback = feedbackService.updateFeedback(id, feedbackRequest, userId);
            return ResponseEntity.ok(updatedFeedback);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating feedback: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            logger.error("Error updating feedback: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Có lỗi xảy ra khi xử lý yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * API để xóa feedback
     * 
     * @param id ID của feedback cần xóa
     * @param request HTTP request
     * @return ResponseEntity chứa kết quả xóa
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id, HttpServletRequest request) {
        logger.info("Received request to delete feedback with ID: {}", id);
        
        // Extract user ID from token
        Integer userId = jwtUtils.extractUserIdFromRequest(request);
        
        if (userId == null) {
            logger.warn("Unauthorized attempt to delete feedback - user not authenticated");
            Map<String, String> response = new HashMap<>();
            response.put("error", "Bạn cần đăng nhập để xóa phản hồi");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        boolean deleted = feedbackService.deleteFeedback(id, userId);
        
        if (deleted) {
            logger.info("Feedback with ID: {} deleted successfully by user: {}", id, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Phản hồi đã được xóa thành công"));
        } else {
            logger.warn("Failed to delete feedback with ID: {} by user: {}", id, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Không thể xóa phản hồi. Bạn không có quyền hoặc phản hồi không tồn tại."));
        }
    }
} 