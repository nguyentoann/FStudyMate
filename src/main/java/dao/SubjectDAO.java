package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import model.Subject;

public class SubjectDAO {

    public static List<Subject> getAllSubjects() {
        List<Subject> subjects = new ArrayList<>();
        
        // Get connection from the pool
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        // SQL query
        String sql = "SELECT * FROM Subjects";
        ConnectionPool.logQuery(sql);
        System.out.println("[DEBUG] Fetching all subjects");
        
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            ps = connection.prepareStatement(sql);
            rs = ps.executeQuery();
            
            int count = 0;
            while (rs.next()) {
                Subject subject = new Subject();
                subject.setId(rs.getInt("ID"));
                subject.setCode(rs.getString("Code"));
                subject.setName(rs.getString("Name"));
                subject.setActive(rs.getBoolean("Active"));
                
                // Get TermNo if exists
                try {
                    Integer termNo = rs.getInt("TermNo");
                    if (!rs.wasNull()) {
                        subject.setTermNo(termNo);
                    }
                } catch (SQLException e) {
                    // TermNo column might not exist in older database versions
                    System.out.println("[DEBUG] TermNo column not found: " + e.getMessage());
                }
                
                subjects.add(subject);
                count++;
                System.out.println("[DEBUG] Found subject: ID=" + subject.getId() + 
                                  ", Code=" + subject.getCode() + 
                                  ", Name=" + subject.getName() + 
                                  ", TermNo=" + subject.getTermNo());
            }
            
            System.out.println("[DEBUG] Total subjects found: " + count);
            
            if (count == 0) {
                // If no subjects found, verify table existence
                verifyTableExists(connection, "Subjects");
            }
        } catch (SQLException e) {
            System.out.println("Error fetching subjects: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return subjects;
    }
    
    public static Subject getSubjectById(int id) {
        Subject subject = null;
        
        // Get connection from the pool
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        
        // SQL query
        String sql = "SELECT * FROM Subjects WHERE ID = ?";
        ConnectionPool.logQuery(sql, id);
        System.out.println("[DEBUG] Fetching subject with ID: " + id);
        
        PreparedStatement ps = null;
        ResultSet rs = null;
        
        try {
            ps = connection.prepareStatement(sql);
            ps.setInt(1, id);
            rs = ps.executeQuery();
            
            if (rs.next()) {
                subject = new Subject();
                subject.setId(rs.getInt("ID"));
                subject.setCode(rs.getString("Code"));
                subject.setName(rs.getString("Name"));
                subject.setActive(rs.getBoolean("Active"));
                
                // Get TermNo if exists
                try {
                    Integer termNo = rs.getInt("TermNo");
                    if (!rs.wasNull()) {
                        subject.setTermNo(termNo);
                    }
                } catch (SQLException e) {
                    // TermNo column might not exist in older database versions
                    System.out.println("[DEBUG] TermNo column not found: " + e.getMessage());
                }
                
                System.out.println("[DEBUG] Found subject: ID=" + subject.getId() + 
                                  ", Code=" + subject.getCode() + 
                                  ", Name=" + subject.getName() + 
                                  ", TermNo=" + subject.getTermNo());
            } else {
                System.out.println("[DEBUG] No subject found with ID: " + id);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching subject: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return subject;
    }
    
    // Helper method to verify if a table exists
    private static void verifyTableExists(Connection connection, String tableName) {
        try {
            String query = "SHOW TABLES LIKE ?";
            ConnectionPool.logQuery(query, tableName);
            
            try (PreparedStatement ps = connection.prepareStatement(query)) {
                ps.setString(1, tableName);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        System.out.println("[DEBUG] Table '" + tableName + "' exists in the database");
                    } else {
                        System.out.println("[DEBUG] Table '" + tableName + "' DOES NOT exist in the database");
                        
                        // List all tables for debugging
                        listAllTables(connection);
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("[DEBUG] Error verifying table existence: " + e.getMessage());
        }
    }
    
    // Helper method to list all tables in the database
    private static void listAllTables(Connection connection) {
        try {
            String query = "SHOW TABLES";
            ConnectionPool.logQuery(query);
            
            System.out.println("[DEBUG] Listing all tables in database:");
            try (PreparedStatement ps = connection.prepareStatement(query);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    System.out.println("[DEBUG] Table: " + rs.getString(1));
                }
            }
        } catch (SQLException e) {
            System.out.println("[DEBUG] Error listing tables: " + e.getMessage());
        }
    }
    
    // This method is just for demonstration - it creates mock data for testing
    public static List<Subject> getMockSubjects() {
        List<Subject> subjects = new ArrayList<>();
        subjects.add(new Subject(1, "PRO192", "Programming", true, 1));
        subjects.add(new Subject(2, "WEB101", "Web Development", false, 2));
        subjects.add(new Subject(3, "DSA201", "Data Structures", false, 2));
        subjects.add(new Subject(4, "ALG101", "Algorithms", false, 3));
        subjects.add(new Subject(5, "DBI202", "Databases", false, 3));
        return subjects;
    }
} 