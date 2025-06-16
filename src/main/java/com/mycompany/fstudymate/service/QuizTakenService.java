package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.QuizTaken;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface QuizTakenService {
    
    // Start a new quiz attempt
    QuizTaken startQuiz(Integer userId, Integer quizId, String ipAddress, String userAgent);
    
    // Submit a completed quiz
    QuizTaken submitQuiz(Integer quizTakenId, Map<String, Object> answers, boolean calculateScore);
    
    // Abandon a quiz (user left without completing)
    void abandonQuiz(Integer quizTakenId);
    
    // Log an activity event
    void logActivity(Integer quizTakenId, String eventType, String details);
    
    // Get user's quiz history
    List<QuizTaken> getUserQuizHistory(Integer userId);
    
    // Get quiz statistics
    Map<String, Object> getQuizStatistics(Integer quizId);
    
    // Get a specific quiz attempt
    Optional<QuizTaken> getQuizAttempt(Integer quizTakenId);
    
    // Get a user's in-progress quizzes
    List<QuizTaken> getInProgressQuizzes(Integer userId);
    
    // Check if user has an in-progress attempt for a specific quiz
    boolean hasInProgressAttempt(Integer userId, Integer quizId);
    
    // Get highest scores for a quiz (leaderboard)
    List<Map<String, Object>> getQuizLeaderboard(Integer quizId, int limit);
} 