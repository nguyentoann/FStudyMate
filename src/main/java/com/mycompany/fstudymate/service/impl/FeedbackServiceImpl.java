package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.dto.FeedbackRequest;
import com.mycompany.fstudymate.dto.FeedbackResponse;
import com.mycompany.fstudymate.model.Feedback;
import com.mycompany.fstudymate.model.Feedback.FeedbackType;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.FeedbackRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.service.FeedbackService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("feedbackServiceV2")
public class FeedbackServiceImpl implements FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackServiceImpl.class);
    
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Autowired
    public FeedbackServiceImpl(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public FeedbackResponse createFeedback(FeedbackRequest feedbackRequest, Integer userId) {
        logger.info("Creating feedback of type {} for targetId {} by user {}", 
                feedbackRequest.getType(), feedbackRequest.getTargetId(), userId != null ? userId : "anonymous");
        
        // Validate userId if provided
        Integer validatedUserId = null;
        if (userId != null) {
            logger.info("Validating userId: {}", userId);
            
            // Check if user exists
            boolean userExists = userRepository.existsById(userId);
            if (userExists) {
                logger.info("User with ID {} exists, proceeding with feedback creation", userId);
                validatedUserId = userId;
            } else {
                logger.warn("User with ID {} does not exist, treating as anonymous", userId);
            }
        } else {
            logger.info("No userId provided, creating anonymous feedback");
        }
        
        // Tạo feedback mới
        Feedback feedback = new Feedback();
        feedback.setContent(feedbackRequest.getContent());
        feedback.setRating(feedbackRequest.getRating());
        feedback.setType(feedbackRequest.getType());
        feedback.setTargetId(feedbackRequest.getTargetId());
        
        // Set lesson ID if provided
        if (feedbackRequest.getLessonId() != null) {
            logger.info("Setting lessonId: {} for feedback", feedbackRequest.getLessonId());
            feedback.setLessonId(feedbackRequest.getLessonId());
        }
        
        // Kiểm tra người dùng có tồn tại nếu validatedUserId không null
        if (validatedUserId != null) {
            final Integer finalUserId = validatedUserId; // Create a final copy for lambda expressions
            logger.info("Looking up user with ID: {}", finalUserId);
            User user = userRepository.findById(finalUserId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + finalUserId));
            logger.info("Found user: {} with role: {}", user.getFullName(), user.getRole());
            
            // Chỉ set createdBy, không set user trực tiếp vì @JoinColumn có insertable=false, updatable=false
            feedback.setCreatedBy(finalUserId);
            logger.info("Setting createdBy to userId: {} for feedback", finalUserId);
        } else {
            logger.info("Creating anonymous feedback (userId is null)");
            feedback.setCreatedBy(null);
        }
        
        // Kiểm tra rating hợp lệ
        if (feedbackRequest.getRating() < 1 || feedbackRequest.getRating() > 5) {
            logger.warn("Invalid rating value: {}", feedbackRequest.getRating());
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        // Lưu và trả về kết quả
        logger.info("Saving feedback to database");
        Feedback savedFeedback = feedbackRepository.save(feedback);
        logger.info("Feedback saved with ID: {}", savedFeedback.getId());
        
        // Tạo response
        FeedbackResponse response = new FeedbackResponse(savedFeedback);
        logger.info("Created feedback response with userFullName: {}, userRole: {}", 
                response.getUserFullName(), response.getUserRole());
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacksByTypeAndTargetId(FeedbackType type, String targetId) {
        logger.info("Getting feedbacks of type {} for targetId {}", type, targetId);
        
        // Sử dụng phương thức mới với eager loading
        return feedbackRepository.findByTypeAndTargetIdWithUser(type, targetId)
                .stream()
                .map(FeedbackResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacksByUser(Integer userId) {
        logger.info("Getting feedbacks created by user {}", userId);
        
        return feedbackRepository.findByCreatedByOrderByCreatedAtDesc(userId)
                .stream()
                .map(FeedbackResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacksByType(FeedbackType type) {
        logger.info("Getting all feedbacks of type {}", type);
        
        // Sử dụng phương thức mới với eager loading
        return feedbackRepository.findByTypeWithUser(type)
                .stream()
                .map(FeedbackResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacksByLessonId(Integer lessonId) {
        logger.info("Getting feedbacks for lesson ID: {}", lessonId);
        
        // Sử dụng phương thức mới với eager loading
        return feedbackRepository.findByLessonIdWithUser(lessonId)
                .stream()
                .map(FeedbackResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public FeedbackResponse getFeedbackById(Long id) {
        logger.info("Getting feedback with ID: {}", id);
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Feedback not found with ID: {}", id);
                    return new IllegalArgumentException("Feedback không tồn tại");
                });
        
        return new FeedbackResponse(feedback);
    }
    
    @Override
    @Transactional
    public FeedbackResponse updateFeedback(Long id, FeedbackRequest feedbackRequest, Integer userId) {
        logger.info("Updating feedback with ID: {} by user: {}", id, userId);
        
        // Kiểm tra feedback tồn tại không
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Feedback not found with ID: {}", id);
                    return new IllegalArgumentException("Feedback không tồn tại");
                });
        
        // Check if user is the owner of the feedback
        if (feedback.getCreatedBy() == null || !feedback.getCreatedBy().equals(userId)) {
            logger.error("User {} is not authorized to update feedback {}", userId, id);
            throw new IllegalArgumentException("Bạn không có quyền cập nhật phản hồi này");
        }
        
        // Cập nhật thông tin
        feedback.setContent(feedbackRequest.getContent());
        
        // Kiểm tra rating hợp lệ
        if (feedbackRequest.getRating() < 1 || feedbackRequest.getRating() > 5) {
            logger.warn("Invalid rating value: {}", feedbackRequest.getRating());
            throw new IllegalArgumentException("Rating phải từ 1 đến 5");
        }
        feedback.setRating(feedbackRequest.getRating());
        
        // Lưu và trả về kết quả
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        logger.info("Feedback updated successfully: {}", updatedFeedback.getId());
        
        return new FeedbackResponse(updatedFeedback);
    }
    
    @Override
    @Transactional
    public boolean deleteFeedback(Long id, Integer userId) {
        logger.info("Attempting to delete feedback with ID: {} by user: {}", id, userId);
        
        // Kiểm tra feedback tồn tại không
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
        if (!feedbackOpt.isPresent()) {
            logger.error("Feedback not found with ID: {}", id);
            return false;
        }
        
        Feedback feedback = feedbackOpt.get();
        
        // Kiểm tra quyền xóa (người tạo hoặc admin)
        if (userId == null) {
            logger.error("Anonymous user cannot delete feedback");
            return false;
        }
        
        // Kiểm tra người dùng có tồn tại không
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            logger.error("User not found with ID: {}", userId);
            return false;
        }
        
        User user = userOpt.get();
        boolean isAdmin = "admin".equalsIgnoreCase(user.getRole());
        boolean isOwner = feedback.getCreatedBy() != null && feedback.getCreatedBy().equals(userId);
        
        if (!isAdmin && !isOwner) {
            logger.error("User {} is not authorized to delete feedback {}", userId, id);
            return false;
        }
        
        // Thực hiện xóa
        feedbackRepository.deleteById(id);
        logger.info("Feedback {} deleted successfully by user {}", id, userId);
        
        return true;
    }
} 