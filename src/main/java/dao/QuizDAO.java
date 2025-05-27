package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import model.Quiz;
import model.Question;
import model.QuizPermission;

public class QuizDAO {
    
    // Create a new quiz
    public static int createQuiz(Quiz quiz) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int quizId = -1;
        
        try {
            String sql = "INSERT INTO Quizzes (title, description, user_id, MaMon, MaDe, is_ai_generated, " +
                          "password, time_limit, security_level) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, quiz.getTitle());
            ps.setString(2, quiz.getDescription());
            ps.setInt(3, quiz.getUserId());
            ps.setString(4, quiz.getMaMon());
            ps.setString(5, quiz.getMaDe());
            ps.setBoolean(6, quiz.isIsAiGenerated());
            ps.setString(7, quiz.getPassword());
            
            if (quiz.getTimeLimit() != null) {
                ps.setInt(8, quiz.getTimeLimit());
            } else {
                ps.setNull(8, java.sql.Types.INTEGER);
            }
            
            ps.setInt(9, quiz.getSecurityLevel());
            
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    quizId = rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error creating quiz: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return quizId;
    }
    
    // Update an existing quiz
    public static boolean updateQuiz(Quiz quiz) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "UPDATE Quizzes SET title = ?, description = ?, MaMon = ?, MaDe = ?, " +
                         "is_ai_generated = ?, password = ?, time_limit = ?, security_level = ?, " +
                         "updated_at = CURRENT_TIMESTAMP " +
                         "WHERE id = ?";
            
            ps = connection.prepareStatement(sql);
            ps.setString(1, quiz.getTitle());
            ps.setString(2, quiz.getDescription());
            ps.setString(3, quiz.getMaMon());
            ps.setString(4, quiz.getMaDe());
            ps.setBoolean(5, quiz.isIsAiGenerated());
            ps.setString(6, quiz.getPassword());
            
            if (quiz.getTimeLimit() != null) {
                ps.setInt(7, quiz.getTimeLimit());
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            
            ps.setInt(8, quiz.getSecurityLevel());
            ps.setInt(9, quiz.getId());
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.out.println("Error updating quiz: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
    
    // Delete a quiz
    public static boolean deleteQuiz(int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            // Delete from Quizzes table (will cascade delete permissions)
            String sql = "DELETE FROM Quizzes WHERE id = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.out.println("Error deleting quiz: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
    
    // Get quiz by ID
    public static Quiz getQuizById(int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        Quiz quiz = null;
        
        try {
            String sql = "SELECT * FROM Quizzes WHERE id = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
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
            }
        } catch (SQLException e) {
            System.out.println("Error getting quiz: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return quiz;
    }
    
    // Get quizzes by user ID
    public static List<Quiz> getQuizzesByUserId(int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Quiz> quizzes = new ArrayList<>();
        
        try {
            String sql = "SELECT * FROM Quizzes WHERE user_id = ? ORDER BY created_at DESC";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Quiz quiz = new Quiz(
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
                quizzes.add(quiz);
            }
        } catch (SQLException e) {
            System.out.println("Error getting quizzes: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return quizzes;
    }
    
    // Get all quizzes accessible by a student (based on class)
    public static List<Quiz> getQuizzesByClassId(String classId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Quiz> quizzes = new ArrayList<>();
        
        try {
            String sql = "SELECT q.* FROM Quizzes q " +
                         "INNER JOIN QuizPermissions qp ON q.id = qp.quiz_id " +
                         "WHERE qp.class_id = ? " +
                         "ORDER BY q.created_at DESC";
            
            ps = connection.prepareStatement(sql);
            ps.setString(1, classId);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Quiz quiz = new Quiz(
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
                quizzes.add(quiz);
            }
        } catch (SQLException e) {
            System.out.println("Error getting quizzes: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return quizzes;
    }
    
    // Add class permission to quiz
    public static boolean addQuizPermission(QuizPermission permission) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "INSERT INTO QuizPermissions (quiz_id, class_id) VALUES (?, ?)";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, permission.getQuizId());
            ps.setString(2, permission.getClassId());
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.out.println("Error adding quiz permission: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
    
    // Remove class permission from quiz
    public static boolean removeQuizPermission(int permissionId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            String sql = "DELETE FROM QuizPermissions WHERE id = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, permissionId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.out.println("Error removing quiz permission: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }
    
    // Get permissions for a quiz
    public static List<QuizPermission> getQuizPermissions(int quizId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<QuizPermission> permissions = new ArrayList<>();
        
        try {
            String sql = "SELECT * FROM QuizPermissions WHERE quiz_id = ?";
            ps = connection.prepareStatement(sql);
            ps.setInt(1, quizId);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                QuizPermission permission = new QuizPermission(
                    rs.getInt("id"),
                    rs.getInt("quiz_id"),
                    rs.getString("class_id")
                );
                permissions.add(permission);
            }
        } catch (SQLException e) {
            System.out.println("Error getting quiz permissions: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return permissions;
    }
} 