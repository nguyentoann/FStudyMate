/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import model.Question;
import model.Quiz;
import java.sql.Statement;

/**
 *
 * @author todin
 */
public class QuestionDAO {

    // Get questions for a given MaMon and MaDe (for backward compatibility)
    public static List<Question> getQuestionsByMaMonMaDe(String maMon, String maDe) {
        List<Question> questions = new ArrayList<>();
        
        // First find the quiz ID for the given MaMon and MaDe
        Quiz quiz = getQuizByMaMonMaDe(maMon, maDe);
        
        if (quiz != null) {
            System.out.println("Found quiz with ID: " + quiz.getId() + " for MaMon: " + maMon + " and MaDe: " + maDe);
            // Use the quiz ID to get questions
            return getQuestionsByQuizId(quiz.getId());
        } else {
            System.out.println("No quiz found for MaMon: " + maMon + " and MaDe: " + maDe + ", using legacy approach");
        }

        // If no quiz found or no questions found, query directly with MaMon and MaDe
        // for backward compatibility with old schema
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            // Only get Questions that aren't assigned to a quiz (quiz_id IS NULL)
            // to avoid duplicate questions that are now managed through the Quizzes table
            String sqlString = "SELECT * FROM Questions WHERE MaMon = ? AND MaDe = ? AND quiz_id IS NULL";
            ps = connection.prepareStatement(sqlString);
            ps.setString(1, maMon);  // Set MaMon parameter
            ps.setString(2, maDe);    // Set MaDe parameter
            rs = ps.executeQuery();

            while (rs.next()) {
                int id = rs.getInt("ID");
                String questionImg = rs.getString("QuestionImg");
                String questionText = rs.getString("QuestionText");
                int slDapAn = rs.getInt("SLDapAn");
                String correct = rs.getString("Correct");
                String explanation = rs.getString("Explanation");

                Question question = new Question(id, maMon, maDe, questionImg, questionText, slDapAn, correct, explanation);
                questions.add(question);
            }
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }

        return questions;
    }
    
    // Get questions by quiz ID (new method)
    public static List<Question> getQuestionsByQuizId(int quizId) {
        List<Question> questions = new ArrayList<>();

        // Get quiz info first to retrieve MaMon and MaDe
        Quiz quiz = QuizDAO.getQuizById(quizId);
        if (quiz == null) {
            return questions;
        }
        
        // Get the questions
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            String sqlString = "SELECT * FROM Questions WHERE quiz_id = ?";
            ps = connection.prepareStatement(sqlString);
            ps.setInt(1, quizId);
            rs = ps.executeQuery();

            while (rs.next()) {
                int id = rs.getInt("ID");
                String questionImg = rs.getString("QuestionImg");
                String questionText = rs.getString("QuestionText");
                int slDapAn = rs.getInt("SLDapAn");
                String correct = rs.getString("Correct");
                String explanation = rs.getString("Explanation");

                // Always use quiz.getMaMon() and quiz.getMaDe() when handling quiz-linked questions
                // regardless of whether Questions table has these values or NULL
                Question question = new Question(id, quiz.getMaMon(), quiz.getMaDe(), questionImg, questionText, slDapAn, correct, explanation);
                questions.add(question);
            }
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }

        return questions;
    }
    
    // Helper method to get quiz by MaMon and MaDe
    private static Quiz getQuizByMaMonMaDe(String maMon, String maDe) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        Quiz quiz = null;
        
        try {
            String sql = "SELECT * FROM Quizzes WHERE MaMon = ? AND MaDe = ?";
            ps = connection.prepareStatement(sql);
            ps.setString(1, maMon);
            ps.setString(2, maDe);
            
            System.out.println("Executing query to find quiz with MaMon: " + maMon + " and MaDe: " + maDe);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                quiz = new Quiz(
                    rs.getInt("id"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getInt("user_id"),
                    rs.getString("MaMon"),
                    rs.getString("MaDe"),
                    rs.getBoolean("is_ai_generated"),
                    rs.getTimestamp("created_at"),
                    rs.getTimestamp("updated_at"),
                    rs.getString("password"),
                    rs.getObject("time_limit") != null ? rs.getInt("time_limit") : null,
                    rs.getInt("security_level")
                );
                System.out.println("Successfully found quiz with id: " + quiz.getId());
            } else {
                System.out.println("No quiz found with MaMon: " + maMon + " and MaDe: " + maDe);
            }
        } catch (SQLException e) {
            System.out.println("Error getting quiz by MaMon and MaDe: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return quiz;
    }

    public static List<String> getMaMon() {
        List<String> maMonList = new ArrayList<>();

        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        // First, check table structure to get the correct column case
        try {
            // Print table structure for debugging
            String descSql = "DESCRIBE Quizzes";
            ps = connection.prepareStatement(descSql);
            rs = ps.executeQuery();
            
            System.out.println("Quizzes table structure:");
            while (rs.next()) {
                System.out.println("Column: " + rs.getString("Field") + ", Type: " + rs.getString("Type"));
            }
            
            // Close the previous statement and resultset
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            
            // Now get the MaMon values using JPA-style entity naming
            // Use table alias to avoid case sensitivity issues
            String sqlString = "SELECT DISTINCT q.MaMon FROM Quizzes q " +
                               "UNION " +
                               "SELECT DISTINCT q.MaMon FROM Questions q WHERE q.quiz_id IS NULL AND q.MaMon IS NOT NULL";
            ps = connection.prepareStatement(sqlString);
            rs = ps.executeQuery();

            while (rs.next()) {
                String maMon = rs.getString(1); // Use column index instead of name
                if (maMon != null && !maMon.isEmpty()) {
                    maMonList.add(maMon);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting MaMon values: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback to entity-specific queries if the union fails
            try {
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
                
                // Try querying each table separately
                String sql1 = "SELECT DISTINCT MaMon FROM Questions WHERE MaMon IS NOT NULL";
                ps = connection.prepareStatement(sql1);
                rs = ps.executeQuery();
                
                while (rs.next()) {
                    String maMon = rs.getString(1); 
                    if (maMon != null && !maMon.isEmpty()) {
                        maMonList.add(maMon);
                    }
                }
                
                // Then try Quizzes table separately
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
                
                String sql2 = "SELECT DISTINCT MaMon FROM Quizzes";
                ps = connection.prepareStatement(sql2);
                rs = ps.executeQuery();
                
                while (rs.next()) {
                    String maMon = rs.getString(1);
                    if (maMon != null && !maMon.isEmpty() && !maMonList.contains(maMon)) {
                        maMonList.add(maMon);
                    }
                }
            } catch (SQLException e2) {
                System.out.println("Fallback error: " + e2.getMessage());
                e2.printStackTrace();
            }
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }

        return maMonList;
    }

    public static List<String> getMaDeByMaMon(String maMon) {
        // Add overloaded method that doesn't require userId for backward compatibility
        return getMaDeByMaMon(maMon, 0);
    }

    public static List<String> getMaDeByMaMon(String maMon, int userId) {
        List<String> maDeList = new ArrayList<>();

        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            // First get student's class ID if user is a student
            String classId = null;
            String userRole = null;
            
            if (userId > 0) {
                // Get user role and class ID
                String userQuery = "SELECT u.role, s.class_id FROM users u LEFT JOIN students s ON u.id = s.user_id WHERE u.id = ?";
                PreparedStatement userPs = connection.prepareStatement(userQuery);
                userPs.setInt(1, userId);
                ResultSet userRs = userPs.executeQuery();
                if (userRs.next()) {
                    userRole = userRs.getString("role");
                    classId = userRs.getString("class_id");
                }
                DBUtils.closeResultSet(userRs);
                DBUtils.closePreparedStatement(userPs);
            }
            
            // Different query based on user role
            String sql;
            if (userId == 0 || userRole == null || userRole.equals("Admin") || userRole.equals("Lecturer")) {
                // Admins and lecturers see all quizzes
                sql = "SELECT DISTINCT MaDe FROM (SELECT MaDe FROM Quizzes WHERE MaMon = ? UNION SELECT MaDe FROM Questions WHERE MaMon = ?) AS combined";
                ps = connection.prepareStatement(sql);
                ps.setString(1, maMon);
                ps.setString(2, maMon);
            } else {
                // Students only see quizzes they have permission for
                // Modified query to handle empty QuizPermissions table using LEFT JOIN
                sql = "SELECT DISTINCT q.MaDe FROM Quizzes q " +
                      "LEFT JOIN QuizPermissions qp ON q.id = qp.quiz_id " +
                      "WHERE q.MaMon = ? AND (qp.class_id = ? OR qp.class_id IS NULL OR q.id NOT IN (SELECT DISTINCT quiz_id FROM QuizPermissions)) " +
                      "UNION " +
                      "SELECT DISTINCT MaDe FROM Questions WHERE MaMon = ? AND quiz_id IS NULL";
                ps = connection.prepareStatement(sql);
                ps.setString(1, maMon);
                ps.setString(2, classId);
                ps.setString(3, maMon);
            }
            
            rs = ps.executeQuery();

            while (rs.next()) {
                String maDe = rs.getString("MaDe");
                if (maDe != null && !maDe.isEmpty()) {
                    maDeList.add(maDe);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }

        return maDeList;
    }
    
    // Update a question to associate it with a quiz
    public static boolean updateQuestionQuizId(int questionId, int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "UPDATE Questions SET quiz_id = ? WHERE ID = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
            ps.setInt(2, questionId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.out.println("Error updating question quiz ID: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
    
    // Bulk update questions to associate with a quiz
    public static int updateQuestionsForQuiz(String maMon, String maDe, int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "UPDATE Questions SET quiz_id = ? WHERE MaMon = ? AND MaDe = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
            ps.setString(2, maMon);
            ps.setString(3, maDe);
            
            return ps.executeUpdate();
            
        } catch (SQLException e) {
            System.out.println("Error updating questions for quiz: " + e.getMessage());
            e.printStackTrace();
            return 0;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }

    // Create a new question associated with a quiz
    public static int createQuestion(Question question, int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int questionId = -1;
        
        try {
            String sql = "INSERT INTO Questions (QuestionImg, QuestionText, SLDapAn, Correct, Explanation, quiz_id) " +
                        "VALUES (?, ?, ?, ?, ?, ?)";
                        
            ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, question.getQuestionImg());
            ps.setString(2, question.getQuestionText());
            ps.setInt(3, question.getSLDapAn());
            ps.setString(4, question.getCorrect());
            ps.setString(5, question.getExplanation());
            ps.setInt(6, quizId);
            
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    questionId = rs.getInt(1);
                    // Set the ID of the question object
                    question.setId(questionId);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error creating question: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return questionId;
    }
    
    // Create multiple questions at once for a quiz
    public static List<Integer> createQuestions(List<Question> questions, int quizId) {
        List<Integer> questionIds = new ArrayList<>();
        
        for (Question question : questions) {
            int questionId = createQuestion(question, quizId);
            if (questionId > 0) {
                questionIds.add(questionId);
            }
        }
        
        return questionIds;
    }
    
    // Delete a question
    public static boolean deleteQuestion(int questionId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "DELETE FROM Questions WHERE ID = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, questionId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.out.println("Error deleting question: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
    
    // Update a question
    public static boolean updateQuestion(Question question) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "UPDATE Questions SET QuestionImg = ?, QuestionText = ?, SLDapAn = ?, " +
                        "Correct = ?, Explanation = ? WHERE ID = ?";
            
            ps = connection.prepareStatement(sql);
            ps.setString(1, question.getQuestionImg());
            ps.setString(2, question.getQuestionText());
            ps.setInt(3, question.getSLDapAn());
            ps.setString(4, question.getCorrect());
            ps.setString(5, question.getExplanation());
            ps.setInt(6, question.getId());
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.out.println("Error updating question: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
}
