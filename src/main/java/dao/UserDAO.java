package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import model.User;
import at.favre.lib.crypto.bcrypt.BCrypt;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.sql.DatabaseMetaData;

public class UserDAO {
    
    public User authenticate(String login, String password) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        User user = null;
        
        // Modified query to check both email and username
        String query = "SELECT * FROM users WHERE email = ? OR username = ?";
        
        try {
            ps = connection.prepareStatement(query);
            ps.setString(1, login);
            ps.setString(2, login);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                String storedHash = rs.getString("password_hash");
                boolean isVerified = false;
                
                // Check if verified column exists and get its value
                try {
                    isVerified = rs.getBoolean("verified");
                } catch (SQLException e) {
                    // Column might not exist yet in older schema
                    // Default to true to maintain backward compatibility
                    isVerified = true;
                    System.out.println("Verified column not found in users table, assuming verified=true for backwards compatibility");
                }
                
                // Verify password using BCrypt
                BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), storedHash);
                
                // Only create user object if password verification succeeds
                if (result.verified) {
                    // Check if user is verified
                    if (!isVerified) {
                        System.out.println("User " + login + " is not verified.");
                        // Just return null without sending OTP
                        return null;
                    }
                    
                    user = new User();
                    user.setId(rs.getInt("id"));
                    user.setUsername(rs.getString("username"));
                    user.setEmail(rs.getString("email"));
                    user.setRole(rs.getString("role"));
                    user.setFullName(rs.getString("full_name"));
                    user.setPhoneNumber(rs.getString("phone_number"));
                    user.setProfileImageUrl(rs.getString("profile_image_url"));
                    
                    // Get role-specific data
                    String role = rs.getString("role");
                    int userId = rs.getInt("id");
                    loadRoleSpecificData(connection, user, role, userId);
                    
                    System.out.println("User authentication successful for: " + login);
                } else {
                    // Password is incorrect - just log the error, don't send OTP
                    System.out.println("Password verification failed for: " + login);
                    // Return null to indicate authentication failed due to wrong password
                    return null;
                }
            } else {
                System.out.println("No user found with login: " + login);
            }
        } catch (SQLException e) {
            System.out.println("Error in authenticate: " + e);
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return user;
    }
    
    /**
     * Generate and send a new OTP for unverified users
     */
    private void generateAndSendNewOtp(String email) {
        try {
            // Call the emergency controller to generate a new OTP
            // This is a workaround to reuse existing OTP generation logic
            java.net.URL url = new java.net.URL("http://localhost:8080/emergency/generate-otp");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            
            String jsonInputString = "{\"email\": \"" + email + "\"}";
            
            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            System.out.println("OTP generation response code: " + responseCode);
            
        } catch (Exception e) {
            System.err.println("Failed to generate new OTP: " + e.getMessage());
        }
    }
    
    /**
     * Loads role-specific data for a user based on their role
     */
    private void loadRoleSpecificData(Connection connection, User user, String role, int userId) {
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            String query = null;
            
            switch (role) {
                case "student":
                query = "SELECT a.name AS academic_major, t.name AS term_name, s.gender, s.date_of_birth, s.class_id " +
                "FROM students s " +
                "LEFT JOIN academic_majors a ON s.major_id = a.id " +
                "LEFT JOIN Terms t ON s.term_id = t.id " +
                "WHERE s.user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.setProperty("academicMajor", rs.getString("academic_major"));
                        user.setProperty("term", rs.getString("term_name"));
                        user.setProperty("gender", rs.getString("gender"));
                        user.setProperty("dateOfBirth", rs.getString("date_of_birth"));
                        user.setProperty("classId", rs.getString("class_id"));
                    }
                    break;
                    
                case "lecturer":
                    query = "SELECT department, specializations FROM lecturers WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.setProperty("department", rs.getString("department"));
                        user.setProperty("specializations", rs.getString("specializations"));
                    }
                    break;
                    
                case "outsrc_student":
                    query = "SELECT organization, date_of_birth FROM outsource_students WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.setProperty("organization", rs.getString("organization"));
                        user.setProperty("dateOfBirth", rs.getString("date_of_birth"));
                    }
                    break;
                    
                case "guest":
                    query = "SELECT institution_name, access_reason FROM guests WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.setProperty("institutionName", rs.getString("institution_name"));
                        user.setProperty("accessReason", rs.getString("access_reason"));
                    }
                    break;
                    
                case "admin":
                    query = "SELECT admin_id, permissions_level FROM admins WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.setProperty("adminId", rs.getString("admin_id"));
                        user.setProperty("permissionsLevel", rs.getString("permissions_level"));
                    }
                    break;
            }
        } catch (SQLException e) {
            System.out.println("Error loading role-specific data: " + e.getMessage());
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    /**
     * Loads role-specific data into a user data map
     */
    private void loadRoleSpecificData(Connection connection, Map<String, Object> user, String role, int userId) {
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            String query = null;
            
            switch (role) {
                case "student":
                query = "SELECT s.student_id, a.name AS academic_major, t.name AS term_name, s.gender, s.date_of_birth, s.class_id, " +
                       "s.major_id, s.term_id " +
                "FROM students s " +
                "LEFT JOIN academic_majors a ON s.major_id = a.id " +
                "LEFT JOIN Terms t ON s.term_id = t.id " +
                "WHERE s.user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.put("studentId", rs.getString("student_id"));
                        user.put("academicMajor", rs.getString("academic_major"));
                        user.put("term", rs.getString("term_name"));
                        user.put("majorId", rs.getInt("major_id"));
                        user.put("termId", rs.getInt("term_id"));
                        user.put("gender", rs.getString("gender"));
                        user.put("dateOfBirth", rs.getString("date_of_birth"));
                        user.put("classId", rs.getString("class_id"));
                    }
                    break;
                    
                case "lecturer":
                    query = "SELECT lecturer_id, department, specializations FROM lecturers WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.put("lecturerId", rs.getString("lecturer_id"));
                        user.put("department", rs.getString("department"));
                        user.put("specializations", rs.getString("specializations"));
                    }
                    break;
                    
                case "outsrc_student":
                    query = "SELECT outsrc_id, organization, date_of_birth FROM outsource_students WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.put("outsrcId", rs.getString("outsrc_id"));
                        user.put("organization", rs.getString("organization"));
                        user.put("dateOfBirth", rs.getString("date_of_birth"));
                    }
                    break;
                    
                case "guest":
                    query = "SELECT guest_id, institution_name, access_reason FROM guests WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.put("guestId", rs.getString("guest_id"));
                        user.put("institutionName", rs.getString("institution_name"));
                        user.put("accessReason", rs.getString("access_reason"));
                    }
                    break;
                    
                case "admin":
                    query = "SELECT admin_id, permissions_level FROM admins WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setInt(1, userId);
                    rs = ps.executeQuery();
                    
                    if (rs.next()) {
                        user.put("adminId", rs.getString("admin_id"));
                        user.put("permissionsLevel", rs.getString("permissions_level"));
                    }
                    break;
            }
        } catch (SQLException e) {
            System.err.println("Error loading role-specific data: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    public boolean registerUser(User user, Map<String, Object> roleData) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        // Check if verified column exists
        boolean verifiedColumnExists = false;
        try {
            DatabaseMetaData metadata = connection.getMetaData();
            ResultSet columnsRS = metadata.getColumns(null, null, "users", "verified");
            verifiedColumnExists = columnsRS.next();
            columnsRS.close();
        } catch (SQLException e) {
            System.out.println("Error checking for verified column: " + e.getMessage());
            // Continue anyway, we'll handle this later
        }
        
        String query;
        if (verifiedColumnExists) {
            query = "INSERT INTO users (username, email, password_hash, role, full_name, phone_number, verified) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        } else {
            // Try to add the verified column first
            try {
                Statement stmt = connection.createStatement();
                stmt.execute("ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false");
                stmt.close();
                verifiedColumnExists = true;
                System.out.println("Added verified column to users table");
                
                query = "INSERT INTO users (username, email, password_hash, role, full_name, phone_number, verified) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?)";
            } catch (SQLException e) {
                // Column may already exist or can't be added, use original query
                System.out.println("Could not add verified column: " + e.getMessage());
                query = "INSERT INTO users (username, email, password_hash, role, full_name, phone_number) "
                        + "VALUES (?, ?, ?, ?, ?, ?)";
            }
        }
        
        try {
            // First check if username or email already exists
            if (usernameExists(connection, user.getUsername()) || 
                emailExists(connection, user.getEmail())) {
                System.out.println("Username or email already exists: " + user.getUsername() + ", " + user.getEmail());
                return false;
            }
            
            // Hash the password with BCrypt
            String hashedPassword = BCrypt.withDefaults().hashToString(12, user.getPasswordHash().toCharArray());
            System.out.println("Hashed password created for user: " + user.getUsername());
            
            ps = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            ps.setString(3, hashedPassword);
            ps.setString(4, user.getRole());
            ps.setString(5, user.getFullName());
            ps.setString(6, user.getPhoneNumber());
            
            // Add verified parameter if column exists
            if (verifiedColumnExists) {
                ps.setBoolean(7, false); // Set verified to false for new users
            }
            
            int rowsAffected = ps.executeUpdate();
            System.out.println("User insert rows affected: " + rowsAffected);
            
            if (rowsAffected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int userId = rs.getInt(1);
                    user.setId(userId);
                    System.out.println("User created with ID: " + userId);
                    
                    // Add role-specific details
                    boolean roleDetailsAdded = addRoleSpecificDetails(connection, user, roleData);
                    if (!roleDetailsAdded) {
                        System.out.println("Failed to add role-specific details for user: " + userId);
                        // Don't return false here - the main user record was created successfully
                    }
                    
                    return true;
                }
            }
            
        } catch (SQLException e) {
            System.out.println("Error in registerUser: " + e);
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return false;
    }
    
    // Original method kept for backward compatibility
    public boolean registerUser(User user) {
        return registerUser(user, new HashMap<>());
    }
    
    private boolean usernameExists(Connection connection, String username) throws SQLException {
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            ps = connection.prepareStatement("SELECT 1 FROM users WHERE username = ?");
            ps.setString(1, username);
            rs = ps.executeQuery();
            return rs.next();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean emailExists(Connection connection, String email) throws SQLException {
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            ps = connection.prepareStatement("SELECT 1 FROM users WHERE email = ?");
            ps.setString(1, email);
            rs = ps.executeQuery();
            return rs.next();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean addRoleSpecificDetails(Connection connection, User user, Map<String, Object> roleData) throws SQLException {
        String role = user.getRole();
        int userId = user.getId();
        PreparedStatement ps = null;
        
        try {
            switch (role) {
                case "student":
                    return addStudentDetails(connection, userId, roleData);
                case "lecturer":
                    return addLecturerDetails(connection, userId, roleData);
                case "outsrc_student":
                    return addOutsourceStudentDetails(connection, userId, roleData);
                case "guest":
                    return addGuestDetails(connection, userId, roleData);
                case "admin":
                    return addAdminDetails(connection, userId, roleData);
                default:
                    return false;
            }
        } catch (SQLException e) {
            System.out.println("Error adding role-specific details: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean addStudentDetails(Connection connection, int userId, Map<String, Object> roleData) throws SQLException {
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            // Generate a student ID
            String studentId = "SE" + System.currentTimeMillis() % 10000;
            
            String dateOfBirth = (String) roleData.get("dateOfBirth");
            String gender = (String) roleData.get("gender");
            String academicMajor = (String) roleData.get("academicMajor");
            String term = (String) roleData.get("term");
            String classId = (String) roleData.get("classId");
            
            // Get major_id from academic_majors table
            Integer majorId = null;
            if (academicMajor != null) {
                ps = connection.prepareStatement("SELECT id FROM academic_majors WHERE name = ?");
                ps.setString(1, academicMajor);
                rs = ps.executeQuery();
                if (rs.next()) {
                    majorId = rs.getInt("id");
                } else {
                    // Insert new academic major if it doesn't exist
                    DBUtils.closeResultSet(rs);
                    DBUtils.closePreparedStatement(ps);
                    ps = connection.prepareStatement("INSERT INTO academic_majors (name) VALUES (?)", Statement.RETURN_GENERATED_KEYS);
                    ps.setString(1, academicMajor);
                    ps.executeUpdate();
                    rs = ps.getGeneratedKeys();
                    if (rs.next()) {
                        majorId = rs.getInt(1);
                    }
                }
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
            }
            
            // Get term_id from Terms table
            Integer termId = null;
            if (term != null) {
                ps = connection.prepareStatement("SELECT id FROM Terms WHERE name = ?");
                ps.setString(1, term);
                rs = ps.executeQuery();
                if (rs.next()) {
                    termId = rs.getInt("id");
                } else {
                    // Insert new term if it doesn't exist
                    DBUtils.closeResultSet(rs);
                    DBUtils.closePreparedStatement(ps);
                    ps = connection.prepareStatement("INSERT INTO Terms (name) VALUES (?)", Statement.RETURN_GENERATED_KEYS);
                    ps.setString(1, term);
                    ps.executeUpdate();
                    rs = ps.getGeneratedKeys();
                    if (rs.next()) {
                        termId = rs.getInt(1);
                    }
                }
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(ps);
            }
            
            System.out.println("Adding student details: ID=" + studentId + ", DOB=" + dateOfBirth + ", Gender=" + gender + 
                              ", Major ID=" + majorId + ", Term ID=" + termId + ", Class ID=" + classId);
            
            ps = connection.prepareStatement(
                "INSERT INTO students (student_id, user_id, date_of_birth, gender, class_id, major_id, term_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
            ps.setString(1, studentId);
            ps.setInt(2, userId);
            ps.setString(3, dateOfBirth != null ? dateOfBirth : null);
            ps.setString(4, gender != null ? gender : "Male");
            ps.setString(5, classId);
            
            // Set the IDs (can be null)
            if (majorId != null) {
                ps.setInt(6, majorId);
            } else {
                ps.setNull(6, java.sql.Types.INTEGER);
            }
            
            if (termId != null) {
                ps.setInt(7, termId);
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            
            int result = ps.executeUpdate();
            System.out.println("Student insert result: " + result);
            return result > 0;
        } catch (SQLException e) {
            System.out.println("Error adding student details: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean addLecturerDetails(Connection connection, int userId, Map<String, Object> roleData) throws SQLException {
        PreparedStatement ps = null;
        try {
            // Generate a lecturer ID
            String lecturerId = "LEC" + System.currentTimeMillis() % 10000;
            
            String department = (String) roleData.get("department");
            String specializations = (String) roleData.get("specializations");
            
            ps = connection.prepareStatement(
                "INSERT INTO lecturers (lecturer_id, user_id, department, specializations) VALUES (?, ?, ?, ?)");
            ps.setString(1, lecturerId);
            ps.setInt(2, userId);
            ps.setString(3, department != null ? department : "IT");
            ps.setString(4, specializations != null ? specializations : "");
            
            return ps.executeUpdate() > 0;
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean addOutsourceStudentDetails(Connection connection, int userId, Map<String, Object> roleData) throws SQLException {
        PreparedStatement ps = null;
        try {
            // Generate an outsource student ID
            String outsrcId = "OUT" + System.currentTimeMillis() % 10000;
            
            String dateOfBirth = (String) roleData.get("dateOfBirth");
            String organization = (String) roleData.get("organization");
            
            ps = connection.prepareStatement(
                "INSERT INTO outsource_students (outsrc_id, user_id, date_of_birth, organization) VALUES (?, ?, ?, ?)");
            ps.setString(1, outsrcId);
            ps.setInt(2, userId);
            ps.setString(3, dateOfBirth != null ? dateOfBirth : null);
            ps.setString(4, organization != null ? organization : "Partner University");
            
            return ps.executeUpdate() > 0;
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean addGuestDetails(Connection connection, int userId, Map<String, Object> roleData) throws SQLException {
        PreparedStatement ps = null;
        try {
            // Generate a guest ID
            String guestId = "GUEST" + System.currentTimeMillis() % 10000;
            
            String institutionName = (String) roleData.get("institutionName");
            String accessReason = (String) roleData.get("accessReason");
            
            ps = connection.prepareStatement(
                "INSERT INTO guests (guest_id, user_id, institution_name, access_reason) VALUES (?, ?, ?, ?)");
            ps.setString(1, guestId);
            ps.setInt(2, userId);
            ps.setString(3, institutionName != null ? institutionName : "");
            ps.setString(4, accessReason != null ? accessReason : "");
            
            return ps.executeUpdate() > 0;
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    private boolean addAdminDetails(Connection connection, int userId, Map<String, Object> roleData) throws SQLException {
        PreparedStatement ps = null;
        try {
            // Generate an admin ID
            String adminId = "ADMIN" + System.currentTimeMillis() % 10000;
            
            String permissionsLevel = (String) roleData.get("permissionsLevel");
            if (permissionsLevel == null) {
                permissionsLevel = "ContentManager"; // Default permission level
            }
            
            ps = connection.prepareStatement(
                "INSERT INTO admins (admin_id, user_id, permissions_level) VALUES (?, ?, ?)");
            ps.setString(1, adminId);
            ps.setInt(2, userId);
            ps.setString(3, permissionsLevel);
            
            return ps.executeUpdate() > 0;
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
    }
    
    // Original addStudentDetails method kept for reference but modified to use the new one
    private void addStudentDetails(Connection connection, User user) throws SQLException {
        Map<String, Object> roleData = new HashMap<>();
        roleData.put("academicMajor", "Software Engineering");
        addStudentDetails(connection, user.getId(), roleData);
    }
    
    public boolean updateUserProfile(User user, Map<String, Object> profileData) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // Begin transaction
            connection.setAutoCommit(false);
            
            // Update basic user info in the users table
            String query = "UPDATE users SET full_name = ?, phone_number = ?, profile_image_url = ? WHERE id = ?";
            ps = connection.prepareStatement(query);
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getPhoneNumber());
            ps.setString(3, user.getProfileImageUrl());
            ps.setInt(4, user.getId());
            
            int rowsAffected = ps.executeUpdate();
            System.out.println("User update rows affected: " + rowsAffected);
            
            if (rowsAffected > 0) {
                // Get the user's role
                DBUtils.closePreparedStatement(ps);
                query = "SELECT role FROM users WHERE id = ?";
                ps = connection.prepareStatement(query);
                ps.setInt(1, user.getId());
                ResultSet rs = ps.executeQuery();
                
                if (rs.next()) {
                    String role = rs.getString("role");
                    DBUtils.closeResultSet(rs);
                    
                    // Update role-specific details
                    boolean roleUpdateSuccess = updateRoleSpecificDetails(connection, user.getId(), role, profileData);
                    if (!roleUpdateSuccess) {
                        System.out.println("Warning: Failed to update role-specific details");
                        // Continue anyway as the main user data was updated
                    }
                }
                
                // Commit transaction
                connection.commit();
                success = true;
            } else {
                // Rollback if user update failed
                connection.rollback();
            }
        } catch (SQLException e) {
            try {
                // Rollback on error
                connection.rollback();
            } catch (SQLException ex) {
                System.err.println("Error rolling back transaction: " + ex.getMessage());
            }
            System.err.println("Error in updateUserProfile: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                connection.setAutoCommit(true);
            } catch (SQLException e) {
                System.err.println("Error resetting auto-commit: " + e.getMessage());
            }
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    private boolean updateRoleSpecificDetails(Connection connection, int userId, String role, Map<String, Object> profileData) {
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            String query = null;
            
            switch (role) {
                case "student":
                    // First, get or create major_id
                    Integer majorId = null;
                    String academicMajor = (String) profileData.get("academicMajor");
                    if (academicMajor != null && !academicMajor.isEmpty()) {
                        ResultSet rs = null;
                        try {
                            ps = connection.prepareStatement("SELECT id FROM academic_majors WHERE name = ?");
                            ps.setString(1, academicMajor);
                            rs = ps.executeQuery();
                            if (rs.next()) {
                                majorId = rs.getInt("id");
                            } else {
                                // Insert new academic major if it doesn't exist
                                DBUtils.closeResultSet(rs);
                                DBUtils.closePreparedStatement(ps);
                                ps = connection.prepareStatement("INSERT INTO academic_majors (name) VALUES (?)", Statement.RETURN_GENERATED_KEYS);
                                ps.setString(1, academicMajor);
                                ps.executeUpdate();
                                rs = ps.getGeneratedKeys();
                                if (rs.next()) {
                                    majorId = rs.getInt(1);
                                }
                            }
                        } finally {
                            DBUtils.closeResultSet(rs);
                            DBUtils.closePreparedStatement(ps);
                        }
                    }
                    
                    // Next, get or create term_id
                    Integer termId = null;
                    String term = (String) profileData.get("term");
                    if (term != null && !term.isEmpty()) {
                        ResultSet rs = null;
                        try {
                            ps = connection.prepareStatement("SELECT id FROM Terms WHERE name = ?");
                            ps.setString(1, term);
                            rs = ps.executeQuery();
                            if (rs.next()) {
                                termId = rs.getInt("id");
                            } else {
                                // Insert new term if it doesn't exist
                                DBUtils.closeResultSet(rs);
                                DBUtils.closePreparedStatement(ps);
                                ps = connection.prepareStatement("INSERT INTO Terms (name) VALUES (?)", Statement.RETURN_GENERATED_KEYS);
                                ps.setString(1, term);
                                ps.executeUpdate();
                                rs = ps.getGeneratedKeys();
                                if (rs.next()) {
                                    termId = rs.getInt(1);
                                }
                            }
                        } finally {
                            DBUtils.closeResultSet(rs);
                            DBUtils.closePreparedStatement(ps);
                        }
                    }
                    
                    // Finally, update the student record
                    query = "UPDATE students SET gender = ?, date_of_birth = ?, class_id = ?, major_id = ?, term_id = ? WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setString(1, (String) profileData.get("gender"));
                    ps.setString(2, (String) profileData.get("dateOfBirth"));
                    ps.setString(3, (String) profileData.get("classId"));
                    
                    // Set the IDs (can be null)
                    if (majorId != null) {
                        ps.setInt(4, majorId);
                    } else {
                        ps.setNull(4, java.sql.Types.INTEGER);
                    }
                    
                    if (termId != null) {
                        ps.setInt(5, termId);
                    } else {
                        ps.setNull(5, java.sql.Types.INTEGER);
                    }
                    
                    ps.setInt(6, userId);
                    break;
                    
                case "lecturer":
                    query = "UPDATE lecturers SET department = ?, specializations = ? WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setString(1, (String) profileData.get("department"));
                    ps.setString(2, (String) profileData.get("specializations"));
                    ps.setInt(3, userId);
                    break;
                    
                case "outsrc_student":
                    query = "UPDATE outsource_students SET organization = ?, date_of_birth = ? WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setString(1, (String) profileData.get("organization"));
                    ps.setString(2, (String) profileData.get("dateOfBirth"));
                    ps.setInt(3, userId);
                    break;
                    
                case "guest":
                    query = "UPDATE guests SET institution_name = ?, access_reason = ? WHERE user_id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setString(1, (String) profileData.get("institutionName"));
                    ps.setString(2, (String) profileData.get("accessReason"));
                    ps.setInt(3, userId);
                    break;
                    
                case "admin":
                    // Admins don't have role-specific details in this system
                    return true;
                    
                default:
                    System.out.println("Unknown role: " + role);
                    return false;
            }
            
            // Execute the update for role-specific table
            if (ps != null) {
                int rowsAffected = ps.executeUpdate();
                System.out.println("Role-specific update rows affected: " + rowsAffected);
                success = rowsAffected > 0;
            }
        } catch (SQLException e) {
            System.err.println("Error in updateRoleSpecificDetails: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
        }
        
        return success;
    }

    /**
     * Updates a user's password
     * @param userId The user's ID
     * @param currentPassword The current password for verification
     * @param newPassword The new password to set
     * @return 1 if successful, 0 if current password is incorrect, -1 if user not found
     */
    public int updatePassword(Integer userId, String currentPassword, String newPassword) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            // First retrieve the current password hash
            String query = "SELECT password_hash FROM users WHERE id = ?";
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                String storedHash = rs.getString("password_hash");
                
                // Verify the current password
                BCrypt.Result result = BCrypt.verifyer().verify(currentPassword.toCharArray(), storedHash);
                
                if (result.verified) {
                    // Current password is correct, update to new password
                    DBUtils.closeResultSet(rs);
                    DBUtils.closePreparedStatement(ps);
                    
                    // Hash the new password
                    String newPasswordHash = BCrypt.withDefaults().hashToString(12, newPassword.toCharArray());
                    
                    // Update the password in the database
                    query = "UPDATE users SET password_hash = ? WHERE id = ?";
                    ps = connection.prepareStatement(query);
                    ps.setString(1, newPasswordHash);
                    ps.setInt(2, userId);
                    
                    int rowsAffected = ps.executeUpdate();
                    return rowsAffected > 0 ? 1 : -1; // 1 = success, -1 = user not found (shouldn't happen)
                } else {
                    // Current password is incorrect
                    return 0;
                }
            } else {
                // User not found
                return -1;
            }
        } catch (SQLException e) {
            System.err.println("Error updating password: " + e.getMessage());
            e.printStackTrace();
            return -1;
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
    }

    /**
     * Gets all users in the system with their details
     * @return List of user data maps
     */
    public List<Map<String, Object>> getAllUsers() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> users = new ArrayList<>();
        
        try {
            // Check if user_sessions table exists
            boolean userSessionsExists = false;
            try {
                Statement stmt = connection.createStatement();
                rs = stmt.executeQuery("SHOW TABLES LIKE 'user_sessions'");
                userSessionsExists = rs.next();
                DBUtils.closeResultSet(rs);
                DBUtils.closePreparedStatement(stmt);
            } catch (SQLException e) {
                // Ignore, assume table doesn't exist
                System.out.println("Error checking if user_sessions table exists: " + e.getMessage());
            }
            
            // Construct query based on table existence
            String query;
            if (userSessionsExists) {
                query = "SELECT u.*, " +
                       "(SELECT MAX(last_activity) FROM user_sessions WHERE user_id = u.id) as last_activity " +
                       "FROM users u ORDER BY u.id";
            } else {
                query = "SELECT u.*, NULL as last_activity FROM users u ORDER BY u.id";
            }
            
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", rs.getInt("id"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("role", rs.getString("role"));
                user.put("fullName", rs.getString("full_name"));
                user.put("phoneNumber", rs.getString("phone_number"));
                user.put("profileImageUrl", rs.getString("profile_image_url"));
                
                // Handle created_at (may not exist in older schema)
                try {
                    user.put("createdAt", rs.getTimestamp("created_at"));
                } catch (SQLException e) {
                    user.put("createdAt", null);
                }
                
                // Check if user is online (activity within last 15 minutes)
                java.sql.Timestamp lastActivity = rs.getTimestamp("last_activity");
                boolean isOnline = false;
                if (lastActivity != null) {
                    long fifteenMinutesAgo = System.currentTimeMillis() - (15 * 60 * 1000);
                    isOnline = lastActivity.getTime() > fifteenMinutesAgo;
                }
                user.put("isOnline", isOnline);
                user.put("lastActivity", lastActivity);
                
                // Load role-specific data
                loadRoleSpecificData(connection, user, rs.getString("role"), rs.getInt("id"));
                
                users.add(user);
            }
        } catch (SQLException e) {
            System.err.println("Error getting all users: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return users;
    }

    /**
     * Gets a specific user by their ID
     * @param userId The user's ID
     * @return User data map or null if not found
     */
    public Map<String, Object> getUserById(int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        Map<String, Object> user = null;
        
        try {
            // Check if user_sessions table exists
            boolean userSessionsExists = false;
            try {
                Statement stmt = connection.createStatement();
                rs = stmt.executeQuery("SHOW TABLES LIKE 'user_sessions'");
                userSessionsExists = rs.next();
                DBUtils.closeResultSet(rs);
                stmt.close(); // Use direct close to avoid the unreachable catch block
            } catch (SQLException e) {
                // Ignore, assume table doesn't exist
                System.out.println("Error checking if user_sessions table exists: " + e.getMessage());
            }
            
            // Construct query based on table existence
            String query;
            if (userSessionsExists) {
                query = "SELECT u.*, " +
                       "(SELECT MAX(last_activity) FROM user_sessions WHERE user_id = u.id) as last_activity " +
                       "FROM users u WHERE u.id = ?";
            } else {
                query = "SELECT u.*, NULL as last_activity FROM users u WHERE u.id = ?";
            }
            
            ps = connection.prepareStatement(query);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                user = new HashMap<>();
                user.put("id", rs.getInt("id"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("role", rs.getString("role"));
                user.put("fullName", rs.getString("full_name"));
                user.put("phoneNumber", rs.getString("phone_number"));
                user.put("profileImageUrl", rs.getString("profile_image_url"));
                
                // Handle created_at (may not exist in older schema)
                try {
                    user.put("createdAt", rs.getTimestamp("created_at"));
                } catch (SQLException e) {
                    user.put("createdAt", null);
                }
                
                // Check if user is online (activity within last 15 minutes)
                java.sql.Timestamp lastActivity = rs.getTimestamp("last_activity");
                boolean isOnline = false;
                if (lastActivity != null) {
                    long fifteenMinutesAgo = System.currentTimeMillis() - (15 * 60 * 1000);
                    isOnline = lastActivity.getTime() > fifteenMinutesAgo;
                }
                user.put("isOnline", isOnline);
                user.put("lastActivity", lastActivity);
                
                // Load role-specific data
                loadRoleSpecificData(connection, user, rs.getString("role"), rs.getInt("id"));
            }
        } catch (SQLException e) {
            System.err.println("Error getting user by ID: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return user;
    }

    /**
     * Updates user data as admin (can update more fields than regular users)
     * @param userId The user's ID
     * @param userData The updated user data
     * @return true if successful, false otherwise
     */
    public boolean updateUserByAdmin(int userId, Map<String, Object> userData) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // Begin transaction
            connection.setAutoCommit(false);
            
            // Build update query dynamically based on provided fields
            StringBuilder query = new StringBuilder("UPDATE users SET ");
            List<String> updateFields = new ArrayList<>();
            List<Object> parameters = new ArrayList<>();
            
            // Fields that can be updated
            if (userData.containsKey("username")) {
                updateFields.add("username = ?");
                parameters.add(userData.get("username"));
            }
            if (userData.containsKey("email")) {
                updateFields.add("email = ?");
                parameters.add(userData.get("email"));
            }
            if (userData.containsKey("fullName")) {
                updateFields.add("full_name = ?");
                parameters.add(userData.get("fullName"));
            }
            if (userData.containsKey("phoneNumber")) {
                updateFields.add("phone_number = ?");
                parameters.add(userData.get("phoneNumber"));
            }
            if (userData.containsKey("profileImageUrl")) {
                updateFields.add("profile_image_url = ?");
                parameters.add(userData.get("profileImageUrl"));
            }
            if (userData.containsKey("role")) {
                updateFields.add("role = ?");
                parameters.add(userData.get("role"));
            }
            
            // Add fields to query
            query.append(String.join(", ", updateFields));
            query.append(" WHERE id = ?");
            
            // Only proceed if there are fields to update
            if (!updateFields.isEmpty()) {
                ps = connection.prepareStatement(query.toString());
                
                // Set parameters
                for (int i = 0; i < parameters.size(); i++) {
                    ps.setObject(i + 1, parameters.get(i));
                }
                ps.setInt(parameters.size() + 1, userId);
                
                int rowsAffected = ps.executeUpdate();
                
                if (rowsAffected > 0) {
                    // Update role-specific details if needed
                    if (userData.containsKey("role")) {
                        String newRole = (String) userData.get("role");
                        // Handle role change logic here if needed
                    }
                    
                    // Update role-specific data if provided
                    boolean roleUpdateSuccess = updateRoleSpecificDetails(connection, userId, 
                            (String) userData.get("role"), userData);
                    
                    if (!roleUpdateSuccess) {
                        System.out.println("Warning: Failed to update role-specific details");
                        // Continue anyway, main data was updated
                    }
                    
                    // If password change is requested
                    if (userData.containsKey("newPassword")) {
                        String newPassword = (String) userData.get("newPassword");
                        if (newPassword != null && !newPassword.trim().isEmpty()) {
                            DBUtils.closePreparedStatement(ps);
                            
                            // Hash the new password
                            String newPasswordHash = BCrypt.withDefaults().hashToString(12, newPassword.toCharArray());
                            
                            // Update the password
                            ps = connection.prepareStatement("UPDATE users SET password_hash = ? WHERE id = ?");
                            ps.setString(1, newPasswordHash);
                            ps.setInt(2, userId);
                            ps.executeUpdate();
                        }
                    }
                    
                    connection.commit();
                    success = true;
                } else {
                    connection.rollback();
                }
            }
        } catch (SQLException e) {
            try {
                connection.rollback();
            } catch (SQLException ex) {
                System.err.println("Error rolling back: " + ex.getMessage());
            }
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                connection.setAutoCommit(true);
            } catch (SQLException e) {
                System.err.println("Error setting auto-commit: " + e.getMessage());
            }
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }

    /**
     * Deletes a user and all associated data
     * @param userId The user's ID
     * @return true if successful, false otherwise
     */
    public boolean deleteUser(int userId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            // Begin transaction
            connection.setAutoCommit(false);
            
            // First get the user's role
            String role = null;
            ps = connection.prepareStatement("SELECT role FROM users WHERE id = ?");
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                role = rs.getString("role");
            } else {
                // User not found
                return false;
            }
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            
            // Delete role-specific data
            if (role != null) {
                switch (role) {
                    case "student":
                        ps = connection.prepareStatement("DELETE FROM students WHERE user_id = ?");
                        ps.setInt(1, userId);
                        ps.executeUpdate();
                        break;
                    case "lecturer":
                        ps = connection.prepareStatement("DELETE FROM lecturers WHERE user_id = ?");
                        ps.setInt(1, userId);
                        ps.executeUpdate();
                        break;
                    case "outsrc_student":
                        ps = connection.prepareStatement("DELETE FROM outsource_students WHERE user_id = ?");
                        ps.setInt(1, userId);
                        ps.executeUpdate();
                        break;
                    case "guest":
                        ps = connection.prepareStatement("DELETE FROM guests WHERE user_id = ?");
                        ps.setInt(1, userId);
                        ps.executeUpdate();
                        break;
                    case "admin":
                        ps = connection.prepareStatement("DELETE FROM admins WHERE user_id = ?");
                        ps.setInt(1, userId);
                        ps.executeUpdate();
                        break;
                }
                DBUtils.closePreparedStatement(ps);
            }
            
            // Delete user sessions
            ps = connection.prepareStatement("DELETE FROM user_sessions WHERE user_id = ?");
            ps.setInt(1, userId);
            ps.executeUpdate();
            DBUtils.closePreparedStatement(ps);
            
            // Finally delete the user
            ps = connection.prepareStatement("DELETE FROM users WHERE id = ?");
            ps.setInt(1, userId);
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                connection.commit();
                success = true;
            } else {
                connection.rollback();
            }
        } catch (SQLException e) {
            try {
                connection.rollback();
            } catch (SQLException ex) {
                System.err.println("Error rolling back: " + ex.getMessage());
            }
            System.err.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                connection.setAutoCommit(true);
            } catch (SQLException e) {
                System.err.println("Error setting auto-commit: " + e.getMessage());
            }
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }

    /**
     * Gets statistics about students per class
     * @return Map with class IDs as keys and count as values, plus a "noClass" entry
     */
    public Map<String, Integer> getStudentClassStats() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        Map<String, Integer> stats = new HashMap<>();
        
        try {
            // Get count of students with no class
            String query = "SELECT COUNT(*) FROM students WHERE class_id IS NULL OR class_id = ''";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            if (rs.next()) {
                stats.put("noClass", rs.getInt(1));
            }
            
            // Get count per class
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            
            query = "SELECT class_id, COUNT(*) as count FROM students WHERE class_id IS NOT NULL AND class_id != '' GROUP BY class_id ORDER BY class_id";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                String classId = rs.getString("class_id");
                int count = rs.getInt("count");
                stats.put(classId, count);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting class statistics: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return stats;
    }
    
    /**
     * Gets distinct class IDs from the database
     * @return List of class IDs
     */
    public List<String> getAllClassIds() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<String> classIds = new ArrayList<>();
        
        try {
            String query = "SELECT DISTINCT c.class_name " +
                       "FROM students s " +
                       "JOIN classes c ON s.class_id = c.class_id " +
                       "WHERE s.class_id IS NOT NULL AND s.class_id != '' " +
                       "ORDER BY c.class_name";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                classIds.add(rs.getString("class_id"));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting class IDs: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return classIds;
    }

    /**
     * Gets a user's email from their username
     * @param username The username to look up
     * @return The email address or null if not found
     */
    public String getEmailFromUsername(String username) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        String email = null;
        
        try {
            String query = "SELECT email FROM users WHERE username = ?";
            ps = connection.prepareStatement(query);
            ps.setString(1, username);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                email = rs.getString("email");
            }
        } catch (SQLException e) {
            System.err.println("Error getting email from username: " + e.getMessage());
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return email;
    }
    
    /**
     * Check if an account exists with the given login (username or email)
     * @param login The username or email to check
     * @return true if account exists, false otherwise
     */
    public boolean checkAccountExists(String login) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        boolean exists = false;
        
        try {
            String query = "SELECT 1 FROM users WHERE username = ? OR email = ?";
            ps = connection.prepareStatement(query);
            ps.setString(1, login);
            ps.setString(2, login);
            rs = ps.executeQuery();
            
            exists = rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking if account exists: " + e.getMessage());
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return exists;
    }

    /**
     * Search for users by name or username
     * 
     * @param searchTerm The search term to match against name or username
     * @return List of matching users with basic info
     */
    public List<Map<String, Object>> searchUsers(String searchTerm) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Map<String, Object>> users = new ArrayList<>();
        
        try {
            String query = "SELECT id, username, full_name, email, role, profile_image_url " +
                          "FROM users " +
                          "WHERE full_name LIKE ? OR username LIKE ? " +
                          "ORDER BY full_name " +
                          "LIMIT 20";
            
            ps = connection.prepareStatement(query);
            String likePattern = "%" + searchTerm + "%";
            ps.setString(1, likePattern);
            ps.setString(2, likePattern);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", rs.getInt("id"));
                user.put("username", rs.getString("username"));
                user.put("fullName", rs.getString("full_name"));
                user.put("email", rs.getString("email"));
                user.put("role", rs.getString("role"));
                user.put("profileImageUrl", rs.getString("profile_image_url"));
                users.add(user);
            }
            
        } catch (SQLException e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return users;
    }

    /**
     * Count students by class ID
     * 
     * @param classId The class ID
     * @return Number of students in the class
     */
    public int countStudentsByClassId(String classId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        int count = 0;
        
        try {
            String query = "SELECT COUNT(*) AS count FROM students WHERE class_id = ?";
            ps = connection.prepareStatement(query);
            ps.setString(1, classId);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                count = rs.getInt("count");
            }
        } catch (SQLException e) {
            System.err.println("Error counting students by class ID: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return count;
    }
} 