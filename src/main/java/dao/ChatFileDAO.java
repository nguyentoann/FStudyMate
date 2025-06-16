package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import model.ChatFile;
import util.FileStorageService;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

/**
 * Data Access Object for handling chat file operations
 */
@Repository
public class ChatFileDAO {
    
    /**
     * Saves file information to the database
     * 
     * @param file The chat file to save
     * @return The ID of the saved file or -1 if failed
     */
    public int saveFile(ChatFile file) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet generatedKeys = null;
        int fileId = -1;
        
        try {
            String query = "INSERT INTO chat_files (file_name, file_path, file_size, file_type, uploader_id) " +
                           "VALUES (?, ?, ?, ?, ?)";
                           
            ps = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, file.getFileName());
            ps.setString(2, file.getFilePath());
            ps.setLong(3, file.getFileSize());
            ps.setString(4, file.getFileType());
            ps.setInt(5, file.getUploaderId());
            
            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                generatedKeys = ps.getGeneratedKeys();
                if (generatedKeys.next()) {
                    fileId = generatedKeys.getInt(1);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error saving file record: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(generatedKeys);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return fileId;
    }
    
    /**
     * Links a file to a chat message
     * 
     * @param messageId The message ID
     * @param fileId The file ID
     * @param messageType Type of message (direct or group)
     * @return true if successful
     */
    public boolean linkFileToMessage(int messageId, int fileId, String messageType) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            String query = "INSERT INTO chat_message_files (message_id, file_id, message_type) VALUES (?, ?, ?)";
            ps = connection.prepareStatement(query);
            ps.setInt(1, messageId);
            ps.setInt(2, fileId);
            ps.setString(3, messageType);
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error linking file to message: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Gets files attached to a specific message
     * 
     * @param messageId The message ID
     * @param messageType Type of message (direct or group)
     * @return List of file information
     */
    public List<Map<String, Object>> getMessageFiles(int messageId, String messageType) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> files = new ArrayList<>();
        
        try {
            String query = "SELECT f.* FROM chat_files f " +
                           "JOIN chat_message_files mf ON f.id = mf.file_id " +
                           "WHERE mf.message_id = ? AND mf.message_type = ? AND f.is_deleted = 0";
            ps = connection.prepareStatement(query);
            ps.setInt(1, messageId);
            ps.setString(2, messageType);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> file = new HashMap<>();
                file.put("id", rs.getInt("id"));
                file.put("fileName", rs.getString("file_name"));
                file.put("filePath", rs.getString("file_path"));
                file.put("fileSize", rs.getLong("file_size"));
                file.put("fileType", rs.getString("file_type"));
                file.put("uploadDate", rs.getTimestamp("upload_date"));
                file.put("uploaderId", rs.getInt("uploader_id"));
                
                // Determine if file is viewable
                String fileType = rs.getString("file_type").toLowerCase();
                boolean isViewable = fileType.startsWith("image/") || 
                                     fileType.startsWith("video/") || 
                                     fileType.startsWith("audio/") ||
                                     fileType.equals("application/pdf");
                file.put("isViewable", isViewable);
                
                // Get file category
                String category = "File";
                if (fileType.startsWith("image/")) category = "Image";
                else if (fileType.startsWith("video/")) category = "Video";
                else if (fileType.startsWith("audio/")) category = "Audio";
                else if (fileType.equals("application/pdf")) category = "PDF";
                else if (fileType.contains("spreadsheet") || fileType.contains("excel")) category = "Spreadsheet";
                else if (fileType.contains("document") || fileType.contains("word")) category = "Document";
                else if (fileType.contains("zip") || fileType.contains("compressed")) category = "Archive";
                
                file.put("category", category);
                files.add(file);
            }
            
        } catch (SQLException e) {
            System.err.println("Error retrieving message files: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return files;
    }
    
    /**
     * Gets a file by its ID
     * 
     * @param fileId The file ID
     * @return File information or null if not found
     */
    public ChatFile getFileById(int fileId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        ChatFile file = null;
        
        try {
            String query = "SELECT * FROM chat_files WHERE id = ? AND is_deleted = 0";
            ps = connection.prepareStatement(query);
            ps.setInt(1, fileId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                file = new ChatFile();
                file.setId(rs.getInt("id"));
                file.setFileName(rs.getString("file_name"));
                file.setFilePath(rs.getString("file_path"));
                file.setFileSize(rs.getLong("file_size"));
                file.setFileType(rs.getString("file_type"));
                file.setUploadDate(rs.getTimestamp("upload_date"));
                file.setUploaderId(rs.getInt("uploader_id"));
                file.setDeleted(rs.getBoolean("is_deleted"));
            }
            
        } catch (SQLException e) {
            System.err.println("Error retrieving file: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return file;
    }
    
    /**
     * Logically deletes a file (marks it as deleted)
     * 
     * @param fileId The file ID
     * @param userId The user requesting deletion (for verification)
     * @return true if successful
     */
    public boolean softDeleteFile(int fileId, int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // First check if the user has permission to delete this file
            String checkQuery = "SELECT uploader_id FROM chat_files WHERE id = ?";
            ps = connection.prepareStatement(checkQuery);
            ps.setInt(1, fileId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                int uploaderId = rs.getInt("uploader_id");
                
                // Allow deletion only by the uploader
                if (uploaderId == userId) {
                    // Close the first statement
                    DBUtils.closeResultSet(rs);
                    DBUtils.closePreparedStatement(ps);
                    
                    // Prepare the update query
                    String updateQuery = "UPDATE chat_files SET is_deleted = 1 WHERE id = ?";
                    ps = connection.prepareStatement(updateQuery);
                    ps.setInt(1, fileId);
                    
                    int rowsAffected = ps.executeUpdate();
                    success = rowsAffected > 0;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error soft-deleting file: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Physically deletes a file from the storage and database
     * 
     * @param fileId The file ID
     * @param userId The user requesting deletion (for verification)
     * @return true if successful
     */
    public boolean hardDeleteFile(int fileId, int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // First get the file info to delete from storage
            String getQuery = "SELECT * FROM chat_files WHERE id = ? AND uploader_id = ?";
            ps = connection.prepareStatement(getQuery);
            ps.setInt(1, fileId);
            ps.setInt(2, userId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                String filePath = rs.getString("file_path");
                
                // Delete from storage
                boolean fileDeleted = FileStorageService.deleteFile(filePath);
                
                if (fileDeleted) {
                    // Close the first statement
                    DBUtils.closeResultSet(rs);
                    DBUtils.closePreparedStatement(ps);
                    
                    // Delete from database
                    String deleteQuery = "DELETE FROM chat_files WHERE id = ?";
                    ps = connection.prepareStatement(deleteQuery);
                    ps.setInt(1, fileId);
                    
                    int rowsAffected = ps.executeUpdate();
                    success = rowsAffected > 0;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error hard-deleting file: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Mark files as deleted when a message is deleted or unsent
     * 
     * @param messageId The message ID
     * @param messageType The message type
     * @return Number of files marked as deleted
     */
    public int markFilesDeletedByMessage(int messageId, String messageType) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        int filesDeleted = 0;
        
        try {
            String query = "UPDATE chat_files SET is_deleted = 1 " +
                           "WHERE id IN (SELECT file_id FROM chat_message_files WHERE message_id = ? AND message_type = ?)";
            ps = connection.prepareStatement(query);
            ps.setInt(1, messageId);
            ps.setString(2, messageType);
            
            filesDeleted = ps.executeUpdate();
            
        } catch (SQLException e) {
            System.err.println("Error marking files as deleted: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return filesDeleted;
    }
} 