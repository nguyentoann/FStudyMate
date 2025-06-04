package connection;

import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Lớp tiện ích để đóng các tài nguyên JDBC
 */
public class DBUtils {
    private static final Logger LOGGER = Logger.getLogger(DBUtils.class.getName());
    
    /**
     * Đóng đối tượng ResultSet
     */
    public static void closeResultSet(ResultSet rs) {
        if (rs != null) {
            try {
                rs.close();
            } catch (SQLException e) {
                LOGGER.log(Level.WARNING, "Không thể đóng ResultSet", e);
            }
        }
    }
    
    /**
     * Đóng đối tượng PreparedStatement
     */
    public static void closePreparedStatement(PreparedStatement stmt) {
        if (stmt != null) {
            try {
                stmt.close();
            } catch (SQLException e) {
                LOGGER.log(Level.WARNING, "Không thể đóng PreparedStatement", e);
            }
        }
    }
    
    /**
     * Đóng đối tượng Statement
     */
    public static void closeStatement(Statement stmt) {
        if (stmt != null) {
            try {
                stmt.close();
            } catch (SQLException e) {
                LOGGER.log(Level.WARNING, "Không thể đóng Statement", e);
            }
        }
    }
    
    /**
     * Đóng đối tượng Connection
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                LOGGER.log(Level.WARNING, "Không thể đóng Connection", e);
            }
        }
    }
    
    /**
     * Đóng tất cả tài nguyên JDBC
     */
    public static void closeAll(ResultSet rs, Statement stmt, Connection conn) {
        closeResultSet(rs);
        closeStatement(stmt);
        closeConnection(conn);
    }
    
    /**
     * Rollback transaction nếu có lỗi
     */
    public static void rollbackTransaction(Connection conn) {
        if (conn != null) {
            try {
                conn.rollback();
            } catch (SQLException e) {
                LOGGER.log(Level.WARNING, "Không thể rollback transaction", e);
            }
        }
    }
}
