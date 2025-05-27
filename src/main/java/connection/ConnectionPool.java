package connection;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.DriverManager;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import com.mysql.cj.jdbc.MysqlDataSource;

public class ConnectionPool {

    // Connection Pool instance
    private static ConnectionPool pool = null;
    private static DataSource dataSource = null;
    
    // Database connection parameters
    private static final String DB_URL = "jdbc:mysql://toandz.ddns.net:3306/fstudymate";
    private static final String DB_USER = "fstudy";
    private static final String DB_PASSWORD = "toandz@secretpassword";
    
    // Debug flag to enable query logging
    private static final boolean DEBUG = true;
    
    // Initialize connection pool
    private ConnectionPool() {
        try {
            // First try to get connection from JNDI
            try {
                InitialContext ic = new InitialContext();
                dataSource = (DataSource) ic.lookup("java:/comp/env/jdbc/FStudyMate");
                System.out.println("JNDI datasource found: " + dataSource);
            } catch (NamingException e) {
                System.out.println("JNDI datasource not found, creating direct connection: " + e);
                
                // If JNDI fails, create direct connection
                MysqlDataSource mysqlDS = new MysqlDataSource();
                mysqlDS.setURL(DB_URL);
                mysqlDS.setUser(DB_USER);
                mysqlDS.setPassword(DB_PASSWORD);
                mysqlDS.setUseSSL(false);
                mysqlDS.setAllowPublicKeyRetrieval(true);
                dataSource = mysqlDS;
                
                // Verify connection works
                try (Connection testConn = dataSource.getConnection()) {
                    System.out.println("Direct database connection established successfully: " + 
                                       testConn.getMetaData().getDatabaseProductName() + " " +
                                       testConn.getMetaData().getDatabaseProductVersion());
                } catch (SQLException se) {
                    System.err.println("Failed to establish test connection: " + se);
                    throw se;
                }
            }
        } catch (Exception e) {
            System.err.println("Fatal error initializing connection pool: " + e);
            e.printStackTrace();
        }
    }
    
    // Get connection pool instance
    public static synchronized ConnectionPool getInstance() {
        if (pool == null) {
            pool = new ConnectionPool();
        }
        return pool;
    }
    
    // Get connection from pool
    public Connection getConnection() {
        try {
            if (dataSource == null) {
                throw new SQLException("DataSource is null - connection pool not properly initialized");
            }
            Connection conn = dataSource.getConnection();
            if (conn == null) {
                throw new SQLException("Failed to obtain database connection");
            }
            if (DEBUG) {
                System.out.println("[DB] Connection obtained from pool: " + conn.hashCode());
            }
            return conn;
        } catch (SQLException e) {
            System.err.println("Error getting connection: " + e);
            e.printStackTrace();
            return null;
        }
    }
    
    // Return connection to pool
    public void freeConnection(Connection c) {
        try {
            if (c != null) {
                if (DEBUG) {
                    System.out.println("[DB] Connection returned to pool: " + c.hashCode());
                }
                c.close();
            }
        } catch (SQLException e) {
            System.err.println("Error closing connection: " + e);
        }
    }
    
    // Debug method to log a SQL query
    public static void logQuery(String query, Object... params) {
        if (DEBUG) {
            StringBuilder sb = new StringBuilder();
            sb.append("[DB QUERY] ").append(query);
            
            if (params != null && params.length > 0) {
                sb.append(" [PARAMS: ");
                for (int i = 0; i < params.length; i++) {
                    if (i > 0) sb.append(", ");
                    sb.append(params[i]);
                }
                sb.append("]");
            }
            
            System.out.println(sb.toString());
        }
    }
}
