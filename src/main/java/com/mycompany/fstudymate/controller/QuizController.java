package com.mycompany.fstudymate.controller;

import dao.QuizDAO;
import dao.QuestionDAO;
import model.Quiz;
import model.QuizPermission;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.logging.Logger;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import connection.ConnectionPool;
import connection.DBUtils;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "false")
public class QuizController {
    
    private static final Logger logger = Logger.getLogger(QuizController.class.getName());
    
    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Map<String, Object> payload) {
        try {
            logger.info("Creating new quiz with payload: " + payload);
            
            // Extract quiz data
            String title = (String) payload.get("title");
            String description = (String) payload.get("description");
            Integer userId = (Integer) payload.get("userId");
            String maMon = (String) payload.get("maMon");
            String maDe = (String) payload.get("maDe");
            Boolean isAiGenerated = (Boolean) payload.getOrDefault("isAiGenerated", false);
            String password = (String) payload.getOrDefault("password", null);
            Integer timeLimit = (Integer) payload.getOrDefault("timeLimit", null);
            Integer securityLevel = (Integer) payload.getOrDefault("securityLevel", 0);
            
            // Validate required fields
            if (title == null || maMon == null || maDe == null || userId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Missing required fields (title, maMon, maDe, userId)"
                ));
            }
            
            // Create quiz object
            Quiz quiz = new Quiz(
                title, 
                description, 
                userId, 
                maMon, 
                maDe, 
                isAiGenerated, 
                password, 
                timeLimit, 
                securityLevel
            );
            
            // Save quiz to database
            int quizId = QuizDAO.createQuiz(quiz);
            
            if (quizId <= 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Failed to create quiz"
                ));
            }
            
            // Handle quiz permissions if provided
            List<String> classIds = (List<String>) payload.getOrDefault("classIds", new ArrayList<String>());
            for (String classId : classIds) {
                QuizPermission permission = new QuizPermission(0, quizId, classId); // Id will be auto-generated
                QuizDAO.addQuizPermission(permission);
            }
            
            // Handle questions if provided
            List<Map<String, Object>> questions = (List<Map<String, Object>>) payload.getOrDefault("questions", new ArrayList<>());
            List<model.Question> questionObjects = new ArrayList<>();
            
            for (Map<String, Object> questionData : questions) {
                String questionImg = (String) questionData.getOrDefault("questionImg", "");
                String questionText = (String) questionData.get("questionText");
                Integer slDapAn = (Integer) questionData.getOrDefault("slDapAn", 4); // Default to 4 options
                String correct = (String) questionData.get("correct");
                String explanation = (String) questionData.getOrDefault("explanation", "");
                
                model.Question question = new model.Question(0, maMon, maDe, questionImg, questionText, slDapAn, correct, explanation);
                questionObjects.add(question);
            }
            
            List<Integer> questionIds = QuestionDAO.createQuestions(questionObjects, quizId);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("quizId", quizId);
            response.put("questionIds", questionIds);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.severe("Error creating quiz: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getUserQuizzes(@RequestParam Integer userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required userId parameter"
                ));
            }
            
            List<Quiz> quizzes = QuizDAO.getQuizzesByUserId(userId);
            return ResponseEntity.ok(quizzes);
            
        } catch (Exception e) {
            logger.severe("Error fetching user quizzes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get quizzes for a specific lecturer
     */
    @GetMapping("/lecturer/{lecturerId}")
    public ResponseEntity<?> getLecturerQuizzes(@PathVariable Integer lecturerId) {
        try {
            if (lecturerId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required lecturerId parameter"
                ));
            }
            
            logger.info("Fetching quizzes for lecturer: " + lecturerId);
            
            // Get quizzes created by this lecturer
            List<Quiz> quizzes = QuizDAO.getQuizzesByUserId(lecturerId);
            
            // Enhance quiz data with additional information
            List<Map<String, Object>> enhancedQuizzes = new ArrayList<>();
            
            for (Quiz quiz : quizzes) {
                Map<String, Object> enhancedQuiz = new HashMap<>();
                enhancedQuiz.put("id", quiz.getId());
                enhancedQuiz.put("title", quiz.getTitle());
                enhancedQuiz.put("description", quiz.getDescription());
                enhancedQuiz.put("subjectCode", quiz.getMaMon());
                enhancedQuiz.put("examCode", quiz.getMaDe());
                // Quiz doesn't have status field, so assume active for now
                enhancedQuiz.put("status", "active");
                enhancedQuiz.put("timeLimit", quiz.getTimeLimit());
                enhancedQuiz.put("createdAt", quiz.getCreatedAt());
                enhancedQuiz.put("updatedAt", quiz.getUpdatedAt());
                
                // Get count of questions
                int totalQuestions = countQuestionsByQuizId(quiz.getId());
                enhancedQuiz.put("totalQuestions", totalQuestions);
                
                // Get count of attempts
                int attempts = countAttemptsByQuizId(quiz.getId());
                enhancedQuiz.put("attempts", attempts);
                
                enhancedQuizzes.add(enhancedQuiz);
            }
            
            return ResponseEntity.ok(enhancedQuizzes);
            
        } catch (Exception e) {
            logger.severe("Error fetching lecturer quizzes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    // Helper method to count questions for a quiz
    private int countQuestionsByQuizId(int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int count = 0;
        
        try {
            String sql = "SELECT COUNT(*) FROM Questions WHERE quiz_id = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                count = rs.getInt(1);
            }
        } catch (SQLException e) {
            System.out.println("Error counting questions: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return count;
    }
    
    // Helper method to count quiz attempts
    private int countAttemptsByQuizId(int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int count = 0;
        
        try {
            String sql = "SELECT COUNT(*) FROM QuizTaken WHERE quiz_id = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                count = rs.getInt(1);
            }
        } catch (SQLException e) {
            System.out.println("Error counting attempts: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return count;
    }
    
    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuizById(@PathVariable int quizId) {
        try {
            Quiz quiz = QuizDAO.getQuizById(quizId);
            
            if (quiz == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Quiz not found"
                ));
            }
            
            // Get questions for quiz
            List<model.Question> questions = QuestionDAO.getQuestionsByQuizId(quizId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("quiz", quiz);
            response.put("questions", questions);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.severe("Error fetching quiz: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{quizId}")
    public ResponseEntity<?> updateQuiz(@PathVariable int quizId, @RequestBody Map<String, Object> payload) {
        try {
            // Check if quiz exists
            Quiz existingQuiz = QuizDAO.getQuizById(quizId);
            
            if (existingQuiz == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Quiz not found"
                ));
            }
            
            // Update quiz fields
            String title = (String) payload.getOrDefault("title", existingQuiz.getTitle());
            String description = (String) payload.getOrDefault("description", existingQuiz.getDescription());
            String maMon = (String) payload.getOrDefault("maMon", existingQuiz.getMaMon());
            String maDe = (String) payload.getOrDefault("maDe", existingQuiz.getMaDe());
            Boolean isAiGenerated = (Boolean) payload.getOrDefault("isAiGenerated", existingQuiz.isIsAiGenerated());
            String password = (String) payload.getOrDefault("password", existingQuiz.getPassword());
            Integer timeLimit = (Integer) payload.getOrDefault("timeLimit", existingQuiz.getTimeLimit());
            Integer securityLevel = (Integer) payload.getOrDefault("securityLevel", existingQuiz.getSecurityLevel());
            
            Quiz updatedQuiz = new Quiz(
                quizId,
                title,
                description,
                existingQuiz.getUserId(),
                maMon,
                maDe,
                isAiGenerated,
                existingQuiz.getCreatedAt(),
                existingQuiz.getUpdatedAt(),
                password,
                timeLimit,
                securityLevel
            );
            
            boolean updateResult = QuizDAO.updateQuiz(updatedQuiz);
            
            if (!updateResult) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Failed to update quiz"
                ));
            }
            
            // Handle questions if provided
            List<Map<String, Object>> questions = (List<Map<String, Object>>) payload.get("questions");
            if (questions != null) {
                for (Map<String, Object> questionData : questions) {
                    Integer questionId = (Integer) questionData.get("id");
                    String questionImg = (String) questionData.getOrDefault("questionImg", "");
                    String questionText = (String) questionData.get("questionText");
                    Integer slDapAn = (Integer) questionData.getOrDefault("slDapAn", 4);
                    String correct = (String) questionData.get("correct");
                    String explanation = (String) questionData.getOrDefault("explanation", "");
                    
                    if (questionId != null && questionId > 0) {
                        // Update existing question
                        model.Question question = new model.Question(questionId, maMon, maDe, questionImg, questionText, slDapAn, correct, explanation);
                        QuestionDAO.updateQuestion(question);
                    } else {
                        // Create new question
                        model.Question question = new model.Question(0, maMon, maDe, questionImg, questionText, slDapAn, correct, explanation);
                        QuestionDAO.createQuestion(question, quizId);
                    }
                }
            }
            
            return ResponseEntity.ok(Map.of("success", true));
            
        } catch (Exception e) {
            logger.severe("Error updating quiz: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{quizId}")
    public ResponseEntity<?> deleteQuiz(@PathVariable int quizId) {
        try {
            boolean result = QuizDAO.deleteQuiz(quizId);
            
            if (result) {
                return ResponseEntity.ok(Map.of("success", true));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Quiz not found or could not be deleted"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error deleting quiz: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{quizId}/permissions")
    public ResponseEntity<?> getQuizPermissions(@PathVariable int quizId) {
        try {
            List<QuizPermission> permissions = QuizDAO.getQuizPermissions(quizId);
            return ResponseEntity.ok(permissions);
            
        } catch (Exception e) {
            logger.severe("Error fetching quiz permissions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/{quizId}/permissions")
    public ResponseEntity<?> addQuizPermission(@PathVariable int quizId, @RequestBody Map<String, Object> payload) {
        try {
            String classId = (String) payload.get("classId");
            
            if (classId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Missing required classId field"
                ));
            }
            
            QuizPermission permission = new QuizPermission(0, quizId, classId);
            boolean result = QuizDAO.addQuizPermission(permission);
            
            if (result) {
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Failed to add permission"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error adding quiz permission: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{quizId}/permissions/{permissionId}")
    public ResponseEntity<?> removeQuizPermission(@PathVariable int quizId, @PathVariable int permissionId) {
        try {
            boolean result = QuizDAO.removeQuizPermission(permissionId);
            
            if (result) {
                return ResponseEntity.ok(Map.of("success", true));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Permission not found or could not be deleted"
                ));
            }
            
        } catch (Exception e) {
            logger.severe("Error removing quiz permission: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Server error: " + e.getMessage()
            ));
        }
    }
} 