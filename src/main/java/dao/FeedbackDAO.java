package dao;

import connection.ConnectDB;
import model.Feedback;
import model.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {
    private static FeedbackDAO instance;

    private FeedbackDAO() {
    }

    public static FeedbackDAO getInstance() {
        if (instance == null) {
            instance = new FeedbackDAO();
        }
        return instance;
    }

    /**
     * Add new feedback to the system
     *
     * @param userId User ID who submitted the feedback
     * @param rating Rating value (1-5)
     * @param comment Comment text
     * @return true if successful, false otherwise
     */
    public boolean addFeedback(int userId, int rating, String comment) {
        String sql = "INSERT INTO feedback (user_id, rating, comment, created_at, is_visible) VALUES (?, ?, ?, NOW(), true)";
        
        try (Connection conn = ConnectDB.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, userId);
            pstmt.setInt(2, rating);
            pstmt.setString(3, comment);
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get all visible feedback entries
     *
     * @return List of visible feedback
     */
    public List<Feedback> getAllVisibleFeedback() {
        List<Feedback> feedbackList = new ArrayList<>();
        String sql = "SELECT f.*, u.username FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.is_visible = true ORDER BY f.created_at DESC";
        
        try (Connection conn = ConnectDB.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Feedback feedback = extractFeedbackFromResultSet(rs);
                feedbackList.add(feedback);
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return feedbackList;
    }

    /**
     * Get all feedback entries (for admin)
     *
     * @return List of all feedback
     */
    public List<Feedback> getAllFeedback() {
        List<Feedback> feedbackList = new ArrayList<>();
        String sql = "SELECT f.*, u.username FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC";
        
        try (Connection conn = ConnectDB.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Feedback feedback = extractFeedbackFromResultSet(rs);
                feedbackList.add(feedback);
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return feedbackList;
    }

    /**
     * Toggle visibility of feedback
     *
     * @param feedbackId The ID of the feedback
     * @param isVisible New visibility status
     * @return true if successful, false otherwise
     */
    public boolean toggleFeedbackVisibility(int feedbackId, boolean isVisible) {
        String sql = "UPDATE feedback SET is_visible = ? WHERE id = ?";
        
        try (Connection conn = ConnectDB.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setBoolean(1, isVisible);
            pstmt.setInt(2, feedbackId);
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get a user's feedback
     *
     * @param userId The user ID
     * @return List of feedback by the user
     */
    public List<Feedback> getUserFeedback(int userId) {
        List<Feedback> feedbackList = new ArrayList<>();
        String sql = "SELECT f.*, u.username FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.user_id = ? ORDER BY f.created_at DESC";
        
        try (Connection conn = ConnectDB.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, userId);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Feedback feedback = extractFeedbackFromResultSet(rs);
                    feedbackList.add(feedback);
                }
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return feedbackList;
    }

    /**
     * Calculate average rating from all visible feedback
     *
     * @return Average rating or 0 if no ratings
     */
    public double getAverageRating() {
        String sql = "SELECT AVG(rating) as avg_rating FROM feedback WHERE is_visible = true";
        
        try (Connection conn = ConnectDB.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            if (rs.next()) {
                return rs.getDouble("avg_rating");
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return 0.0;
    }

    /**
     * Delete a feedback entry
     *
     * @param feedbackId The feedback ID
     * @return true if successful, false otherwise
     */
    public boolean deleteFeedback(int feedbackId) {
        String sql = "DELETE FROM feedback WHERE id = ?";
        
        try (Connection conn = ConnectDB.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, feedbackId);
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Extract feedback object from result set
     */
    private Feedback extractFeedbackFromResultSet(ResultSet rs) throws SQLException {
        Feedback feedback = new Feedback();
        feedback.setId(rs.getInt("id"));
        feedback.setUserId(rs.getInt("user_id"));
        feedback.setUserName(rs.getString("username"));
        feedback.setRating(rs.getInt("rating"));
        feedback.setComment(rs.getString("comment"));
        feedback.setCreatedAt(rs.getTimestamp("created_at"));
        feedback.setVisible(rs.getBoolean("is_visible"));
        return feedback;
    }
} 