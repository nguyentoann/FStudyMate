package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

@Repository
public class ChatDAO {
    
    /**
     * Sends a message from one user to another
     * 
     * @param senderId The ID of the sending user
     * @param receiverId The ID of the receiving user
     * @param message The message content
     * @return The ID of the created message or -1 if failed
     */
    public int sendMessage(int senderId, int receiverId, String message) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet generatedKeys = null;
        int messageId = -1;
        
        try {
            String query = "INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
            ps = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, senderId);
            ps.setInt(2, receiverId);
            ps.setString(3, message);
            
            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                generatedKeys = ps.getGeneratedKeys();
                if (generatedKeys.next()) {
                    messageId = generatedKeys.getInt(1);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(generatedKeys);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return messageId;
    }
    
    /**
     * Retrieves messages exchanged between two users
     * 
     * @param user1Id First user's ID
     * @param user2Id Second user's ID
     * @param limit Maximum number of messages to retrieve
     * @param offset Offset for pagination
     * @return List of message objects
     */
    public List<Map<String, Object>> getMessagesBetweenUsers(int user1Id, int user2Id, int limit, int offset) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> messages = new ArrayList<>();
        
        try {
            String query = "SELECT m.*, " +
                           "s.username as sender_username, " +
                           "s.full_name as sender_name, " +
                           "s.profile_image_url as sender_image, " +
                           "r.username as receiver_username, " +
                           "r.full_name as receiver_name, " +
                           "r.profile_image_url as receiver_image " +
                           "FROM chat_messages m " +
                           "JOIN users s ON m.sender_id = s.id " +
                           "JOIN users r ON m.receiver_id = r.id " +
                           "WHERE (m.sender_id = ? AND m.receiver_id = ?) " +
                           "OR (m.sender_id = ? AND m.receiver_id = ?) " +
                           "ORDER BY m.created_at ASC " +
                           "LIMIT ? OFFSET ?";
                           
            ps = connection.prepareStatement(query);
            ps.setInt(1, user1Id);
            ps.setInt(2, user2Id);
            ps.setInt(3, user2Id);
            ps.setInt(4, user1Id);
            ps.setInt(5, limit);
            ps.setInt(6, offset);
            
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> message = new HashMap<>();
                message.put("id", rs.getInt("id"));
                message.put("senderId", rs.getInt("sender_id"));
                message.put("receiverId", rs.getInt("receiver_id"));
                message.put("message", rs.getString("message"));
                message.put("isRead", rs.getBoolean("is_read"));
                message.put("createdAt", rs.getTimestamp("created_at"));
                
                // Add user details
                message.put("senderUsername", rs.getString("sender_username"));
                message.put("senderName", rs.getString("sender_name"));
                message.put("senderImage", rs.getString("sender_image"));
                message.put("receiverUsername", rs.getString("receiver_username"));
                message.put("receiverName", rs.getString("receiver_name"));
                message.put("receiverImage", rs.getString("receiver_image"));
                
                messages.add(message);
            }
            
            // Mark messages as read if they were sent to user1
            markMessagesAsRead(connection, user2Id, user1Id);
            
        } catch (SQLException e) {
            System.err.println("Error retrieving messages: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return messages;
    }
    
    /**
     * Gets a user's conversations (users they have exchanged messages with)
     * 
     * @param userId The user's ID
     * @return List of conversations with last message
     */
    public List<Map<String, Object>> getUserConversations(int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        try {
            // Find all users this user has exchanged messages with
            String query = "WITH last_messages AS (" +
                          "  SELECT " +
                          "    CASE " +
                          "      WHEN sender_id = ? THEN receiver_id " +
                          "      ELSE sender_id " +
                          "    END AS other_user_id, " +
                          "    MAX(created_at) as last_message_time " +
                          "  FROM chat_messages " +
                          "  WHERE sender_id = ? OR receiver_id = ? " +
                          "  GROUP BY other_user_id " +
                          ")" +
                          "SELECT " +
                          "  u.id, u.username, u.full_name, u.profile_image_url, u.role, " +
                          "  lm.last_message_time, " +
                          "  m.message as last_message, " +
                          "  m.sender_id as last_message_sender, " +
                          "  m.is_read, " +
                          "  (SELECT COUNT(*) FROM chat_messages " +
                          "   WHERE sender_id = u.id AND receiver_id = ? AND is_read = FALSE) as unread_count " +
                          "FROM last_messages lm " +
                          "JOIN users u ON lm.other_user_id = u.id " +
                          "JOIN chat_messages m ON ((m.sender_id = ? AND m.receiver_id = u.id) OR " +
                          "                          (m.sender_id = u.id AND m.receiver_id = ?)) " +
                          "                     AND m.created_at = lm.last_message_time " +
                          "ORDER BY lm.last_message_time DESC";
            
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            ps.setInt(4, userId);
            ps.setInt(5, userId);
            ps.setInt(6, userId);
            
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> conversation = new HashMap<>();
                conversation.put("userId", rs.getInt("id"));
                conversation.put("username", rs.getString("username"));
                conversation.put("fullName", rs.getString("full_name"));
                conversation.put("profileImageUrl", rs.getString("profile_image_url"));
                conversation.put("role", rs.getString("role"));
                conversation.put("lastMessageTime", rs.getTimestamp("last_message_time"));
                conversation.put("lastMessage", rs.getString("last_message"));
                conversation.put("isLastMessageMine", rs.getInt("last_message_sender") == userId);
                conversation.put("unreadCount", rs.getInt("unread_count"));
                
                conversations.add(conversation);
            }
            
        } catch (SQLException e) {
            System.err.println("Error retrieving conversations: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return conversations;
    }
    
    /**
     * Marks messages as read
     */
    private void markMessagesAsRead(Connection connection, int senderId, int receiverId) {
        PreparedStatement ps = null;
        
        try {
            String query = "UPDATE chat_messages SET is_read = TRUE " +
                           "WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE";
            
            ps = connection.prepareStatement(query);
            ps.setInt(1, senderId);
            ps.setInt(2, receiverId);
            ps.executeUpdate();
            
        } catch (SQLException e) {
            System.err.println("Error marking messages as read: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    /**
     * Gets the count of unread messages for a user
     */
    public int getUnreadMessageCount(int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int count = 0;
        
        try {
            String query = "SELECT COUNT(*) as count FROM chat_messages " +
                           "WHERE receiver_id = ? AND is_read = FALSE";
            
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                count = rs.getInt("count");
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting unread message count: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return count;
    }
    
    /**
     * Deletes a message
     */
    public boolean deleteMessage(int messageId, int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // Only allow deletion if the user is the sender
            String query = "DELETE FROM chat_messages WHERE id = ? AND sender_id = ?";
            ps = connection.prepareStatement(query);
            ps.setInt(1, messageId);
            ps.setInt(2, userId);
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error deleting message: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Sends a message to the AI assistant
     * 
     * @param userId The ID of the user sending the message
     * @param message The message content
     * @return true if message was sent successfully
     */
    public boolean sendMessageToAI(int userId, String message) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            String query = "INSERT INTO ai_chat_messages (user_id, is_user_message, message) VALUES (?, 1, ?)";
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            ps.setString(2, message);
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error sending message to AI: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Stores the AI response in the database
     * 
     * @param userId The ID of the user receiving the message
     * @param aiResponse The AI response content
     * @return true if the response was stored successfully
     */
    public boolean storeAIResponse(int userId, String aiResponse) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            String query = "INSERT INTO ai_chat_messages (user_id, is_user_message, message) VALUES (?, 0, ?)";
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            ps.setString(2, aiResponse);
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error storing AI response: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Retrieves AI chat history for a user
     * 
     * @param userId The ID of the user
     * @param limit Maximum number of messages to retrieve
     * @param offset Offset for pagination
     * @return List of message objects
     */
    public List<Map<String, Object>> getAIChatHistory(int userId, int limit, int offset) {
        List<Map<String, Object>> messages = new ArrayList<>();
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            String query = "SELECT m.id, m.user_id, m.is_user_message, m.message, m.created_at, " +
                          "u.username, u.full_name, u.profile_image_url " +
                          "FROM ai_chat_messages m " +
                          "JOIN users u ON m.user_id = u.id " +
                          "WHERE m.user_id = ? " +
                          "ORDER BY m.created_at DESC " +
                          "LIMIT ? OFFSET ?";
            
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            ps.setInt(2, limit);
            ps.setInt(3, offset);
            
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> message = new HashMap<>();
                message.put("id", rs.getInt("id"));
                message.put("userId", rs.getInt("user_id"));
                message.put("isUserMessage", rs.getBoolean("is_user_message"));
                message.put("message", rs.getString("message"));
                message.put("createdAt", rs.getTimestamp("created_at"));
                message.put("username", rs.getString("username"));
                message.put("fullName", rs.getString("full_name"));
                message.put("profileImageUrl", rs.getString("profile_image_url"));
                
                messages.add(message);
            }
            
        } catch (SQLException e) {
            System.err.println("Error retrieving AI chat history: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return messages;
    }
    
    /**
     * Gets the conversation history in format suitable for OpenAI API
     * 
     * @param userId The ID of the user
     * @param limit Maximum number of messages to retrieve
     * @return List of message objects formatted for OpenAI API
     */
    public List<Map<String, String>> getOpenAIConversationHistory(int userId, int limit) {
        List<Map<String, String>> messages = new ArrayList<>();
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            String query = "SELECT is_user_message, message " +
                          "FROM ai_chat_messages " +
                          "WHERE user_id = ? " +
                          "ORDER BY created_at DESC " +
                          "LIMIT ?";
            
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            ps.setInt(2, limit);
            
            rs = ps.executeQuery();
            
            // Store messages in reverse chronological order first
            List<Map<String, String>> reversedMessages = new ArrayList<>();
            
            while (rs.next()) {
                Map<String, String> message = new HashMap<>();
                boolean isUserMessage = rs.getBoolean("is_user_message");
                
                message.put("role", isUserMessage ? "user" : "assistant");
                message.put("content", rs.getString("message"));
                
                reversedMessages.add(message);
            }
            
            // Reverse the list to get proper chronological order
            for (int i = reversedMessages.size() - 1; i >= 0; i--) {
                messages.add(reversedMessages.get(i));
            }
            
        } catch (SQLException e) {
            System.err.println("Error retrieving OpenAI conversation history: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return messages;
    }

    /**
     * Creates a group chat for a class if it doesn't exist already
     * 
     * @param classId The class ID for the group
     * @return The group ID
     */
    public int createOrGetClassGroup(String classId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int groupId = -1;
        
        try {
            // First check if group already exists
            String query = "SELECT id FROM chat_groups WHERE class_id = ?";
            ps = connection.prepareStatement(query);
            ps.setString(1, classId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                // Group already exists
                groupId = rs.getInt("id");
            } else {
                // Create new group
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
                
                String groupName = classId + " Class Group";
                query = "INSERT INTO chat_groups (name, class_id) VALUES (?, ?)";
                ps = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, groupName);
                ps.setString(2, classId);
                
                int rowsAffected = ps.executeUpdate();
                if (rowsAffected > 0) {
                    rs = ps.getGeneratedKeys();
                    if (rs.next()) {
                        groupId = rs.getInt(1);
                    }
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error creating/getting class group: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return groupId;
    }

    /**
     * Gets all class groups
     * 
     * @return List of all class groups
     */
    public List<Map<String, Object>> getAllClassGroups() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> groups = new ArrayList<>();
        
        try {
            String query = "SELECT cg.*, " +
                           "(SELECT COUNT(*) FROM group_chat_messages WHERE group_id = cg.id) as message_count, " +
                           "(SELECT MAX(created_at) FROM group_chat_messages WHERE group_id = cg.id) as last_activity " +
                           "FROM chat_groups cg " +
                           "ORDER BY cg.name";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> group = new HashMap<>();
                group.put("id", rs.getInt("id"));
                group.put("name", rs.getString("name"));
                group.put("classId", rs.getString("class_id"));
                group.put("createdAt", rs.getTimestamp("created_at"));
                group.put("messageCount", rs.getInt("message_count"));
                group.put("lastActivity", rs.getTimestamp("last_activity"));
                groups.add(group);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting class groups: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return groups;
    }

    /**
     * Gets a specific student's class group
     * 
     * @param userId The student's user ID
     * @return The class group if available, empty map otherwise
     */
    public Map<String, Object> getStudentClassGroup(int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        Map<String, Object> group = new HashMap<>();
        
        try {
            String query = "SELECT cg.*, " +
                           "(SELECT COUNT(*) FROM group_chat_messages WHERE group_id = cg.id) as message_count, " +
                           "(SELECT MAX(created_at) FROM group_chat_messages WHERE group_id = cg.id) as last_activity " +
                           "FROM students s " +
                           "JOIN chat_groups cg ON s.class_id = cg.class_id " +
                           "WHERE s.user_id = ?";
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                group.put("id", rs.getInt("id"));
                group.put("name", rs.getString("name"));
                group.put("classId", rs.getString("class_id"));
                group.put("createdAt", rs.getTimestamp("created_at"));
                group.put("messageCount", rs.getInt("message_count"));
                group.put("lastActivity", rs.getTimestamp("last_activity"));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting student class group: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return group;
    }

    /**
     * Sends a message to a class group
     * 
     * @param groupId The group ID
     * @param senderId The sender's user ID
     * @param message The message content
     * @return The ID of the created message or -1 if failed
     */
    public int sendGroupMessage(int groupId, int senderId, String message) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet generatedKeys = null;
        int messageId = -1;
        
        try {
            String query = "INSERT INTO group_chat_messages (group_id, sender_id, message) VALUES (?, ?, ?)";
            ps = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, groupId);
            ps.setInt(2, senderId);
            ps.setString(3, message);
            
            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                generatedKeys = ps.getGeneratedKeys();
                if (generatedKeys.next()) {
                    messageId = generatedKeys.getInt(1);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error sending group message: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(generatedKeys);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return messageId;
    }

    /**
     * Gets messages for a specific group chat
     * 
     * @param groupId The group ID
     * @param limit Maximum number of messages to retrieve
     * @param offset Offset for pagination
     * @return List of messages
     */
    public List<Map<String, Object>> getGroupMessages(int groupId, int limit, int offset) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> messages = new ArrayList<>();
        
        try {
            String query = "SELECT m.*, " +
                           "u.username as sender_username, " +
                           "u.full_name as sender_name, " +
                           "u.profile_image_url as sender_image, " +
                           "u.role as sender_role " +
                           "FROM group_chat_messages m " +
                           "JOIN users u ON m.sender_id = u.id " +
                           "WHERE m.group_id = ? " +
                           "ORDER BY m.created_at DESC " +
                           "LIMIT ? OFFSET ?";
            ps = connection.prepareStatement(query);
            ps.setInt(1, groupId);
            ps.setInt(2, limit);
            ps.setInt(3, offset);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> message = new HashMap<>();
                message.put("id", rs.getInt("id"));
                message.put("groupId", rs.getInt("group_id"));
                message.put("senderId", rs.getInt("sender_id"));
                message.put("message", rs.getString("message"));
                message.put("createdAt", rs.getTimestamp("created_at"));
                message.put("senderUsername", rs.getString("sender_username"));
                message.put("senderName", rs.getString("sender_name"));
                message.put("senderImage", rs.getString("sender_image"));
                message.put("senderRole", rs.getString("sender_role"));
                messages.add(message);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting group messages: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        // Reverse the list to get chronological order
        java.util.Collections.reverse(messages);
        
        return messages;
    }

    /**
     * Gets groups with latest message for a user
     * For students: returns only their class group
     * For admins: returns all class groups
     * 
     * @param userId The user's ID
     * @param userRole The user's role
     * @return List of group chat data
     */
    public List<Map<String, Object>> getUserGroups(int userId, String userRole) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> groups = new ArrayList<>();
        
        try {
            if ("admin".equals(userRole)) {
                // Admins can see all groups
                return getAllClassGroups();
            } else if ("student".equals(userRole)) {
                // Students can only see their class group
                Map<String, Object> group = getStudentClassGroup(userId);
                if (!group.isEmpty()) {
                    groups.add(group);
                }
            } else if ("lecturer".equals(userRole)) {
                // For future implementation: get lecturer's class groups
                // Currently lecturers don't see any class groups
            }
            
        } catch (Exception e) {
            System.err.println("Error getting user groups: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return groups;
    }

    /**
     * Marks a direct message as unsent (delete for everyone)
     * 
     * @param messageId ID of the message
     * @param userId ID of the user who sent the message
     * @return true if successful
     */
    public boolean unsendMessage(int messageId, int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // First verify that this user is the sender
            String verifyQuery = "SELECT sender_id FROM chat_messages WHERE id = ?";
            ps = connection.prepareStatement(verifyQuery);
            ps.setInt(1, messageId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next() && rs.getInt("sender_id") == userId) {
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
                
                // Delete the message
                String deleteQuery = "UPDATE chat_messages SET message = '[Message unsent]', is_unsent = 1 WHERE id = ?";
                ps = connection.prepareStatement(deleteQuery);
                ps.setInt(1, messageId);
                
                int rowsAffected = ps.executeUpdate();
                success = rowsAffected > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error unsending message: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Marks a group message as unsent (delete for everyone)
     * 
     * @param messageId ID of the message
     * @param userId ID of the user who sent the message
     * @return true if successful
     */
    public boolean unsendGroupMessage(int messageId, int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // First verify that this user is the sender
            String verifyQuery = "SELECT sender_id FROM group_chat_messages WHERE id = ?";
            ps = connection.prepareStatement(verifyQuery);
            ps.setInt(1, messageId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next() && rs.getInt("sender_id") == userId) {
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
                
                // Update the message
                String updateQuery = "UPDATE group_chat_messages SET message = '[Message unsent]', is_unsent = 1 WHERE id = ?";
                ps = connection.prepareStatement(updateQuery);
                ps.setInt(1, messageId);
                
                int rowsAffected = ps.executeUpdate();
                success = rowsAffected > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error unsending group message: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
} 