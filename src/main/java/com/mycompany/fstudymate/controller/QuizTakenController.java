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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizTakenController {

    private static final Logger logger = LoggerFactory.getLogger(QuizTakenController.class);
    private static final boolean DEBUG_MODE = false; // SET TO FALSE WHEN DONE DEBUGGING

    @Autowired
    private QuizTakenService quizTakenService;
    
    @PostMapping("/start")
    public ResponseEntity<?> startQuiz(
            @RequestParam Integer userId,
            @RequestParam Integer quizId,
            HttpServletRequest request) {
        
        if (DEBUG_MODE) {
            logger.info("DEBUG: Starting quiz - userId: {}, quizId: {}", userId, quizId);
            logger.info("DEBUG: Request IP: {}, User-Agent: {}", request.getRemoteAddr(), request.getHeader("User-Agent"));
            logger.info("DEBUG: Auth header: {}", request.getHeader("Authorization"));
        }
        
        try {
            String ipAddress = request.getRemoteAddr();
            String userAgent = request.getHeader("User-Agent");
            
            QuizTaken quizTaken = quizTakenService.startQuiz(userId, quizId, ipAddress, userAgent);
            
            if (DEBUG_MODE) {
                logger.info("DEBUG: Quiz started successfully - quizTakenId: {}", quizTaken.getId());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz started successfully");
            response.put("quizTakenId", quizTaken.getId());
            response.put("startTime", quizTaken.getStartTime());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            if (DEBUG_MODE) {
                logger.error("DEBUG: Error starting quiz - userId: {}, quizId: {}, error: {}", 
                    userId, quizId, e.getMessage(), e);
            } else {
                logger.error("Error starting quiz: {}", e.getMessage());
            }
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PostMapping("/{quizTakenId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Integer quizTakenId,
            @RequestBody Map<String, Object> answers,
            HttpServletRequest request) {
        
        if (DEBUG_MODE) {
            logger.info("DEBUG: Submitting quiz - quizTakenId: {}", quizTakenId);
            logger.info("DEBUG: Number of answers: {}", answers.size());
            logger.info("DEBUG: Request IP: {}, User-Agent: {}", 
                request.getRemoteAddr(), request.getHeader("User-Agent"));
            logger.info("DEBUG: Auth header: {}", request.getHeader("Authorization"));
        }
        
        try {
            QuizTaken quizTaken = quizTakenService.submitQuiz(quizTakenId, answers, true);
            
            if (DEBUG_MODE) {
                logger.info("DEBUG: Quiz submitted successfully - quizTakenId: {}, score: {}, percentage: {}", 
                    quizTakenId, quizTaken.getScore(), quizTaken.getPercentage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz submitted successfully");
            response.put("score", quizTaken.getScore());
            response.put("maxScore", quizTaken.getMaxScore());
            response.put("percentage", quizTaken.getPercentage());
            response.put("completionTime", quizTaken.getCompletionTime());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            if (DEBUG_MODE) {
                logger.error("DEBUG: Error submitting quiz - quizTakenId: {}, error: {}", 
                    quizTakenId, e.getMessage(), e);
            } else {
                logger.error("Error submitting quiz: {}", e.getMessage());
            }
            
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
            logger.info("Getting quiz history for user ID: {}", userId);
            
            // Check if user ID is valid
            if (userId == null || userId <= 0) {
                logger.warn("Invalid user ID provided: {}", userId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid user ID");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            List<QuizTaken> history = quizTakenService.getUserQuizHistory(userId);
            logger.info("Found {} quiz attempts for user ID: {}", history.size(), userId);
            
            // Convert to DTOs to avoid lazy loading issues
            List<Map<String, Object>> historyDTOs = history.stream().map(quiz -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", quiz.getId());
                dto.put("quizId", quiz.getQuizId());
                dto.put("userId", quiz.getUserId());
                dto.put("startTime", quiz.getStartTime());
                dto.put("submitTime", quiz.getSubmitTime());
                dto.put("score", quiz.getScore());
                dto.put("maxScore", quiz.getMaxScore());
                dto.put("percentage", quiz.getPercentage());
                dto.put("status", quiz.getStatus().toString());
                dto.put("selectedAnswers", quiz.getSelectedAnswers());
                dto.put("completionTime", quiz.getCompletionTime());
                dto.put("ipAddress", quiz.getIpAddress());
                dto.put("userAgent", quiz.getUserAgent());
                return dto;
            }).collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("history", historyDTOs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting quiz history for user ID: {}", userId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", e.getClass().getName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
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
            logger.info("Getting leaderboard for quiz ID: {}, limit: {}", quizId, limit);
            
            List<Map<String, Object>> leaderboard = quizTakenService.getQuizLeaderboard(quizId, limit);
            logger.info("Found {} entries for quiz leaderboard", leaderboard.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("leaderboard", leaderboard);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting quiz leaderboard - quizId: {}", quizId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/in-progress/{userId}")
    public ResponseEntity<?> getInProgressQuizzes(@PathVariable Integer userId) {
        try {
            logger.info("Getting in-progress quizzes for user ID: {}", userId);
            
            List<QuizTaken> inProgress = quizTakenService.getInProgressQuizzes(userId);
            logger.info("Found {} in-progress quizzes for user ID: {}", inProgress.size(), userId);
            
            // Convert to DTOs to avoid lazy loading issues
            List<Map<String, Object>> inProgressDTOs = inProgress.stream().map(quiz -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", quiz.getId());
                dto.put("quizId", quiz.getQuizId());
                dto.put("userId", quiz.getUserId());
                dto.put("startTime", quiz.getStartTime());
                dto.put("status", quiz.getStatus().toString());
                return dto;
            }).collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("inProgressQuizzes", inProgressDTOs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting in-progress quizzes for user ID: {}", userId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/{quizTakenId}")
    public ResponseEntity<?> getQuizAttempt(@PathVariable Integer quizTakenId) {
        try {
            logger.info("Getting quiz attempt details - quizTakenId: {}", quizTakenId);
            
            return quizTakenService.getQuizAttempt(quizTakenId)
                .map(quizTaken -> {
                    // Convert to DTO to avoid lazy loading issues
                    Map<String, Object> quizTakenDTO = new HashMap<>();
                    quizTakenDTO.put("id", quizTaken.getId());
                    quizTakenDTO.put("quizId", quizTaken.getQuizId());
                    quizTakenDTO.put("userId", quizTaken.getUserId());
                    quizTakenDTO.put("startTime", quizTaken.getStartTime());
                    quizTakenDTO.put("submitTime", quizTaken.getSubmitTime());
                    quizTakenDTO.put("score", quizTaken.getScore());
                    quizTakenDTO.put("maxScore", quizTaken.getMaxScore());
                    quizTakenDTO.put("percentage", quizTaken.getPercentage());
                    quizTakenDTO.put("status", quizTaken.getStatus().toString());
                    quizTakenDTO.put("selectedAnswers", quizTaken.getSelectedAnswers());
                    quizTakenDTO.put("completionTime", quizTaken.getCompletionTime());
                    quizTakenDTO.put("ipAddress", quizTaken.getIpAddress());
                    quizTakenDTO.put("userAgent", quizTaken.getUserAgent());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("quizTaken", quizTakenDTO);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("message", "Quiz attempt not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
                });
        } catch (Exception e) {
            logger.error("Error getting quiz attempt - quizTakenId: {}", quizTakenId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 