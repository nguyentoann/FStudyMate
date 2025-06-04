package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import model.Notification;
import model.User;
import model.Notification.NotificationType;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NotificationDAO {
    
    private final UserDAO userDAO;
    
    public NotificationDAO() throws SQLException {
        userDAO = new UserDAO();
        createNotificationTableIfNotExists();
    }
    
    public void saveNotification(Notification notification) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "INSERT INTO notifications (user_id, title, message, type, created_at, is_read, related_entity_id) " +
                      "VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setLong(1, notification.getUser().getUserId());
            statement.setString(2, notification.getTitle());
            statement.setString(3, notification.getMessage());
            statement.setString(4, notification.getType().name());
            statement.setTimestamp(5, Timestamp.valueOf(notification.getCreatedAt()));
            statement.setBoolean(6, notification.isRead());
            
            if (notification.getRelatedEntityId() != null) {
                statement.setLong(7, notification.getRelatedEntityId());
            } else {
                statement.setNull(7, Types.BIGINT);
            }
            
            statement.executeUpdate();
            
            ResultSet generatedKeys = statement.getGeneratedKeys();
            if (generatedKeys.next()) {
                notification.setId(generatedKeys.getLong(1));
            }
            generatedKeys.close();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    public List<Notification> getNotificationsByUser(long userId) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        List<Notification> notifications = new ArrayList<>();
        
        try {
            String sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
            statement = connection.prepareStatement(sql);
            statement.setLong(1, userId);
            
            resultSet = statement.executeQuery();
            while (resultSet.next()) {
                notifications.add(mapResultSetToNotification(resultSet));
            }
        } finally {
            DBUtils.closeResultSet(resultSet);
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
        
        return notifications;
    }
    
    public List<Notification> getUnreadNotificationsByUser(long userId) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        List<Notification> notifications = new ArrayList<>();
        
        try {
            String sql = "SELECT * FROM notifications WHERE user_id = ? AND is_read = false ORDER BY created_at DESC";
            statement = connection.prepareStatement(sql);
            statement.setLong(1, userId);
            
            resultSet = statement.executeQuery();
            while (resultSet.next()) {
                notifications.add(mapResultSetToNotification(resultSet));
            }
        } finally {
            DBUtils.closeResultSet(resultSet);
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
        
        return notifications;
    }
    
    public void markAsRead(long notificationId) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "UPDATE notifications SET is_read = true WHERE id = ?";
            statement = connection.prepareStatement(sql);
            statement.setLong(1, notificationId);
            statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    public void markAllAsRead(long userId) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "UPDATE notifications SET is_read = true WHERE user_id = ?";
            statement = connection.prepareStatement(sql);
            statement.setLong(1, userId);
            statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    public void deleteNotification(long notificationId) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "DELETE FROM notifications WHERE id = ?";
            statement = connection.prepareStatement(sql);
            statement.setLong(1, notificationId);
            statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    public int deleteOldNotifications(int daysOld) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "DELETE FROM notifications WHERE created_at < ?";
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
            
            statement = connection.prepareStatement(sql);
            statement.setTimestamp(1, Timestamp.valueOf(cutoffDate));
            return statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    private Notification mapResultSetToNotification(ResultSet resultSet) throws SQLException {
        Notification notification = new Notification();
        notification.setId(resultSet.getLong("id"));
        
        long userId = resultSet.getLong("user_id");
        User user = userDAO.getUserById(userId);
        notification.setUser(user);
        
        notification.setTitle(resultSet.getString("title"));
        notification.setMessage(resultSet.getString("message"));
        notification.setType(NotificationType.valueOf(resultSet.getString("type")));
        notification.setCreatedAt(resultSet.getTimestamp("created_at").toLocalDateTime());
        notification.setRead(resultSet.getBoolean("is_read"));
        
        long relatedEntityId = resultSet.getLong("related_entity_id");
        if (!resultSet.wasNull()) {
            notification.setRelatedEntityId(relatedEntityId);
        }
        
        return notification;
    }
    
    // Create notification table if it doesn't exist
    public void createNotificationTableIfNotExists() throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        Statement statement = null;
        
        try {
            String sql = "CREATE TABLE IF NOT EXISTS notifications (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "user_id BIGINT NOT NULL," +
                    "title VARCHAR(255) NOT NULL," +
                    "message VARCHAR(1000) NOT NULL," +
                    "type VARCHAR(50) NOT NULL," +
                    "created_at TIMESTAMP NOT NULL," +
                    "is_read BOOLEAN DEFAULT FALSE," +
                    "related_entity_id BIGINT," +
                    "FOREIGN KEY (user_id) REFERENCES users(id)" +
                    ")";
            
            statement = connection.createStatement();
            statement.execute(sql);
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
} 