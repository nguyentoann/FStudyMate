package connection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ResourceBundle;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.io.InputStream;
import java.util.Properties;

/**
 * Quản lý kết nối đến cơ sở dữ liệu
 */
public class ConnectionPool {
    
    private static final Logger LOGGER = Logger.getLogger(ConnectionPool.class.getName());
    
    private static ConnectionPool instance;
    private String jdbcURL;
    private String jdbcUsername;
    private String jdbcPassword;
    
    private ConnectionPool() {
        try {
            // Tải thông tin kết nối từ application.properties
            loadDatabaseProperties();
            
            // Đăng ký driver MySQL
            Class.forName("com.mysql.cj.jdbc.Driver");
            LOGGER.info("MySQL JDBC Driver đã được đăng ký thành công");
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "Không thể tìm thấy MySQL JDBC Driver", e);
            throw new RuntimeException("Không thể tìm thấy MySQL JDBC Driver", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Lỗi khởi tạo ConnectionPool", e);
            throw new RuntimeException("Lỗi khởi tạo ConnectionPool", e);
        }
    }
    
    /**
     * Lấy instance của ConnectionPool (Singleton pattern)
     */
    public static synchronized ConnectionPool getInstance() {
        if (instance == null) {
            instance = new ConnectionPool();
        }
        return instance;
    }
    
    /**
     * Tải thông tin kết nối từ application.properties
     */
    private void loadDatabaseProperties() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            Properties properties = new Properties();
            
            if (input == null) {
                // Thử cách khác nếu không tìm thấy file
                try {
                    ResourceBundle resourceBundle = ResourceBundle.getBundle("application");
                    jdbcURL = resourceBundle.getString("spring.datasource.url")
                             .replace("${DB_URL:", "")
                             .replace("}", "");
                    jdbcUsername = resourceBundle.getString("spring.datasource.username")
                                  .replace("${DB_USERNAME:", "")
                                  .replace("}", "");
                    jdbcPassword = resourceBundle.getString("spring.datasource.password")
                                  .replace("${DB_PASSWORD:", "")
                                  .replace("}", "");
                } catch (Exception e) {
                    // Sử dụng giá trị mặc định nếu không đọc được
                    LOGGER.warning("Không thể tải application.properties, sử dụng giá trị mặc định");
                    jdbcURL = "jdbc:mysql://localhost:3306/fstudymate?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true";
                    jdbcUsername = "root";
                    jdbcPassword = "password";
                }
            } else {
                properties.load(input);
                
                // Xử lý các biến môi trường trong chuỗi kết nối
                String url = properties.getProperty("spring.datasource.url");
                if (url.contains("${DB_URL:")) {
                    jdbcURL = url.substring(url.indexOf("${DB_URL:") + 9, url.lastIndexOf("}"));
                } else {
                    jdbcURL = url;
                }
                
                String username = properties.getProperty("spring.datasource.username");
                if (username.contains("${DB_USERNAME:")) {
                    jdbcUsername = username.substring(username.indexOf("${DB_USERNAME:") + 14, username.lastIndexOf("}"));
                } else {
                    jdbcUsername = username;
                }
                
                String password = properties.getProperty("spring.datasource.password");
                if (password.contains("${DB_PASSWORD:")) {
                    jdbcPassword = password.substring(password.indexOf("${DB_PASSWORD:") + 14, password.lastIndexOf("}"));
                } else {
                    jdbcPassword = password;
                }
            }
            
            LOGGER.info("Đã tải cấu hình database: " + jdbcURL);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Lỗi tải properties kết nối database", e);
            // Sử dụng giá trị mặc định nếu có lỗi
            jdbcURL = "jdbc:mysql://localhost:3306/fstudymate?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true";
            jdbcUsername = "root";
            jdbcPassword = "password";
        }
    }
    
    /**
     * Lấy kết nối đến cơ sở dữ liệu
     */
    public Connection getConnection() throws SQLException {
        try {
            Connection conn = DriverManager.getConnection(jdbcURL, jdbcUsername, jdbcPassword);
            LOGGER.fine("Đã tạo kết nối mới đến database");
            return conn;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Không thể kết nối đến database", e);
            throw e;
        }
    }
    
    /**
     * Trả kết nối về pool (trong trường hợp này chỉ đóng kết nối)
     */
    public void freeConnection(Connection connection) {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                LOGGER.fine("Đã đóng kết nối database");
            }
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Không thể đóng kết nối database", e);
        }
    }
    
    /**
     * Kiểm tra kết nối đến database
     */
    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Kiểm tra kết nối thất bại", e);
            return false;
        }
    }
}
