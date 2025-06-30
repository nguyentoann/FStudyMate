package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    
    // Find all feedback by user ID
    List<Feedback> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    // Find all feedback by status
    List<Feedback> findByStatusOrderByCreatedAtDesc(Feedback.FeedbackStatus status);
    
    // Find all feedback by user ID and status
    List<Feedback> findByUserIdAndStatusOrderByCreatedAtDesc(Integer userId, Feedback.FeedbackStatus status);
    
    // Count feedback by status
    long countByStatus(Feedback.FeedbackStatus status);
} 