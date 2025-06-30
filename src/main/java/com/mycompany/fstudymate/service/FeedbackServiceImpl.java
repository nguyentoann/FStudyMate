package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Feedback;
import com.mycompany.fstudymate.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private static final Logger logger = Logger.getLogger(FeedbackServiceImpl.class.getName());
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Override
    public Feedback createFeedback(Feedback feedback) {
        logger.info("Creating new feedback: " + feedback.getSubject());
        return feedbackRepository.save(feedback);
    }
    
    @Override
    public Optional<Feedback> getFeedbackById(Integer id) {
        logger.info("Fetching feedback with ID: " + id);
        return feedbackRepository.findById(id);
    }
    
    @Override
    public List<Feedback> getAllFeedback() {
        logger.info("Fetching all feedback");
        return feedbackRepository.findAll();
    }
    
    @Override
    public List<Feedback> getFeedbackByUserId(Integer userId) {
        logger.info("Fetching feedback for user ID: " + userId);
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public List<Feedback> getFeedbackByStatus(Feedback.FeedbackStatus status) {
        logger.info("Fetching feedback with status: " + status);
        return feedbackRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    @Override
    public List<Feedback> getFeedbackByUserIdAndStatus(Integer userId, Feedback.FeedbackStatus status) {
        logger.info("Fetching feedback for user ID: " + userId + " with status: " + status);
        return feedbackRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }
    
    @Override
    public Feedback updateFeedback(Integer id, Feedback feedbackDetails) {
        logger.info("Updating feedback with ID: " + id);
        
        Optional<Feedback> existingFeedback = feedbackRepository.findById(id);
        if (existingFeedback.isPresent()) {
            Feedback feedback = existingFeedback.get();
            
            // Update only the fields that are not null
            if (feedbackDetails.getSubject() != null) {
                feedback.setSubject(feedbackDetails.getSubject());
            }
            
            if (feedbackDetails.getContent() != null) {
                feedback.setContent(feedbackDetails.getContent());
            }
            
            if (feedbackDetails.getStatus() != null) {
                feedback.setStatus(feedbackDetails.getStatus());
            }
            
            return feedbackRepository.save(feedback);
        }
        
        return null;
    }
    
    @Override
    public Feedback updateFeedbackStatus(Integer id, Feedback.FeedbackStatus status) {
        logger.info("Updating status of feedback with ID: " + id + " to " + status);
        
        Optional<Feedback> existingFeedback = feedbackRepository.findById(id);
        if (existingFeedback.isPresent()) {
            Feedback feedback = existingFeedback.get();
            feedback.setStatus(status);
            return feedbackRepository.save(feedback);
        }
        
        return null;
    }
    
    @Override
    public boolean deleteFeedback(Integer id) {
        logger.info("Deleting feedback with ID: " + id);
        
        Optional<Feedback> existingFeedback = feedbackRepository.findById(id);
        if (existingFeedback.isPresent()) {
            feedbackRepository.delete(existingFeedback.get());
            return true;
        }
        
        return false;
    }
    
    @Override
    public Map<String, Object> getFeedbackStatistics() {
        logger.info("Generating feedback statistics");
        
        Map<String, Object> statistics = new HashMap<>();
        
        long totalFeedback = feedbackRepository.count();
        long pendingFeedback = feedbackRepository.countByStatus(Feedback.FeedbackStatus.PENDING);
        long reviewedFeedback = feedbackRepository.countByStatus(Feedback.FeedbackStatus.REVIEWED);
        long resolvedFeedback = feedbackRepository.countByStatus(Feedback.FeedbackStatus.RESOLVED);
        
        statistics.put("total", totalFeedback);
        statistics.put("pending", pendingFeedback);
        statistics.put("reviewed", reviewedFeedback);
        statistics.put("resolved", resolvedFeedback);
        
        return statistics;
    }
} 