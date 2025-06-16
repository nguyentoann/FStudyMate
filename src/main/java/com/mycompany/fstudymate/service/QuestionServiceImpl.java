package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Question;
import com.mycompany.fstudymate.model.Lesson;
import com.mycompany.fstudymate.repository.QuestionRepository;
import com.mycompany.fstudymate.repository.LessonRepository;
import com.mycompany.fstudymate.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.logging.Logger;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;
import java.sql.Timestamp;

@Service
public class QuestionServiceImpl implements QuestionService {

    private static final Logger logger = Logger.getLogger(QuestionServiceImpl.class.getName());
    private final QuestionRepository questionRepository;
    private final LessonRepository lessonRepository;
    private final SubjectRepository subjectRepository;
    private final DataSource dataSource;

    @Autowired
    public QuestionServiceImpl(QuestionRepository questionRepository, 
                              LessonRepository lessonRepository, 
                              SubjectRepository subjectRepository,
                              DataSource dataSource) {
        this.questionRepository = questionRepository;
        this.lessonRepository = lessonRepository;
        this.subjectRepository = subjectRepository;
        this.dataSource = dataSource;
    }

    @Override
    public List<Question> getQuestionsByMaMonAndMaDe(String maMon, String maDe) {
        logger.info("Fetching questions for MaMon: " + maMon + ", MaDe: " + maDe);
        
        try {
            // Use new method that joins with Quizzes table
            List<Question> questions = questionRepository.findByMaMonAndMaDeIncludingQuizzes(maMon, maDe);
            logger.info("Found " + questions.size() + " questions using native SQL query with joins");
            
            // If questions list is still empty, try the direct JPA query as fallback
            if (questions.isEmpty()) {
                questions = questionRepository.findByMaMonAndMaDe(maMon, maDe);
                logger.info("Found " + questions.size() + " questions using JPA query fallback");
            }
            
            // Don't manually set MaMon and MaDe on questions - rely on the quiz relationship
            // These fields shouldn't be duplicated in both tables
            
            return questions;
        } catch (Exception e) {
            logger.severe("Error fetching questions: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(); // Return empty list on error
        }
    }

    private Question mapResultSetToQuestion(ResultSet rs) throws SQLException {
        Question q = new Question();
        q.setId(rs.getInt("ID"));
        q.setMaMon(rs.getString("MaMon"));
        q.setMaDe(rs.getString("MaDe"));
        q.setQuestionImg(rs.getString("QuestionImg"));
        q.setQuestionText(rs.getString("QuestionText"));
        q.setSlDapAn(rs.getInt("SLDapAn"));
        q.setCorrect(rs.getString("Correct"));
        q.setExplanation(rs.getString("Explanation"));
        return q;
    }

    @Override
    public List<String> getAllMaMon() {
        try {
            logger.info("Fetching all unique MaMon values from both tables");
            List<String> result = questionRepository.findDistinctMaMon();
            logger.info("Found " + result.size() + " unique MaMon values");
            return result;
        } catch (Exception e) {
            logger.severe("Error fetching MaMon values: " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing exception to prevent 500 errors
            return new ArrayList<>();
        }
    }

    @Override
    public List<String> getMaDeByMaMon(String maMon) {
        return questionRepository.findDistinctMaDeByMaMon(maMon);
    }
    
    @Override
    public List<String> getMaDeByMaMonWithPermissions(String maMon, String classId) {
        if (classId == null || classId.isEmpty()) {
            // If no class ID, return all MaDe (for admin/lecturer)
            return questionRepository.findDistinctMaDeByMaMon(maMon);
        } else {
            try {
                // Return only permitted MaDe for students
                return questionRepository.findDistinctMaDeByMaMonWithPermissions(maMon, classId);
            } catch (Exception e) {
                logger.severe("Error getting MaDe with permissions: " + e.getMessage());
                e.printStackTrace();
                
                // Fallback to getting all MaDe without permissions
                return questionRepository.findDistinctMaDeByMaMon(maMon);
            }
        }
    }
    
    @Override
    public Optional<Question> getQuestionById(Integer id) {
        return questionRepository.findById(id);
    }
    
    @Override
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    @Override
    public Optional<Lesson> getLessonById(Integer id) {
        return lessonRepository.findById(id);
    }
    
    @Override
    public String getSubjectNameById(Integer subjectId) {
        return subjectRepository.findNameById(subjectId);
    }
    
    @Override
    public List<Question> createQuestionsFromAIResponse(String aiResponse, String maMon, String maDe) {
        List<Question> questions = new ArrayList<>();
        
        logger.info("=== PROCESSING AI RESPONSE TO CREATE QUESTIONS ===");
        logger.info("Response length: " + aiResponse.length());
        logger.info("First 200 characters of response: " + aiResponse.substring(0, Math.min(200, aiResponse.length())));
        logger.info("Last 200 characters of response: " + aiResponse.substring(Math.max(0, aiResponse.length() - 200)));
        
        try {
            // Split the response into individual questions using the delimiters
            Pattern questionPattern = Pattern.compile("<question>(.*?)</question>", Pattern.DOTALL);
            Matcher questionMatcher = questionPattern.matcher(aiResponse);
            
            int questionCount = 0;
            logger.info("Looking for questions using delimiter pattern: <question>...</question>");
            
            while (questionMatcher.find() && questionCount < 20) {
                String questionBlock = questionMatcher.group(1).trim();
                logger.info("Found question " + (questionCount + 1) + " with delimiters. Length: " + questionBlock.length());
                logger.info("First 100 chars: " + questionBlock.substring(0, Math.min(100, questionBlock.length())));
                
                Question question = parseQuestionBlock(questionBlock, maMon, maDe);
                if (question != null) {
                    questions.add(questionRepository.save(question));
                    logger.info("Question " + (questionCount + 1) + " successfully parsed and saved with correct answer: " + question.getCorrect());
                    questionCount++;
                } else {
                    logger.warning("Failed to parse question " + (questionCount + 1));
                }
            }
            
            // Fallback to old method if no questions found with delimiters
            if (questions.isEmpty()) {
                logger.info("No questions found with delimiters, trying fallback method");
                // Split the response into individual questions
                String[] questionBlocks = aiResponse.split("(?<=\\n)(?=\\d+\\.|Question \\d+:)");
                
                logger.info("Fallback method found " + questionBlocks.length + " potential question blocks");
                
                for (int i = 0; i < questionBlocks.length; i++) {
                    String questionBlock = questionBlocks[i];
                    if (questionBlock.trim().isEmpty()) {
                        logger.info("Block " + (i + 1) + " is empty, skipping");
                        continue;
                    }
                    
                    logger.info("Processing block " + (i + 1) + " - length: " + questionBlock.length());
                    logger.info("First 100 chars: " + questionBlock.substring(0, Math.min(100, questionBlock.length())));
                    
                    Question question = parseQuestionBlock(questionBlock, maMon, maDe);
                    if (question != null) {
                        questions.add(questionRepository.save(question));
                        logger.info("Block " + (i + 1) + " successfully parsed as question " + (questionCount + 1) 
                                + " with correct answer: " + question.getCorrect());
                        questionCount++;
                        
                        if (questionCount >= 20) {
                            logger.info("Reached maximum of 20 questions, stopping");
                            break;
                        }
                    } else {
                        logger.warning("Failed to parse block " + (i + 1) + " as a question");
                    }
                }
            }
            
            logger.info("=== QUESTION CREATION COMPLETE ===");
            logger.info("Successfully created " + questions.size() + " questions");
            
        } catch (Exception e) {
            logger.severe("Error processing AI response: " + e.getMessage());
            e.printStackTrace();
        }
        
        return questions;
    }
    
    private Question parseQuestionBlock(String questionBlock, String maMon, String maDe) {
        try {
            // Extract the question text
            String questionText = questionBlock.trim();
            
            logger.info("=== PARSING QUESTION BLOCK ===");
            logger.info("Block length: " + questionText.length());
            
            // Create a new question
            Question question = new Question();
            // We've received maMon and maDe but we don't set them on the question entity
            // They should only be stored in the Quizzes table
            
            // Extract the correct answer - now supporting multiple choice format (A,B) or (A;B)
            Pattern correctAnswerPattern = Pattern.compile("(?:Correct answer:|correct answer:|Answer:|answer:)\\s*([A-D](?:[,;\\s]*[A-D])*)", Pattern.CASE_INSENSITIVE);
            Matcher correctAnswerMatcher = correctAnswerPattern.matcher(questionText);
            String correctAnswer = "A"; // Default
            if (correctAnswerMatcher.find()) {
                correctAnswer = correctAnswerMatcher.group(1).toUpperCase().replaceAll("\\s+", "");
                logger.info("Found correct answer(s): " + correctAnswer);
            } else {
                logger.warning("Could not find correct answer, defaulting to A");
            }
            question.setCorrect(correctAnswer);
            
            // Extract explanation if available
            Pattern explanationPattern = Pattern.compile("(?:Explanation:|explanation:)(.+?)(?=\\n\\d+\\.|$)", Pattern.DOTALL);
            Matcher explanationMatcher = explanationPattern.matcher(questionText);
            if (explanationMatcher.find()) {
                String explanation = explanationMatcher.group(1).trim();
                question.setExplanation(explanation);
                logger.info("Found explanation: " + explanation.substring(0, Math.min(50, explanation.length())) + "...");
            } else {
                question.setExplanation("AI-generated question");
                logger.warning("Could not find explanation");
            }
            
            // Remove the "Correct Answer" and "Explanation" sections from the displayed text
            String cleanedText = questionText;
            
            // Remove the "Correct Answer" section
            Pattern answerSectionPattern = Pattern.compile("(?:Correct answer:|correct answer:|Answer:|answer:).*?(?=Explanation:|explanation:|$)", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
            Matcher answerSectionMatcher = answerSectionPattern.matcher(cleanedText);
            if (answerSectionMatcher.find()) {
                cleanedText = cleanedText.substring(0, answerSectionMatcher.start()).trim();
            }
            
            // Remove the "Explanation" section if it's still there
            Pattern explanationSectionPattern = Pattern.compile("(?:Explanation:|explanation:).*$", Pattern.DOTALL);
            Matcher explanationSectionMatcher = explanationSectionPattern.matcher(cleanedText);
            if (explanationSectionMatcher.find()) {
                cleanedText = cleanedText.substring(0, explanationSectionMatcher.start()).trim();
            }
            
            // Remove any square brackets from the question text (often used in the format template)
            cleanedText = cleanedText.replaceAll("\\[([^\\]]+)\\]", "$1");
            
            // Don't add HTML div tags - let the frontend handle the formatting
            // This prevents HTML tags from showing as text
            question.setQuestionText(cleanedText);
            
            logger.info("Original text has " + (questionText.split("\n").length - 1) + " newlines");
            logger.info("Cleaned question text has " + (cleanedText.split("\n").length - 1) + " newlines");
            logger.info("Final question text sample: " + cleanedText.substring(0, Math.min(100, cleanedText.length())));
            
            question.setQuestionImg(null); // No image for AI-generated questions
            question.setSlDapAn(4); // 4 options (A, B, C, D)
            
            // Check for options
            Pattern optionsPattern = Pattern.compile("[A-D]\\)(.+?)(?=[A-D]\\)|Correct|$)", Pattern.DOTALL);
            Matcher optionsMatcher = optionsPattern.matcher(questionText);
            int optionsFound = 0;
            while (optionsMatcher.find()) {
                optionsFound++;
            }
            logger.info("Found " + optionsFound + " options in the question");
            
            return question;
        } catch (Exception e) {
            logger.severe("Error parsing question block: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> createAIQuiz(String title, String maMon, String maDe, 
                                           String description, Integer userId, String classId) {
        logger.info("Creating AI-generated quiz - Title: " + title + ", MaMon: " + maMon + 
                    ", MaDe: " + maDe + ", Description: " + description + ", UserId: " + userId);
                
        try {
            // Default class ID to "0" if not provided, meaning only creator can access it
            String effectiveClassId = (classId != null && !classId.trim().isEmpty()) ? classId.trim() : "0";
            
            // Use JDBC directly for better control over SQL operations
            Connection conn = dataSource.getConnection();
            try {
                // First verify that the user exists to avoid foreign key constraint violation
                PreparedStatement checkUserStmt = conn.prepareStatement(
                    "SELECT COUNT(*) FROM users WHERE id = ?"
                );
                checkUserStmt.setInt(1, userId);
                ResultSet userResult = checkUserStmt.executeQuery();
                
                if (!userResult.next() || userResult.getInt(1) == 0) {
                    logger.warning("User with ID " + userId + " does not exist. Cannot create quiz.");
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("error", "User with ID " + userId + " does not exist");
                    return response;
                }
                
                checkUserStmt.close();
                
                // Insert the quiz record
                PreparedStatement insertQuizStmt = conn.prepareStatement(
                    "INSERT INTO Quizzes (title, MaMon, MaDe, description, user_id, is_ai_generated, security_level) " +
                    "VALUES (?, ?, ?, ?, ?, 1, 0)",
                    PreparedStatement.RETURN_GENERATED_KEYS
                );
                insertQuizStmt.setString(1, title);
                insertQuizStmt.setString(2, maMon);
                insertQuizStmt.setString(3, maDe);
                insertQuizStmt.setString(4, description);
                insertQuizStmt.setInt(5, userId);
                
                int rowsAffected = insertQuizStmt.executeUpdate();
                logger.info("Quiz insert affected " + rowsAffected + " rows");
                
                // Get the auto-generated ID
                ResultSet generatedKeys = insertQuizStmt.getGeneratedKeys();
                Integer quizId = null;
                if (generatedKeys.next()) {
                    quizId = generatedKeys.getInt(1);
                    logger.info("Created quiz with ID: " + quizId);
                } else {
                    logger.warning("Failed to retrieve generated quiz ID");
                    throw new SQLException("Failed to retrieve generated quiz ID");
                }
                insertQuizStmt.close();
                
                // Add permission
                PreparedStatement insertPermissionStmt = conn.prepareStatement(
                    "INSERT INTO QuizPermissions (quiz_id, class_id) VALUES (?, ?)"
                );
                insertPermissionStmt.setInt(1, quizId);
                insertPermissionStmt.setString(2, effectiveClassId);
                
                rowsAffected = insertPermissionStmt.executeUpdate();
                logger.info("Permission insert affected " + rowsAffected + " rows");
                insertPermissionStmt.close();
                
                // Return success response
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("quizId", quizId);
                response.put("message", "Quiz created successfully");
                return response;
            } finally {
                conn.close();
            }
        } catch (Exception e) {
            logger.severe("Error creating AI quiz: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return response;
        }
    }
    
    @Override
    public List<Question> getAIGeneratedQuizzesByUserId(Integer userId) {
        logger.info("Getting AI-generated quizzes for user ID: " + userId);
        try {
            List<Question> questions = questionRepository.findAIGeneratedQuestionsByUserId(userId);
            logger.info("Found " + questions.size() + " questions from AI-generated quizzes");
            return questions;
        } catch (Exception e) {
            logger.severe("Error getting AI-generated quizzes: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    @Override
    @Transactional
    public void setQuizIdForQuestions(List<Integer> questionIds, Integer quizId) {
        logger.info("Updating " + questionIds.size() + " questions to set quiz_id: " + quizId);
        
        if (questionIds.isEmpty() || quizId == null) {
            logger.warning("No questions to update or invalid quiz ID");
            return;
        }
        
        try (Connection conn = dataSource.getConnection()) {
            // Use batch processing for better performance
            PreparedStatement stmt = conn.prepareStatement(
                "UPDATE Questions SET quiz_id = ? WHERE ID = ?"
            );
            
            conn.setAutoCommit(false); // Start batch transaction
            
            for (Integer questionId : questionIds) {
                stmt.setInt(1, quizId);
                stmt.setInt(2, questionId);
                stmt.addBatch();
                
                logger.fine("Added batch update for question ID " + questionId + " with quiz_id " + quizId);
            }
            
            int[] updateCounts = stmt.executeBatch();
            conn.commit(); // Commit all updates
            
            int totalUpdated = 0;
            for (int count : updateCounts) {
                if (count > 0) totalUpdated += count;
            }
            
            logger.info("Successfully updated " + totalUpdated + " questions with quiz_id " + quizId);
            stmt.close();
        } catch (SQLException e) {
            logger.severe("Error updating questions with quiz_id: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update questions with quiz_id", e);
        }
    }

    @Override
    public Map<String, Object> getQuizMetadata(String maMon, String maDe) {
        logger.info("Getting quiz metadata for MaMon: " + maMon + ", MaDe: " + maDe);
        
        Map<String, Object> metadata = new HashMap<>();
        
        try {
            Connection conn = dataSource.getConnection();
            try {
                // Query the Quizzes table to get metadata
                // Use case-insensitive comparison for better matching
                String sql = "SELECT q.*, u.username, u.full_name " +
                           "FROM Quizzes q " +
                           "LEFT JOIN users u ON q.user_id = u.id " +
                           "WHERE LOWER(COALESCE(q.MaMon, q.mamon)) = LOWER(?) " +
                           "AND LOWER(COALESCE(q.MaDe, q.made)) = LOWER(?) " +
                           "LIMIT 1";
                
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, maMon);
                stmt.setString(2, maDe);
                
                logger.info("Executing query: " + sql + " with parameters: " + maMon + ", " + maDe);
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    logger.info("Found quiz metadata for MaMon: " + maMon + ", MaDe: " + maDe);
                    
                    // Include the quiz ID in the metadata
                    metadata.put("id", rs.getInt("id"));
                    
                    metadata.put("title", rs.getString("title"));
                    metadata.put("description", rs.getString("description"));
                    
                    String createdBy = "Unknown";
                    if (rs.getString("username") != null) {
                        createdBy = rs.getString("username");
                    } else if (rs.getString("full_name") != null) {
                        createdBy = rs.getString("full_name");
                    }
                    metadata.put("createdBy", createdBy);
                    
                    metadata.put("isAIGenerated", rs.getBoolean("is_ai_generated"));
                    metadata.put("createdAt", rs.getTimestamp("created_at"));
                    metadata.put("userId", rs.getInt("user_id"));
                    metadata.put("maMon", rs.getString("MaMon"));
                    metadata.put("maDe", rs.getString("MaDe"));
                    
                    Integer timeLimit = rs.getInt("time_limit");
                    if (!rs.wasNull()) {
                        metadata.put("timeLimit", timeLimit);
                    }
                } else {
                    // If no match in Quizzes table, return default values
                    logger.info("No quiz found with MaMon: " + maMon + ", MaDe: " + maDe);
                    metadata.put("title", maMon + " - " + maDe);
                    metadata.put("description", "No description available");
                    metadata.put("createdBy", "Unknown");
                    metadata.put("isAIGenerated", false);
                    metadata.put("maMon", maMon);
                    metadata.put("maDe", maDe);
                }
                
                stmt.close();
            } finally {
                conn.close();
            }
        } catch (Exception e) {
            logger.severe("Error getting quiz metadata: " + e.getMessage());
            e.printStackTrace();
            
            // Set default values on error
            metadata.put("title", maMon + " - " + maDe);
            metadata.put("description", "No description available");
            metadata.put("createdBy", "Unknown");
            metadata.put("isAIGenerated", false);
            metadata.put("maMon", maMon);
            metadata.put("maDe", maDe);
        }
        
        return metadata;
    }

    @Override
    public Map<String, Map<String, Object>> getQuizMetadataForSubject(String maMon) {
        logger.info("Getting metadata for all quizzes in subject: " + maMon);
        
        Map<String, Map<String, Object>> metadataMap = new HashMap<>();
        
        try {
            Connection conn = dataSource.getConnection();
            try {
                // Query the Quizzes table to get metadata for all exams in the subject
                // Use case-insensitive comparison for better matching and handle column name variations
                String sql = "SELECT q.*, u.username, u.full_name " +
                           "FROM Quizzes q " +
                           "LEFT JOIN users u ON q.user_id = u.id " +
                           "WHERE LOWER(COALESCE(q.MaMon, q.mamon, '')) = LOWER(?)";
                
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, maMon);
                
                logger.info("Executing query: " + sql + " with parameter: " + maMon);
                ResultSet rs = stmt.executeQuery();
                
                int count = 0;
                while (rs.next()) {
                    count++;
                    
                    // Get the MaDe from the result - try different case versions
                    String maDe = rs.getString("MaDe");
                    if (maDe == null) {
                        maDe = rs.getString("made");
                    }
                    if (maDe == null) {
                        maDe = rs.getString("maDe");
                    }
                    
                    // Skip if MaDe is null or empty
                    if (maDe != null && !maDe.trim().isEmpty()) {
                        Map<String, Object> metadata = new HashMap<>();
                        
                        // Include the quiz ID
                        metadata.put("id", rs.getInt("id"));
                        
                        metadata.put("title", rs.getString("title"));
                        metadata.put("description", rs.getString("description"));
                        
                        // Prepare creator information
                        String createdBy = "Unknown";
                        if (rs.getString("username") != null) {
                            createdBy = rs.getString("username");
                        } else if (rs.getString("full_name") != null) {
                            createdBy = rs.getString("full_name");
                        }
                        metadata.put("createdBy", createdBy);
                        
                        metadata.put("isAIGenerated", rs.getBoolean("is_ai_generated"));
                        metadata.put("createdAt", rs.getTimestamp("created_at"));
                        metadata.put("userId", rs.getInt("user_id"));
                        
                        Integer timeLimit = rs.getInt("time_limit");
                        if (!rs.wasNull()) {
                            metadata.put("timeLimit", timeLimit);
                        }
                        
                        metadataMap.put(maDe, metadata);
                        logger.info("Added metadata for exam code: " + maDe);
                    }
                }
                
                logger.info("Found " + count + " rows, processed " + metadataMap.size() + " valid exams with metadata");
                
                stmt.close();
            } finally {
                conn.close();
            }
        } catch (Exception e) {
            logger.severe("Error getting subject quiz metadata: " + e.getMessage());
            e.printStackTrace();
        }
        
        return metadataMap;
    }
} 