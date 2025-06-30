package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Feedback;
import com.mycompany.fstudymate.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private static final Logger logger = Logger.getLogger(FeedbackController.class.getName());
    
    @Autowired
    private FeedbackService feedbackService;
    
    /**
     * Create new feedback
     */
    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        try {
            logger.info("Creating new feedback: " + feedback.getSubject());
            Feedback createdFeedback = feedbackService.createFeedback(feedback);
            return new ResponseEntity<>(createdFeedback, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error creating feedback: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get feedback by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Integer id) {
        try {
            logger.info("Fetching feedback with ID: " + id);
            Optional<Feedback> feedback = feedbackService.getFeedbackById(id);
            
            if (feedback.isPresent()) {
                return new ResponseEntity<>(feedback.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.severe("Error fetching feedback: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get all feedback
     */
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        try {
            logger.info("Fetching all feedback");
            List<Feedback> feedbackList = feedbackService.getAllFeedback();
            return new ResponseEntity<>(feedbackList, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error fetching all feedback: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get feedback by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getFeedbackByUserId(@PathVariable Integer userId) {
        try {
            logger.info("Fetching feedback for user ID: " + userId);
            List<Feedback> feedbackList = feedbackService.getFeedbackByUserId(userId);
            return new ResponseEntity<>(feedbackList, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error fetching feedback by user ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get feedback by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Feedback>> getFeedbackByStatus(@PathVariable String status) {
        try {
            logger.info("Fetching feedback with status: " + status);
            Feedback.FeedbackStatus feedbackStatus = Feedback.FeedbackStatus.valueOf(status.toUpperCase());
            List<Feedback> feedbackList = feedbackService.getFeedbackByStatus(feedbackStatus);
            return new ResponseEntity<>(feedbackList, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.severe("Invalid status value: " + status);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.severe("Error fetching feedback by status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Update feedback
     */
    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Integer id, @RequestBody Feedback feedbackDetails) {
        try {
            logger.info("Updating feedback with ID: " + id);
            Feedback updatedFeedback = feedbackService.updateFeedback(id, feedbackDetails);
            
            if (updatedFeedback != null) {
                return new ResponseEntity<>(updatedFeedback, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.severe("Error updating feedback: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Update feedback status
     */
    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<Feedback> updateFeedbackStatus(@PathVariable Integer id, @PathVariable String status) {
        try {
            logger.info("Updating status of feedback with ID: " + id + " to " + status);
            Feedback.FeedbackStatus feedbackStatus = Feedback.FeedbackStatus.valueOf(status.toUpperCase());
            Feedback updatedFeedback = feedbackService.updateFeedbackStatus(id, feedbackStatus);
            
            if (updatedFeedback != null) {
                return new ResponseEntity<>(updatedFeedback, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            logger.severe("Invalid status value: " + status);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.severe("Error updating feedback status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Delete feedback
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Integer id) {
        try {
            logger.info("Deleting feedback with ID: " + id);
            boolean deleted = feedbackService.deleteFeedback(id);
            
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.severe("Error deleting feedback: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get feedback statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getFeedbackStatistics() {
        try {
            logger.info("Generating feedback statistics");
            Map<String, Object> statistics = feedbackService.getFeedbackStatistics();
            return new ResponseEntity<>(statistics, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error generating feedback statistics: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 