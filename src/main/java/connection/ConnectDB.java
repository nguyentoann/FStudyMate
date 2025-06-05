package connection;

import java.sql.Connection;

/**
 * Utility class for obtaining database connections.
 * This class provides simplified access to the ConnectionPool.
 */
public class ConnectDB {
    
    /**
     * Gets a database connection from the connection pool.
     * 
     * @return A database connection
     */
    public static Connection getConnection() {
        return ConnectionPool.getInstance().getConnection();
    }
    
    /**
     * Returns a connection to the connection pool.
     * 
     * @param conn The connection to be returned to the pool
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            ConnectionPool.getInstance().freeConnection(conn);
        }
    }
} 