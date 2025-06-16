package dao;

import connection.ConnectionPool;
import connection.DBUtils;
import model.ClassGroup;
import model.Student;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ClassDAO {
    private static ClassDAO instance;
    
    private ClassDAO() {
        // Private constructor for singleton pattern
    }
    
    public static synchronized ClassDAO getInstance() {
        if (instance == null) {
            instance = new ClassDAO();
        }
        return instance;
    }
    
    /**
     * Get all unique class IDs with student counts
     * @return List of ClassGroup objects
     */
    public List<ClassGroup> getAllClasses() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<ClassGroup> classes = new ArrayList<>();
        
        try {
            // Join with users table to get additional information
            String query = "SELECT s.class_id, COUNT(*) as student_count " +
                          "FROM students s " +
                          "WHERE s.class_id IS NOT NULL AND s.class_id != '' " +
                          "GROUP BY s.class_id ORDER BY s.class_id";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                String classId = rs.getString("class_id");
                int count = rs.getInt("student_count");
                
                // Create a class object with available information
                ClassGroup classGroup = new ClassGroup(
                    classId,
                    "Class " + classId, // Default name based on ID
                    count,
                    "Current", // Default academic year
                    true      // Default active status
                );
                
                classes.add(classGroup);
            }
        } catch (SQLException e) {
            System.err.println("Error getting classes: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return classes;
    }
    
    /**
     * Get students by class ID
     * @param classId The class ID to search for
     * @return List of Student objects in the specified class
     */
    public List<Student> getStudentsByClass(String classId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Student> students = new ArrayList<>();
        
        try {
            String query = "SELECT s.student_id, s.user_id, u.full_name, u.email, " +
                          "s.date_of_birth, s.gender, s.class_id, s.academic_major, s.enrollment_term " +
                          "FROM students s " +
                          "JOIN users u ON s.user_id = u.id " +
                          "WHERE s.class_id = ? " +
                          "ORDER BY u.full_name";
            ps = connection.prepareStatement(query);
            ps.setString(1, classId);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Student student = new Student(
                    rs.getString("student_id"),
                    rs.getInt("user_id"),
                    rs.getString("full_name"),
                    rs.getString("email"),
                    rs.getString("date_of_birth"),
                    rs.getString("gender"),
                    rs.getString("class_id"),
                    rs.getString("academic_major"),
                    rs.getString("enrollment_term")
                );
                
                students.add(student);
            }
        } catch (SQLException e) {
            System.err.println("Error getting students by class: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return students;
    }
    
    /**
     * Get all students
     * @return List of all Student objects
     */
    public List<Student> getAllStudents() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Student> students = new ArrayList<>();
        
        try {
            String query = "SELECT s.student_id, s.user_id, u.full_name, u.email, " +
                          "s.date_of_birth, s.gender, s.class_id, s.academic_major, s.enrollment_term " +
                          "FROM students s " +
                          "JOIN users u ON s.user_id = u.id " +
                          "ORDER BY u.full_name";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                Student student = new Student(
                    rs.getString("student_id"),
                    rs.getInt("user_id"),
                    rs.getString("full_name"),
                    rs.getString("email"),
                    rs.getString("date_of_birth"),
                    rs.getString("gender"),
                    rs.getString("class_id"),
                    rs.getString("academic_major"),
                    rs.getString("enrollment_term")
                );
                
                students.add(student);
            }
        } catch (SQLException e) {
            System.err.println("Error getting all students: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return students;
    }
    
    /**
     * Update a student's class assignment
     * @param studentId The student ID to update
     * @param classId The new class ID (can be null or empty to remove from class)
     * @return true if successful, false otherwise
     */
    public boolean updateStudentClass(String studentId, String classId) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            String query = "UPDATE students SET class_id = ? WHERE student_id = ?";
            ps = connection.prepareStatement(query);
            
            if (classId == null || classId.isEmpty()) {
                ps.setNull(1, java.sql.Types.VARCHAR);
            } else {
                ps.setString(1, classId);
            }
            
            ps.setString(2, studentId);
            
            int rowsAffected = ps.executeUpdate();
            success = rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error updating student class: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Update student details
     * @param student The student object with updated details
     * @return true if successful, false otherwise
     */
    public boolean updateStudent(Student student) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        boolean success = false;
        
        try {
            String query = "UPDATE students SET date_of_birth = ?, gender = ?, " +
                          "class_id = ?, academic_major = ?, enrollment_term = ? " +
                          "WHERE student_id = ?";
            ps = connection.prepareStatement(query);
            
            // Handle possible null values
            if (student.getDateOfBirth() == null || student.getDateOfBirth().isEmpty()) {
                ps.setNull(1, java.sql.Types.DATE);
            } else {
                ps.setString(1, student.getDateOfBirth());
            }
            
            ps.setString(2, student.getGender());
            
            if (student.getClassId() == null || student.getClassId().isEmpty()) {
                ps.setNull(3, java.sql.Types.VARCHAR);
            } else {
                ps.setString(3, student.getClassId());
            }
            
            ps.setString(4, student.getAcademicMajor());
            ps.setString(5, student.getEnrollmentTerm());
            ps.setString(6, student.getStudentId());
            
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                // If student details were updated, also update the user's name
                DBUtils.closePreparedStatement(ps);
                
                query = "UPDATE users SET full_name = ? WHERE id = ?";
                ps = connection.prepareStatement(query);
                ps.setString(1, student.getFullName());
                ps.setInt(2, student.getUserId());
                
                rowsAffected = ps.executeUpdate();
                success = rowsAffected > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error updating student: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtils.closePreparedStatement(ps);
            pool.freeConnection(connection);
        }
        
        return success;
    }
    
    /**
     * Get class statistics for chart display
     * @return Map with class IDs as keys and student counts as values
     */
    public Map<String, Integer> getClassStatistics() {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        Map<String, Integer> stats = new HashMap<>();
        
        try {
            String query = "SELECT class_id, COUNT(*) as count " +
                          "FROM students " +
                          "WHERE class_id IS NOT NULL AND class_id != '' " +
                          "GROUP BY class_id ORDER BY class_id";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            
            while (rs.next()) {
                String classId = rs.getString("class_id");
                int count = rs.getInt("count");
                stats.put(classId, count);
            }
            
            // Also get count of students with no class
            DBUtils.closeResultSet(rs);
            DBUtils.closePreparedStatement(ps);
            
            query = "SELECT COUNT(*) FROM students WHERE class_id IS NULL OR class_id = ''";
            ps = connection.prepareStatement(query);
            rs = ps.executeQuery();
            if (rs.next()) {
                stats.put("Unassigned", rs.getInt(1));
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
} 