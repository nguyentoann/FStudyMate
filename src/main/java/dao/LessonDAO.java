package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import model.Lesson;
import model.User;

public class LessonDAO {

    public static List<Lesson> getAllLessons() {
        List<Lesson> lessons = new ArrayList<>();
        
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        String sql = "SELECT l.*, u.full_name, u.Email, u.Username, u.profile_image_url " +
                     "FROM Lessons l " +
                     "LEFT JOIN users u ON l.LecturerId = u.ID";
        
        // Add query logging for direct MySQL execution
        System.out.println("===== MYSQL QUERY FOR DIRECT EXECUTION =====");
        System.out.println(sql + ";");
        System.out.println("=============================================");
        
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            ps = connection.prepareStatement(sql);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Lesson lesson = mapResultSetToLesson(rs);
                lessons.add(lesson);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching all lessons: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return lessons;
    }
    
    public static List<Lesson> getLessonsBySubject(int subjectId) {
        List<Lesson> lessons = new ArrayList<>();
        
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        String sql = "SELECT l.*, u.full_name, u.Email, u.Username, u.profile_image_url " +
                     "FROM Lessons l " +
                     "LEFT JOIN users u ON l.LecturerId = u.ID " +
                     "WHERE l.SubjectId = ?";
        
        // Add enhanced query logging for direct MySQL execution
        System.out.println("===== MYSQL QUERY FOR DIRECT EXECUTION =====");
        String executableSql = sql.replace("?", String.valueOf(subjectId));
        System.out.println(executableSql + ";");
        System.out.println("=============================================");
        
        ConnectionPool.logQuery(sql, subjectId);
        System.out.println("[DEBUG] Fetching lessons for subjectId: " + subjectId);
                     
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            ps = connection.prepareStatement(sql);
            ps.setInt(1, subjectId);
            rs = ps.executeQuery();
            
            int count = 0;
            while (rs.next()) {
                Lesson lesson = mapResultSetToLesson(rs);
                lessons.add(lesson);
                count++;
                System.out.println("[DEBUG] Found lesson: ID=" + lesson.getId() + ", Title=" + lesson.getTitle());
            }
            
            System.out.println("[DEBUG] Total lessons found for subject " + subjectId + ": " + count);
            
            if (count == 0) {
                System.out.println("[DEBUG] Checking if subject exists...");
                
                // Check if the subject exists
                String checkSubjectSql = "SELECT COUNT(*) FROM Subjects WHERE ID = ?";
                // Add direct executable version
                System.out.println("===== SUBJECT CHECK QUERY =====");
                System.out.println(checkSubjectSql.replace("?", String.valueOf(subjectId)) + ";");
                System.out.println("===============================");
                
                ConnectionPool.logQuery(checkSubjectSql, subjectId);
                
                try (PreparedStatement checkPs = connection.prepareStatement(checkSubjectSql)) {
                    checkPs.setInt(1, subjectId);
                    try (ResultSet checkRs = checkPs.executeQuery()) {
                        if (checkRs.next() && checkRs.getInt(1) > 0) {
                            System.out.println("[DEBUG] Subject exists, but no lessons found");
                        } else {
                            System.out.println("[DEBUG] Subject does not exist: " + subjectId);
                        }
                    }
                }
                
                // If no lessons found, dump all lessons for debugging
                System.out.println("[DEBUG] Dumping all lessons in database for debugging:");
                
                String allLessonsSql = "SELECT ID, SubjectId, Title FROM Lessons";
                // Add direct executable version
                System.out.println("===== ALL LESSONS QUERY =====");
                System.out.println(allLessonsSql + ";");
                System.out.println("============================");
                
                ConnectionPool.logQuery(allLessonsSql);
                
                try (PreparedStatement allPs = connection.prepareStatement(allLessonsSql);
                     ResultSet allRs = allPs.executeQuery()) {
                    while (allRs.next()) {
                        System.out.println("[DEBUG] Lesson - ID: " + allRs.getInt("ID") + 
                                         ", SubjectId: " + allRs.getInt("SubjectId") + 
                                         ", Title: " + allRs.getString("Title"));
                    }
                }
                
                // Add query to check database charset and collation
                String charsetQuery = "SHOW VARIABLES LIKE 'character\\_set\\_%';";
                System.out.println("===== DATABASE CHARSET QUERY =====");
                System.out.println(charsetQuery);
                System.out.println("=================================");
                
                try (PreparedStatement charsetPs = connection.prepareStatement(charsetQuery);
                     ResultSet charsetRs = charsetPs.executeQuery()) {
                    System.out.println("[DEBUG] Database character set variables:");
                    while (charsetRs.next()) {
                        System.out.println("[DEBUG] " + charsetRs.getString(1) + " = " + charsetRs.getString(2));
                    }
                }
                
                // Add query to check table structure
                String tableStructureQuery = "DESCRIBE Lessons;";
                System.out.println("===== TABLE STRUCTURE QUERY =====");
                System.out.println(tableStructureQuery);
                System.out.println("================================");
                
                try (PreparedStatement structPs = connection.prepareStatement(tableStructureQuery);
                     ResultSet structRs = structPs.executeQuery()) {
                    System.out.println("[DEBUG] Lessons table structure:");
                    while (structRs.next()) {
                        System.out.println("[DEBUG] Field: " + structRs.getString("Field") + 
                                        ", Type: " + structRs.getString("Type") + 
                                        ", Null: " + structRs.getString("Null") + 
                                        ", Key: " + structRs.getString("Key") + 
                                        ", Default: " + structRs.getString("Default"));
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Error fetching lessons by subject: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return lessons;
    }
    
    public static Lesson getLessonById(int id) {
        Lesson lesson = null;
        
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        String sql = "SELECT l.*, u.full_name, u.Email, u.Username, u.profile_image_url " +
                     "FROM Lessons l " +
                     "LEFT JOIN users u ON l.LecturerId = u.ID " +
                     "WHERE l.ID = ?";
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            ps = connection.prepareStatement(sql);
            ps.setInt(1, id);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                lesson = mapResultSetToLesson(rs);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching lesson by ID: " + e.getMessage());
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return lesson;
    }
    
    public static int createLesson(Lesson lesson) {
        int generatedId = -1;
        
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        String sql = "INSERT INTO Lessons (SubjectId, Title, Content, Date, LecturerId, Likes, ViewCount) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, lesson.getSubjectId());
            ps.setString(2, lesson.getTitle());
            ps.setString(3, lesson.getContent());
            ps.setTimestamp(4, new Timestamp(lesson.getDate().getTime()));
            ps.setInt(5, lesson.getLecturerId());
            ps.setInt(6, lesson.getLikes());
            ps.setInt(7, lesson.getViewCount());
            
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    generatedId = rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error creating lesson: " + e.getMessage());
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return generatedId;
    }
    
    public static boolean updateLesson(Lesson lesson) {
        boolean success = false;
        
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        String sql = "UPDATE Lessons SET SubjectId = ?, Title = ?, Content = ?, " +
                     "LecturerId = ?, Likes = ?, ViewCount = ? WHERE ID = ?";
        PreparedStatement ps = null;
        
        try {
            ps = connection.prepareStatement(sql);
            ps.setInt(1, lesson.getSubjectId());
            ps.setString(2, lesson.getTitle());
            ps.setString(3, lesson.getContent());
            ps.setInt(4, lesson.getLecturerId());
            ps.setInt(5, lesson.getLikes());
            ps.setInt(6, lesson.getViewCount());
            ps.setInt(7, lesson.getId());
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
        } catch (SQLException e) {
            System.out.println("Error updating lesson: " + e.getMessage());
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    public static boolean deleteLesson(int id) {
        boolean success = false;
        
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        String sql = "DELETE FROM Lessons WHERE ID = ?";
        PreparedStatement ps = null;
        
        try {
            ps = connection.prepareStatement(sql);
            ps.setInt(1, id);
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
        } catch (SQLException e) {
            System.out.println("Error deleting lesson: " + e.getMessage());
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    // Helper method to map ResultSet to Lesson object
    private static Lesson mapResultSetToLesson(ResultSet rs) throws SQLException {
        Lesson lesson = new Lesson();
        
        lesson.setId(rs.getInt("ID"));
        lesson.setSubjectId(rs.getInt("SubjectId"));
        lesson.setTitle(rs.getString("Title"));
        lesson.setContent(rs.getString("Content"));
        lesson.setDate(new Date(rs.getTimestamp("Date").getTime()));
        lesson.setLecturerId(rs.getInt("LecturerId"));
        lesson.setLikes(rs.getInt("Likes"));
        lesson.setViewCount(rs.getInt("ViewCount"));
        
        // Create User object for lecturer if LecturerId exists
        if (rs.getInt("LecturerId") > 0) {
            User lecturer = new User();
            lecturer.setId(rs.getInt("LecturerId"));
            
            // These fields will be available from the JOIN with Users table
            if (rs.getString("full_name") != null) {
                lecturer.setFullName(rs.getString("full_name"));
            }
            
            if (rs.getString("Email") != null) {
                lecturer.setEmail(rs.getString("Email"));
            }
            
            if (rs.getString("Username") != null) {
                lecturer.setUsername(rs.getString("Username"));
            }
            
            if (rs.getString("profile_image_url") != null) {
                lecturer.setProfileImageUrl(rs.getString("profile_image_url"));
            }
            
            lesson.setLecturer(lecturer);
        }
        
        return lesson;
    }
    
    // This method is just for demonstration - it creates mock data for testing
    public static List<Lesson> getMockLessonsBySubject(int subjectId) {
        List<Lesson> lessons = new ArrayList<>();
        
        if (subjectId == 1) {
            Lesson lesson1 = new Lesson();
            lesson1.setId(1);
            lesson1.setSubjectId(1);
            lesson1.setTitle("Introduction to Programming Basics");
            lesson1.setContent("# Programming Fundamentals\n\nThis lesson covers the core concepts every programmer should know.\n\n## Variables and Data Types\n\nVariables are containers for storing data values. In most programming languages, you declare a variable before using it.\n\n```javascript\n// JavaScript example\nlet name = \"John\";\nconst age = 25;\nvar isStudent = true;\n```\n\n## Control Structures\n\nControl structures direct the flow of execution in a program.\n\n* **If statements** for conditional execution\n* **Loops** for repeated execution\n* **Switch statements** for multiple conditions");
            lesson1.setDate(new Date());
            lesson1.setLecturerId(101);
            lesson1.setLikes(24);
            
            // Create lecturer user
            User lecturer1 = new User();
            lecturer1.setId(101);
            lecturer1.setFullName("Dr. Jane Smith");
            lecturer1.setProfileImageUrl("https://via.placeholder.com/40");
            lesson1.setLecturer(lecturer1);
            
            lessons.add(lesson1);
            
            Lesson lesson2 = new Lesson();
            lesson2.setId(2);
            lesson2.setSubjectId(1);
            lesson2.setTitle("Working with Functions");
            lesson2.setContent("# Functions in Programming\n\nFunctions are blocks of code designed to perform a particular task and can be reused throughout your code.\n\n## Function Syntax\n\n```python\n# Python example\ndef greet(name):\n    return f\"Hello, {name}!\"\n\n# Calling the function\nmessage = greet(\"Alice\")\nprint(message)  # Outputs: Hello, Alice!\n```");
            lesson2.setDate(new Date());
            lesson2.setLecturerId(102);
            lesson2.setLikes(15);
            
            // Create lecturer user
            User lecturer2 = new User();
            lecturer2.setId(102);
            lecturer2.setFullName("Prof. Michael Johnson");
            lecturer2.setProfileImageUrl("https://via.placeholder.com/40");
            lesson2.setLecturer(lecturer2);
            
            lessons.add(lesson2);
        } else if (subjectId == 2) {
            Lesson lesson3 = new Lesson();
            lesson3.setId(3);
            lesson3.setSubjectId(2);
            lesson3.setTitle("HTML & CSS Fundamentals");
            lesson3.setContent("# Web Development Basics\n\nHTML and CSS are the foundation of web development.\n\n## HTML Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My First Webpage</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>\n```");
            lesson3.setDate(new Date());
            lesson3.setLecturerId(103);
            lesson3.setLikes(32);
            
            // Create lecturer user
            User lecturer3 = new User();
            lecturer3.setId(103);
            lecturer3.setFullName("Prof. Sarah Williams");
            lecturer3.setProfileImageUrl("https://via.placeholder.com/40");
            lesson3.setLecturer(lecturer3);
            
            lessons.add(lesson3);
        }
        
        return lessons;
    }

    // Add a method to initialize database with sample lessons if needed
    public static void initializeDatabaseWithSampleLessons() {
        // Check if lessons already exist
        List<Lesson> existingLessons = getAllLessons();
        if (existingLessons.isEmpty()) {
            System.out.println("No lessons found in database. Creating sample lessons...");
            
            // Create sample subjects if they don't exist
            ensureSubjectsExist();
            
            // Create sample lessons
            createSampleLessons();
        }
    }
    
    private static void ensureSubjectsExist() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        PreparedStatement checkPs = null;
        PreparedStatement insertPs = null;
        ResultSet rs = null;
        
        try {
            // Check if subjects exist
            checkPs = connection.prepareStatement("SELECT COUNT(*) FROM Subjects");
            rs = checkPs.executeQuery();
            
            int count = 0;
            if (rs.next()) {
                count = rs.getInt(1);
            }
            
            if (count == 0) {
                // Insert sample subjects
                String[] subjectNames = {"Programming Basics", "Web Development", "Database Systems"};
                
                insertPs = connection.prepareStatement("INSERT INTO Subjects (Name, Active) VALUES (?, true)");
                
                for (String name : subjectNames) {
                    insertPs.setString(1, name);
                    insertPs.executeUpdate();
                }
                
                System.out.println("Created sample subjects");
            }
        } catch (SQLException e) {
            System.out.println("Error ensuring subjects exist: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(checkPs);
            DBUtils.closePreparedStatement(insertPs);
            pool.freeConnection(connection);
        }
    }
    
    private static void createSampleLessons() {
        // Create sample lessons
        List<Lesson> sampleLessons = getSampleLessons();
        for (Lesson lesson : sampleLessons) {
            createLesson(lesson);
        }
        
        System.out.println("Created sample lessons in database");
    }
    
    private static List<Lesson> getSampleLessons() {
        List<Lesson> lessons = new ArrayList<>();
        
        // Create a sample user if needed
        int lecturerId = ensureSampleLecturerExists();
        
        // Sample lesson 1
        Lesson lesson1 = new Lesson();
        lesson1.setSubjectId(1); // Programming Basics
        lesson1.setTitle("Introduction to Programming Basics");
        lesson1.setContent("# Programming Fundamentals\n\nThis lesson covers the core concepts every programmer should know.\n\n## Variables and Data Types\n\nVariables are containers for storing data values. In most programming languages, you declare a variable before using it.\n\n```javascript\n// JavaScript example\nlet name = \"John\";\nconst age = 25;\nvar isStudent = true;\n```\n\n## Control Structures\n\nControl structures direct the flow of execution in a program.\n\n* **If statements** for conditional execution\n* **Loops** for repeated execution\n* **Switch statements** for multiple conditions");
        lesson1.setLecturerId(lecturerId);
        lesson1.setLikes(24);
        lesson1.setViewCount(42);
        lessons.add(lesson1);
        
        // Sample lesson 2
        Lesson lesson2 = new Lesson();
        lesson2.setSubjectId(1); // Programming Basics
        lesson2.setTitle("Working with Functions");
        lesson2.setContent("# Functions in Programming\n\nFunctions are blocks of code designed to perform a particular task and can be reused throughout your code.\n\n## Function Syntax\n\n```python\n# Python example\ndef greet(name):\n    return f\"Hello, {name}!\"\n\n# Calling the function\nmessage = greet(\"Alice\")\nprint(message)  # Outputs: Hello, Alice!\n```");
        lesson2.setLecturerId(lecturerId);
        lesson2.setLikes(15);
        lesson2.setViewCount(30);
        lessons.add(lesson2);
        
        // Sample lesson 3
        Lesson lesson3 = new Lesson();
        lesson3.setSubjectId(2); // Web Development
        lesson3.setTitle("HTML & CSS Fundamentals");
        lesson3.setContent("# Web Development Basics\n\nHTML and CSS are the foundation of web development.\n\n## HTML Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My First Webpage</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>\n```");
        lesson3.setLecturerId(lecturerId);
        lesson3.setLikes(32);
        lesson3.setViewCount(61);
        lessons.add(lesson3);
        
        return lessons;
    }
    
    private static int ensureSampleLecturerExists() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        PreparedStatement checkPs = null;
        PreparedStatement insertPs = null;
        ResultSet rs = null;
        int lecturerId = -1;
        
        try {
            // Check if lecturer exists
            checkPs = connection.prepareStatement(
                "SELECT ID FROM users WHERE RoleID = 2 LIMIT 1");
            rs = checkPs.executeQuery();
            
            if (rs.next()) {
                lecturerId = rs.getInt("ID");
            } else {
                // Create a sample lecturer
                insertPs = connection.prepareStatement(
                    "INSERT INTO users (Username, Password, Email, full_name, RoleID, profile_image_url) " +
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
                
                insertPs.setString(1, "professor");
                insertPs.setString(2, "password123"); // In a real app, this would be hashed
                insertPs.setString(3, "professor@example.com");
                insertPs.setString(4, "Dr. John Doe");
                insertPs.setInt(5, 2); // Lecturer role
                insertPs.setString(6, "https://via.placeholder.com/150");
                
                insertPs.executeUpdate();
                
                try (ResultSet generatedKeys = insertPs.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        lecturerId = generatedKeys.getInt(1);
                    }
                }
                
                System.out.println("Created sample lecturer with ID: " + lecturerId);
            }
        } catch (SQLException e) {
            System.out.println("Error ensuring sample lecturer exists: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(checkPs);
            DBUtils.closePreparedStatement(insertPs);
            pool.freeConnection(connection);
        }
        
        return lecturerId;
    }
} 