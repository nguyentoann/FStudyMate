package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import model.PasswordResetToken;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.Optional;

public class PasswordResetTokenDAO {
    
    public PasswordResetTokenDAO() throws SQLException {
        createTokenTableIfNotExists();
    }
    
    // Tạo bảng token nếu chưa tồn tại
    private void createTokenTableIfNotExists() throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        try {
            String sql = "CREATE TABLE IF NOT EXISTS password_reset_tokens (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "token VARCHAR(255) NOT NULL UNIQUE," +
                    "email VARCHAR(255) NOT NULL," +
                    "expiry_date TIMESTAMP NOT NULL," +
                    "is_used BOOLEAN DEFAULT FALSE" +
                    ")";
            
            Statement statement = connection.createStatement();
            statement.execute(sql);
            statement.close();
        } finally {
            pool.freeConnection(connection);
        }
    }
    
    // Lưu token mới
    public void saveToken(PasswordResetToken token) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "INSERT INTO password_reset_tokens (token, email, expiry_date, is_used) VALUES (?, ?, ?, ?)";
            
            statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, token.getToken());
            statement.setString(2, token.getEmail());
            statement.setTimestamp(3, Timestamp.valueOf(token.getExpiryDate()));
            statement.setBoolean(4, token.isUsed());
            
            statement.executeUpdate();
            
            ResultSet generatedKeys = statement.getGeneratedKeys();
            if (generatedKeys.next()) {
                token.setId(generatedKeys.getLong(1));
            }
            generatedKeys.close();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    // Tìm token theo giá trị token
    public Optional<PasswordResetToken> findByToken(String token) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        
        try {
            String sql = "SELECT * FROM password_reset_tokens WHERE token = ?";
            statement = connection.prepareStatement(sql);
            statement.setString(1, token);
            resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return Optional.of(mapResultSetToToken(resultSet));
            }
            
            return Optional.empty();
        } finally {
            DBUtils.closeResultSet(resultSet);
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    // Tìm token có hiệu lực gần nhất cho email
    public Optional<PasswordResetToken> findValidTokenByEmail(String email) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        
        try {
            String sql = "SELECT * FROM password_reset_tokens WHERE email = ? AND is_used = FALSE AND expiry_date > ? ORDER BY expiry_date DESC LIMIT 1";
            statement = connection.prepareStatement(sql);
            statement.setString(1, email);
            statement.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return Optional.of(mapResultSetToToken(resultSet));
            }
            
            return Optional.empty();
        } finally {
            DBUtils.closeResultSet(resultSet);
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    // Đánh dấu token đã được sử dụng
    public void markTokenAsUsed(String token) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "UPDATE password_reset_tokens SET is_used = TRUE WHERE token = ?";
            statement = connection.prepareStatement(sql);
            statement.setString(1, token);
            statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    // Xóa tất cả token hết hạn
    public int deleteExpiredTokens() throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "DELETE FROM password_reset_tokens WHERE expiry_date < ?";
            statement = connection.prepareStatement(sql);
            statement.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            return statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    // Vô hiệu hóa tất cả token của email
    public void invalidateTokensByEmail(String email) throws SQLException {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement statement = null;
        
        try {
            String sql = "UPDATE password_reset_tokens SET is_used = TRUE WHERE email = ?";
            statement = connection.prepareStatement(sql);
            statement.setString(1, email);
            statement.executeUpdate();
        } finally {
            DBUtils.closePreparedStatement(statement);
            pool.freeConnection(connection);
        }
    }
    
    // Chuyển ResultSet sang đối tượng PasswordResetToken
    private PasswordResetToken mapResultSetToToken(ResultSet resultSet) throws SQLException {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(resultSet.getLong("id"));
        token.setToken(resultSet.getString("token"));
        token.setEmail(resultSet.getString("email"));
        token.setExpiryDate(resultSet.getTimestamp("expiry_date").toLocalDateTime());
        token.setUsed(resultSet.getBoolean("is_used"));
        return token;
    }
}