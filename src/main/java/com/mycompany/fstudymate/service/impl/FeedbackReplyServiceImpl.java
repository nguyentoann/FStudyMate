package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.dto.FeedbackReplyRequest;
import com.mycompany.fstudymate.dto.FeedbackReplyResponse;
import com.mycompany.fstudymate.model.Feedback;
import com.mycompany.fstudymate.model.FeedbackReply;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.FeedbackReplyRepository;
import com.mycompany.fstudymate.repository.FeedbackRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.service.FeedbackReplyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FeedbackReplyServiceImpl implements FeedbackReplyService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackReplyServiceImpl.class);
    
    private final FeedbackReplyRepository replyRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public FeedbackReplyServiceImpl(
            FeedbackReplyRepository replyRepository,
            FeedbackRepository feedbackRepository,
            UserRepository userRepository) {
        this.replyRepository = replyRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    @Transactional
    public FeedbackReplyResponse createReply(FeedbackReplyRequest replyRequest, Integer userId) {
        logger.info("Creating reply for feedback ID: {} by user ID: {}", 
                replyRequest.getFeedbackId(), userId != null ? userId : "anonymous");
        
        // Kiểm tra feedback có tồn tại không
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(replyRequest.getFeedbackId());
        if (!feedbackOpt.isPresent()) {
            logger.error("Feedback with ID {} not found", replyRequest.getFeedbackId());
            throw new IllegalArgumentException("Feedback không tồn tại");
        }
        
        // Kiểm tra userId nếu có
        Integer validatedUserId = validateUserId(userId);
        
        // Tạo reply mới
        FeedbackReply reply = new FeedbackReply();
        reply.setFeedbackId(replyRequest.getFeedbackId());
        reply.setContent(replyRequest.getContent());
        reply.setCreatedBy(validatedUserId);
        
        // Set parent reply if provided
        if (replyRequest.getParentReplyId() != null) {
            Optional<FeedbackReply> parentReplyOpt = replyRepository.findById(replyRequest.getParentReplyId());
            if (!parentReplyOpt.isPresent()) {
                logger.error("Parent reply with ID {} not found", replyRequest.getParentReplyId());
                throw new IllegalArgumentException("Phản hồi gốc không tồn tại");
            }
            reply.setParentReplyId(replyRequest.getParentReplyId());
        }
        
        // Lưu và trả về kết quả
        FeedbackReply savedReply = replyRepository.save(reply);
        logger.info("Reply saved with ID: {}", savedReply.getId());
        
        return new FeedbackReplyResponse(savedReply);
    }
    
    @Override
    @Transactional
    public FeedbackReplyResponse createNestedReply(Long parentReplyId, FeedbackReplyRequest replyRequest, Integer userId) {
        logger.info("Creating nested reply for parent reply ID: {} by user ID: {}", 
                parentReplyId, userId != null ? userId : "anonymous");
        
        // Kiểm tra parent reply có tồn tại không
        Optional<FeedbackReply> parentReplyOpt = replyRepository.findById(parentReplyId);
        if (!parentReplyOpt.isPresent()) {
            logger.error("Parent reply with ID {} not found", parentReplyId);
            throw new IllegalArgumentException("Phản hồi gốc không tồn tại");
        }
        
        FeedbackReply parentReply = parentReplyOpt.get();
        
        // Đảm bảo feedbackId khớp với parent reply
        replyRequest.setFeedbackId(parentReply.getFeedbackId());
        replyRequest.setParentReplyId(parentReplyId);
        
        return createReply(replyRequest, userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackReplyResponse> getRepliesByFeedbackId(Long feedbackId) {
        logger.info("Getting hierarchical replies for feedback ID: {}", feedbackId);
        
        // Get top-level replies with their child replies
        return replyRepository.findByFeedbackIdWithUserAndChildReplies(feedbackId).stream()
                .map(FeedbackReplyResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackReplyResponse> getNestedReplies(Long parentReplyId) {
        logger.info("Getting nested replies for parent reply ID: {}", parentReplyId);
        
        return replyRepository.findByParentReplyIdOrderByCreatedAtAsc(parentReplyId).stream()
                .map(FeedbackReplyResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackReplyResponse> getRepliesByUser(Integer userId) {
        logger.info("Getting replies created by user ID: {}", userId);
        
        return replyRepository.findByCreatedByOrderByCreatedAtDesc(userId).stream()
                .map(FeedbackReplyResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public boolean deleteReply(Long replyId, Integer userId) {
        logger.info("Attempting to delete reply ID: {} by user ID: {}", replyId, userId);
        
        Optional<FeedbackReply> replyOpt = replyRepository.findById(replyId);
        if (!replyOpt.isPresent()) {
            logger.warn("Reply with ID {} not found", replyId);
            return false;
        }
        
        FeedbackReply reply = replyOpt.get();
        
        // Temporarily bypass permission checks - allow any authenticated user to delete any reply
        if (userId == null) {
            logger.warn("Anonymous user cannot delete replies");
            return false;
        }
        
        // Thực hiện xóa
        replyRepository.deleteById(replyId);
        logger.info("Reply {} deleted successfully by user {}", replyId, userId);
        
        return true;
    }

    @Override
    @Transactional
    public FeedbackReplyResponse updateReply(Long replyId, FeedbackReplyRequest replyRequest, Integer userId) {
        logger.info("Updating reply with ID: {} by user ID: {}", replyId, userId);
        
        // Check if reply exists
        Optional<FeedbackReply> replyOpt = replyRepository.findById(replyId);
        if (!replyOpt.isPresent()) {
            logger.error("Reply with ID {} not found", replyId);
            throw new IllegalArgumentException("Phản hồi không tồn tại");
        }
        
        FeedbackReply reply = replyOpt.get();
        
        // Temporarily bypass permission check - allow any authenticated user to update any reply
        // Check if user is the owner of the reply
        /*if (!userId.equals(reply.getCreatedBy())) {
            logger.error("User {} is not authorized to update reply {}", userId, replyId);
            throw new IllegalArgumentException("Bạn không có quyền cập nhật phản hồi này");
        }*/
        
        // Update reply content
        if (replyRequest.getContent() != null && !replyRequest.getContent().trim().isEmpty()) {
            reply.setContent(replyRequest.getContent().trim());
        } else {
            logger.error("Cannot update reply with empty content");
            throw new IllegalArgumentException("Nội dung phản hồi không được để trống");
        }
        
        // Save and return updated reply
        FeedbackReply updatedReply = replyRepository.save(reply);
        logger.info("Reply {} updated successfully", replyId);
        
        return new FeedbackReplyResponse(updatedReply);
    }
    
    // Helper method to validate user ID
    private Integer validateUserId(Integer userId) {
        if (userId != null) {
            boolean userExists = userRepository.existsById(userId);
            if (userExists) {
                logger.info("User with ID {} exists, proceeding with reply creation", userId);
                return userId;
            } else {
                logger.warn("User with ID {} does not exist, treating as anonymous", userId);
            }
        }
        return null;
    }
} 