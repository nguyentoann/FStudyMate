package com.mycompany.fstudymate.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.fstudymate.model.Question;
import com.mycompany.fstudymate.model.Quiz;
import com.mycompany.fstudymate.model.QuizTaken;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.repository.QuestionRepository;
import com.mycompany.fstudymate.repository.QuizRepository;
import com.mycompany.fstudymate.repository.QuizTakenRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizTakenServiceImpl implements QuizTakenService {

    private static final Logger logger = LoggerFactory.getLogger(QuizTakenServiceImpl.class);
    
    @Autowired
    private QuizTakenRepository quizTakenRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public QuizTaken startQuiz(Integer userId, Integer quizId, String ipAddress, String userAgent) {
        logger.info("Starting quiz attempt - userId: {}, quizId: {}", userId, quizId);
        
        // Check if user exists
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Check if quiz exists
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (!quizOpt.isPresent()) {
            throw new IllegalArgumentException("Quiz not found");
        }
        
        // Check if user already has an in-progress attempt
        if (hasInProgressAttempt(userId, quizId)) {
            logger.warn("User already has an in-progress attempt for this quiz");
            Optional<QuizTaken> inProgressAttempt = quizTakenRepository
                .findByUserIdAndStatus(userId, QuizTaken.QuizStatus.IN_PROGRESS)
                .stream()
                .filter(qt -> qt.getQuizId().equals(quizId))
                .findFirst();
            
            if (inProgressAttempt.isPresent()) {
                return inProgressAttempt.get();
            }
        }
        
        // Create new quiz attempt
        QuizTaken quizTaken = new QuizTaken();
        quizTaken.setUserId(userId);
        quizTaken.setQuizId(quizId);
        quizTaken.setStartTime(LocalDateTime.now());
        quizTaken.setStatus(QuizTaken.QuizStatus.IN_PROGRESS);
        quizTaken.setIpAddress(ipAddress);
        quizTaken.setUserAgent(userAgent);
        
        // Initialize activity log
        quizTaken.addLogEntry("START", "Quiz attempt started");
        
        return quizTakenRepository.save(quizTaken);
    }

    @Override
    @Transactional
    public QuizTaken submitQuiz(Integer quizTakenId, Map<String, Object> answers, boolean calculateScore) {
        logger.info("Submitting quiz attempt - id: {}", quizTakenId);
        
        Optional<QuizTaken> quizTakenOpt = quizTakenRepository.findById(quizTakenId);
        if (!quizTakenOpt.isPresent()) {
            throw new IllegalArgumentException("Quiz attempt not found");
        }
        
        QuizTaken quizTaken = quizTakenOpt.get();
        
        // Only allow submission if the quiz is in progress
        if (quizTaken.getStatus() != QuizTaken.QuizStatus.IN_PROGRESS) {
            throw new IllegalStateException("Quiz attempt is not in progress");
        }
        
        // Set submission time
        quizTaken.setSubmitTime(LocalDateTime.now());
        
        // Calculate completion time
        quizTaken.calculateCompletionTime();
        
        // Save selected answers as JSON
        try {
            quizTaken.setSelectedAnswers(objectMapper.writeValueAsString(answers));
        } catch (JsonProcessingException e) {
            logger.error("Error serializing answers", e);
            quizTaken.setSelectedAnswers("{}");
        }
        
        // Calculate score if requested
        if (calculateScore) {
            Map<String, BigDecimal> scoreResult = calculateQuizScore(quizTaken.getQuizId(), answers);
            quizTaken.setScore(scoreResult.get("score"));
            quizTaken.setMaxScore(scoreResult.get("maxScore"));
            quizTaken.setPercentage(scoreResult.get("percentage"));
        }
        
        // Update status
        quizTaken.setStatus(QuizTaken.QuizStatus.COMPLETED);
        
        // Log completion
        quizTaken.addLogEntry("SUBMIT", "Quiz submitted");
        
        return quizTakenRepository.save(quizTaken);
    }

    @Override
    @Transactional
    public void abandonQuiz(Integer quizTakenId) {
        logger.info("Abandoning quiz attempt - id: {}", quizTakenId);
        
        Optional<QuizTaken> quizTakenOpt = quizTakenRepository.findById(quizTakenId);
        if (!quizTakenOpt.isPresent()) {
            throw new IllegalArgumentException("Quiz attempt not found");
        }
        
        QuizTaken quizTaken = quizTakenOpt.get();
        
        // Only allow abandonment if the quiz is in progress
        if (quizTaken.getStatus() != QuizTaken.QuizStatus.IN_PROGRESS) {
            return; // Already completed or abandoned
        }
        
        quizTaken.setStatus(QuizTaken.QuizStatus.ABANDONED);
        quizTaken.addLogEntry("ABANDON", "Quiz abandoned");
        
        quizTakenRepository.save(quizTaken);
    }

    @Override
    @Transactional
    public void logActivity(Integer quizTakenId, String eventType, String details) {
        logger.info("Logging activity - quizTakenId: {}, event: {}", quizTakenId, eventType);
        
        Optional<QuizTaken> quizTakenOpt = quizTakenRepository.findById(quizTakenId);
        if (!quizTakenOpt.isPresent()) {
            throw new IllegalArgumentException("Quiz attempt not found");
        }
        
        QuizTaken quizTaken = quizTakenOpt.get();
        quizTaken.addLogEntry(eventType, details);
        
        quizTakenRepository.save(quizTaken);
    }

    @Override
    public List<QuizTaken> getUserQuizHistory(Integer userId) {
        logger.info("Getting quiz history for user - userId: {}", userId);
        return quizTakenRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    @Override
    public Map<String, Object> getQuizStatistics(Integer quizId) {
        logger.info("Getting statistics for quiz - quizId: {}", quizId);
        
        Map<String, Object> statistics = new HashMap<>();
        
        // Get quiz attempts
        List<QuizTaken> attempts = quizTakenRepository.findByQuizIdOrderByStartTimeDesc(quizId);
        
        // Calculate statistics
        long totalAttempts = attempts.size();
        long completedAttempts = attempts.stream()
            .filter(qt -> qt.getStatus() == QuizTaken.QuizStatus.COMPLETED)
            .count();
        
        // Average score
        Double avgScore = quizTakenRepository.getAverageScoreForQuiz(quizId);
        
        // Highest scores
        List<QuizTaken> highestScores = quizTakenRepository.getHighestScoresForQuiz(quizId);
        
        statistics.put("totalAttempts", totalAttempts);
        statistics.put("completedAttempts", completedAttempts);
        statistics.put("averageScore", avgScore != null ? avgScore : 0);
        statistics.put("highestScores", highestScores);
        
        return statistics;
    }

    @Override
    public Optional<QuizTaken> getQuizAttempt(Integer quizTakenId) {
        return quizTakenRepository.findById(quizTakenId);
    }

    @Override
    public List<QuizTaken> getInProgressQuizzes(Integer userId) {
        return quizTakenRepository.findByUserIdAndStatus(userId, QuizTaken.QuizStatus.IN_PROGRESS);
    }

    @Override
    public boolean hasInProgressAttempt(Integer userId, Integer quizId) {
        List<QuizTaken> inProgressAttempts = quizTakenRepository.findByUserIdAndStatus(
            userId, QuizTaken.QuizStatus.IN_PROGRESS);
        
        return inProgressAttempts.stream()
            .anyMatch(qt -> qt.getQuizId().equals(quizId));
    }

    @Override
    public List<Map<String, Object>> getQuizLeaderboard(Integer quizId, int limit) {
        List<QuizTaken> highestScores = quizTakenRepository.getHighestScoresForQuiz(quizId);
        
        // Sort by score (descending)
        highestScores.sort(Comparator.comparing(QuizTaken::getPercentage).reversed());
        
        // Apply limit
        List<QuizTaken> limitedScores = highestScores.stream()
            .limit(limit)
            .collect(Collectors.toList());
        
        // Convert to maps with user details
        return limitedScores.stream().map(qt -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("score", qt.getScore());
            entry.put("percentage", qt.getPercentage());
            entry.put("completionTime", qt.getCompletionTime());
            entry.put("submitTime", qt.getSubmitTime());
            
            // Add user details if user is loaded
            if (qt.getUser() != null) {
                entry.put("userId", qt.getUserId());
                entry.put("username", qt.getUser().getUsername());
                entry.put("fullName", qt.getUser().getFullName());
            } else {
                // Fetch user separately if not loaded with the entity
                Optional<User> userOpt = userRepository.findById(qt.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    entry.put("userId", user.getId());
                    entry.put("username", user.getUsername());
                    entry.put("fullName", user.getFullName());
                } else {
                    entry.put("userId", qt.getUserId());
                    entry.put("username", "Unknown");
                    entry.put("fullName", "Unknown User");
                }
            }
            
            return entry;
        }).collect(Collectors.toList());
    }
    
    // Helper method to calculate quiz score
    private Map<String, BigDecimal> calculateQuizScore(Integer quizId, Map<String, Object> answers) {
        // Fetch quiz questions
        List<Question> questions = questionRepository.findAll().stream()
            .filter(q -> q.getQuizId() != null && q.getQuizId().equals(quizId))
            .collect(Collectors.toList());
        
        BigDecimal totalScore = BigDecimal.ZERO;
        BigDecimal maxPossibleScore = BigDecimal.ZERO;
        
        for (Question question : questions) {
            // Get question points (default to 10 if not set)
            BigDecimal questionPoints = BigDecimal.valueOf(question.getPoints() != null ? question.getPoints() : 10);
            maxPossibleScore = maxPossibleScore.add(questionPoints);
            
            // Get user's answer(s) for this question
            Object userAnswer = answers.get(String.valueOf(question.getId()));
            if (userAnswer == null) {
                continue; // No answer provided
            }
            
            // Check if correct
            boolean isCorrect = false;
            Set<String> correctAnswerSet = question.getCorrectAnswers();
            
            // Handle different answer formats (single answer vs array)
            if (userAnswer instanceof String) {
                // Single answer
                isCorrect = correctAnswerSet.contains(userAnswer);
                if (isCorrect) {
                    totalScore = totalScore.add(questionPoints);
                }
            } else if (userAnswer instanceof List) {
                // Multiple answers
                @SuppressWarnings("unchecked")
                List<String> userAnswers = (List<String>) userAnswer;
                
                // For multiple choice, calculate partial credit
                if (question.isMultipleChoice()) {
                    int correctCount = 0;
                    int incorrectCount = 0;
                    
                    for (String answer : userAnswers) {
                        if (correctAnswerSet.contains(answer)) {
                            correctCount++;
                        } else {
                            incorrectCount++;
                        }
                    }
                    
                    // Calculate partial score
                    if (correctCount > 0) {
                        BigDecimal correctRatio = BigDecimal.valueOf(correctCount)
                            .divide(BigDecimal.valueOf(correctAnswerSet.size()), 2, RoundingMode.HALF_UP);
                        
                        // Optional: Apply penalty for incorrect answers
                        BigDecimal penalty = BigDecimal.valueOf(incorrectCount)
                            .divide(BigDecimal.valueOf(correctAnswerSet.size()), 2, RoundingMode.HALF_UP);
                        
                        BigDecimal partialScore = correctRatio.subtract(penalty);
                        if (partialScore.compareTo(BigDecimal.ZERO) > 0) {
                            totalScore = totalScore.add(questionPoints.multiply(partialScore));
                        }
                    }
                } else {
                    // For single choice questions with multiple answers submitted (shouldn't happen in UI)
                    // Just check if any of the submitted answers are correct
                    for (String answer : userAnswers) {
                        if (correctAnswerSet.contains(answer)) {
                            totalScore = totalScore.add(questionPoints);
                            break;
                        }
                    }
                }
            }
        }
        
        // Calculate percentage
        BigDecimal percentage = BigDecimal.ZERO;
        if (maxPossibleScore.compareTo(BigDecimal.ZERO) > 0) {
            percentage = totalScore.multiply(BigDecimal.valueOf(100))
                .divide(maxPossibleScore, 2, RoundingMode.HALF_UP);
        }
        
        Map<String, BigDecimal> result = new HashMap<>();
        result.put("score", totalScore);
        result.put("maxScore", maxPossibleScore);
        result.put("percentage", percentage);
        
        return result;
    }
} 