package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.QuizTaken;
import com.mycompany.fstudymate.service.QuizTakenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizTakenController {

    @Autowired
    private QuizTakenService quizTakenService;
    
    @PostMapping("/start")
    public ResponseEntity<?> startQuiz(
            @RequestParam Integer userId,
            @RequestParam Integer quizId,
            HttpServletRequest request) {
        
        try {
            String ipAddress = request.getRemoteAddr();
            String userAgent = request.getHeader("User-Agent");
            
            QuizTaken quizTaken = quizTakenService.startQuiz(userId, quizId, ipAddress, userAgent);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz started successfully");
            response.put("quizTakenId", quizTaken.getId());
            response.put("startTime", quizTaken.getStartTime());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PostMapping("/{quizTakenId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Integer quizTakenId,
            @RequestBody Map<String, Object> answers) {
        
        try {
            QuizTaken quizTaken = quizTakenService.submitQuiz(quizTakenId, answers, true);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz submitted successfully");
            response.put("score", quizTaken.getScore());
            response.put("maxScore", quizTaken.getMaxScore());
            response.put("percentage", quizTaken.getPercentage());
            response.put("completionTime", quizTaken.getCompletionTime());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PostMapping("/{quizTakenId}/abandon")
    public ResponseEntity<?> abandonQuiz(@PathVariable Integer quizTakenId) {
        try {
            quizTakenService.abandonQuiz(quizTakenId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz abandoned successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PostMapping("/{quizTakenId}/log")
    public ResponseEntity<?> logActivity(
            @PathVariable Integer quizTakenId,
            @RequestParam String eventType,
            @RequestParam String details) {
        
        try {
            quizTakenService.logActivity(quizTakenId, eventType, details);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Activity logged successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserQuizHistory(@PathVariable Integer userId) {
        try {
            List<QuizTaken> history = quizTakenService.getUserQuizHistory(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("history", history);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/quiz/{quizId}/stats")
    public ResponseEntity<?> getQuizStatistics(@PathVariable Integer quizId) {
        try {
            Map<String, Object> statistics = quizTakenService.getQuizStatistics(quizId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/quiz/{quizId}/leaderboard")
    public ResponseEntity<?> getQuizLeaderboard(
            @PathVariable Integer quizId,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            List<Map<String, Object>> leaderboard = quizTakenService.getQuizLeaderboard(quizId, limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("leaderboard", leaderboard);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/in-progress/{userId}")
    public ResponseEntity<?> getInProgressQuizzes(@PathVariable Integer userId) {
        try {
            List<QuizTaken> inProgress = quizTakenService.getInProgressQuizzes(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("inProgressQuizzes", inProgress);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/{quizTakenId}")
    public ResponseEntity<?> getQuizAttempt(@PathVariable Integer quizTakenId) {
        try {
            return quizTakenService.getQuizAttempt(quizTakenId)
                .map(quizTaken -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("quizTaken", quizTaken);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("message", "Quiz attempt not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
                });
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 