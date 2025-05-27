package com.mycompany.vinmultiplechoice.controller;

import com.mycompany.vinmultiplechoice.model.Question;
import com.mycompany.vinmultiplechoice.service.QuestionService;
import com.mycompany.vinmultiplechoice.model.Lesson;
import service.OpenAIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "false")
public class QuestionController {
    
    private static final Logger logger = Logger.getLogger(QuestionController.class.getName());
    private final QuestionService questionService;
    
    @Autowired
    private OpenAIService openAIService;

    @Autowired
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/mamon")
    public ResponseEntity<List<String>> getAllMaMon() {
        try {
            logger.info("GET request received for /mamon");
            List<String> maMonList = questionService.getAllMaMon();
            
            if (maMonList.isEmpty()) {
                logger.warning("No MaMon values found");
            } else {
                logger.info("Returning " + maMonList.size() + " MaMon values");
            }
            
            // Return OK even if empty - this prevents the client from seeing errors
            return ResponseEntity.ok(maMonList);
        } catch (Exception e) {
            logger.severe("Error in getAllMaMon endpoint: " + e.getMessage());
            e.printStackTrace();
            
            // Return empty list with OK status instead of error to prevent client-side issues
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/made/{maMon}")
    public ResponseEntity<List<String>> getMaDeByMaMon(
            @PathVariable String maMon,
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String role) {
        
        logger.info("Getting MaDe for MaMon: " + maMon + ", role: " + role + ", classId: " + classId);
        
        // If role is admin or lecturer, or no class ID provided, return all MaDe
        if ("Admin".equals(role) || "Lecturer".equals(role) || classId == null || classId.isEmpty()) {
            logger.info("User is Admin/Lecturer or no classId - returning all MaDe");
            List<String> maDeList = questionService.getMaDeByMaMon(maMon);
            logger.info("Found " + maDeList.size() + " MaDe entries");
            return ResponseEntity.ok(maDeList);
        } else {
            // For students, only return permitted MaDe
            logger.info("User is Student with classId: " + classId + " - returning filtered MaDe");
            List<String> maDeList = questionService.getMaDeByMaMonWithPermissions(maMon, classId);
            logger.info("Found " + maDeList.size() + " permitted MaDe entries");
            return ResponseEntity.ok(maDeList);
        }
    }

    @GetMapping("/{maMon}/{maDe}")
    public ResponseEntity<List<Question>> getQuestionsByMaMonAndMaDe(
            @PathVariable String maMon,
            @PathVariable String maDe,
            @RequestParam(required = false) String option) {
        
        logger.info("Getting questions for MaMon: " + maMon + ", MaDe: " + maDe + ", option: " + option);
        
        try {
            List<Question> questions = questionService.getQuestionsByMaMonAndMaDe(maMon, maDe);
            
            // Don't set MaMon and MaDe on questions - these should only be in the Quiz table
            
            if (option != null && option.equals("random")) {
                logger.info("Randomizing question order");
                Collections.shuffle(questions);
            }
            
            logger.info("Returning " + questions.size() + " questions");
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            logger.severe("Error retrieving questions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }
    
    @PostMapping("/generate-ai-quiz")
    public ResponseEntity<?> generateAIQuiz(@RequestBody Map<String, Object> payload) {
        try {
            logger.info("=== STARTING AI QUIZ GENERATION ===");
            logger.info("Received payload: " + payload);
            
            Integer lessonId = (Integer) payload.get("lessonId");
            Integer numQuestions = (Integer) payload.getOrDefault("numQuestions", 20);
            String difficulty = (String) payload.getOrDefault("difficulty", "medium");
            Integer userIdParam = (Integer) payload.get("userId");
            String classId = (String) payload.getOrDefault("classId", "0"); // Default to 0 (creator only)
            
            // Validate essential parameters
            if (lessonId == null) {
                logger.warning("Missing required parameter: lessonId");
                return ResponseEntity.badRequest().body(Map.of("error", "Lesson ID is required"));
            }
            
            if (userIdParam == null) {
                logger.warning("Missing required parameter: userId");
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            // Get a valid user ID
            Integer userId = userIdParam;
            
            logger.info("Quiz parameters - lessonId: " + lessonId + ", numQuestions: " + numQuestions + 
                        ", difficulty: " + difficulty + ", userId: " + userId + ", classId: " + classId);
            
            // Get the lesson from the database
            logger.info("Fetching lesson with ID: " + lessonId);
            Optional<Lesson> lessonOpt = questionService.getLessonById(lessonId);
            if (!lessonOpt.isPresent()) {
                logger.warning("Lesson not found with ID: " + lessonId);
                return ResponseEntity.badRequest().body(Map.of("error", "Lesson not found"));
            }
            
            Lesson lesson = lessonOpt.get();
            logger.info("Found lesson: " + lesson.getTitle());
            
            String subjectName = questionService.getSubjectNameById(lesson.getSubjectId());
            logger.info("Subject name: " + subjectName);
            
            if (subjectName == null) {
                logger.warning("Subject not found for ID: " + lesson.getSubjectId());
                return ResponseEntity.badRequest().body(Map.of("error", "Subject not found"));
            }
            
            // Generate a maDe with timestamp
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String maDe = "AI-GEN-" + now.format(formatter);
            logger.info("Generated maDe: " + maDe);
            
            // Create quiz title from lesson name
            String quizTitle = lesson.getTitle() + " Quiz";
            String description = "AI-generated quiz based on lesson: " + lesson.getTitle();
            
            // Create the quiz record first
            Map<String, Object> quizCreationResult = questionService.createAIQuiz(
                quizTitle, subjectName, maDe, description, userId, classId);
                
            if (!(Boolean)quizCreationResult.get("success")) {
                logger.warning("Failed to create quiz record: " + quizCreationResult.get("error"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create quiz: " + quizCreationResult.get("error")));
            }
            
            Integer quizId = (Integer)quizCreationResult.get("quizId");
            logger.info("Created quiz with ID: " + quizId);
            
            // Adjust difficulty instructions based on selected level
            String difficultyInstructions = "";
            switch (difficulty) {
                case "easy":
                    difficultyInstructions = "Create basic questions covering fundamental concepts. Questions should be straightforward and test basic understanding.";
                    break;
                case "medium":
                    difficultyInstructions = "Create moderately challenging questions that require deeper understanding of the concepts.";
                    break;
                case "hard":
                    difficultyInstructions = "Create advanced questions that require in-depth understanding and application of complex concepts.";
                    break;
                default:
                    difficultyInstructions = "Create moderately challenging questions.";
            }
            
            // Create the prompt for OpenAI - changed to avoid introductory text in the response
            String prompt = "Generate exactly " + numQuestions + " multiple-choice questions for a quiz on the following lesson content. " +
                           difficultyInstructions + " " +
                           "Format each question with the following strict delimiters using proper Markdown formatting, Question text with **bold** for emphasis, *italic* for terms, and `code` for code snippets:\n\n" +
                           "<question>\n" +
                           "[Question text]\n\n" +
                           "A) [Option A]\n\n" +
                           "B) [Option B]\n\n" +
                           "C) [Option C]\n\n" +
                           "D) [Option D]\n\n" +
                           "Correct Answer: [A, B, C, or D]\n\n" +
                           "Explanation: [Brief explanation why this is correct]\n" +
                           "</question>\n\n" +
                           "Do not include any introductory text or conclusion. Start directly with <question> tag for the first question.\n" +
                           "Use these exact delimiters (<question> and </question>) for each question to ensure proper parsing.\n" +
                           "Use double line breaks between each question element for proper Markdown formatting.\n\n" +
                           "LESSON CONTENT:\n" + lesson.getContent();
            
            logger.info("=== PROMPT TO OPENAI ===");
            logger.info(prompt);
            logger.info("========================");
            
            // Call the OpenAI service
            logger.info("Calling OpenAI service...");
            List<Map<String, String>> conversationHistory = new ArrayList<>();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("role", "system");
            String aiResponse = openAIService.generateAIResponse(prompt, conversationHistory, userInfo);
            
            logger.info("=== AI RESPONSE LENGTH ===");
            logger.info("Response length: " + (aiResponse != null ? aiResponse.length() : 0) + " characters");
            
            // Process the AI response to create questions
            logger.info("Processing AI response to create questions...");
            // Pass the subject name and maDe for context but don't store in questions table
            List<Question> generatedQuestions = questionService.createQuestionsFromAIResponse(aiResponse, subjectName, maDe);
            
            // Associate questions with the quiz
            List<Integer> questionIds = generatedQuestions.stream()
                .map(Question::getId)
                .collect(Collectors.toList());
                
            if (!questionIds.isEmpty()) {
                questionService.setQuizIdForQuestions(questionIds, quizId);
                logger.info("Associated " + questionIds.size() + " questions with quiz ID: " + quizId);
            }
            
            logger.info("Successfully generated " + generatedQuestions.size() + " questions");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz generated successfully");
            response.put("quizId", quizId);
            response.put("maMon", subjectName);
            response.put("maDe", maDe);
            response.put("questionCount", generatedQuestions.size());
            
            logger.info("=== QUIZ GENERATION COMPLETE ===");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.severe("Error generating quiz: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/quizzes/metadata")
    public ResponseEntity<?> getQuizMetadata(
            @RequestParam String maMon,
            @RequestParam String maDe) {
        
        logger.info("Fetching quiz metadata for MaMon: " + maMon + ", MaDe: " + maDe);
        
        try {
            Map<String, Object> metadata = questionService.getQuizMetadata(maMon, maDe);
            logger.info("Metadata found: " + metadata);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            logger.severe("Error fetching quiz metadata: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch quiz metadata"));
        }
    }

    @GetMapping("/quizzes/subject-metadata")
    public ResponseEntity<?> getQuizMetadataForSubject(
            @RequestParam String maMon) {
        
        logger.info("Fetching quiz metadata for all exams in subject: " + maMon);
        
        try {
            Map<String, Map<String, Object>> metadataMap = questionService.getQuizMetadataForSubject(maMon);
            logger.info("Found metadata for " + metadataMap.size() + " exams");
            return ResponseEntity.ok(metadataMap);
        } catch (Exception e) {
            logger.severe("Error fetching subject quiz metadata: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch subject quiz metadata"));
        }
    }
} 