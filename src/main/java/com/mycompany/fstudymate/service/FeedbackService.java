package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Feedback;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface FeedbackService {
    
    // Create new feedback
    Feedback createFeedback(Feedback feedback);
    
    // Get feedback by ID
    Optional<Feedback> getFeedbackById(Integer id);
    
    // Get all feedback
    List<Feedback> getAllFeedback();
    
    // Get feedback by user ID
    List<Feedback> getFeedbackByUserId(Integer userId);
    
    // Get feedback by status
    List<Feedback> getFeedbackByStatus(Feedback.FeedbackStatus status);
    
    // Get feedback by user ID and status
    List<Feedback> getFeedbackByUserIdAndStatus(Integer userId, Feedback.FeedbackStatus status);
    
    // Update feedback
    Feedback updateFeedback(Integer id, Feedback feedbackDetails);
    
    // Update feedback status
    Feedback updateFeedbackStatus(Integer id, Feedback.FeedbackStatus status);
    
    // Delete feedback
    boolean deleteFeedback(Integer id);
    
    // Get feedback statistics
    Map<String, Object> getFeedbackStatistics();
} 