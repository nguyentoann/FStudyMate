package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.model.AcademicMajor;
import com.mycompany.fstudymate.model.Term;
import com.mycompany.fstudymate.service.ClassService;
import com.mycompany.fstudymate.service.UserActivityService;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.repository.AcademicMajorRepository;
import com.mycompany.fstudymate.repository.TermRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.lang.reflect.Field;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    @Autowired
    private ClassService classService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AcademicMajorRepository academicMajorRepository;
    
    @Autowired
    private TermRepository termRepository;
    
    @Autowired
    private DataSource dataSource;
    
    // Class Management Endpoints
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllClasses() {
        try {
            List<Class> classes = classService.getAllClasses();
            List<Map<String, Object>> classesResponse = classes.stream().map(classObj -> {
                Map<String, Object> classMap = new HashMap<>();
                classMap.put("classId", classObj.getClassId());
                classMap.put("className", classObj.getClassName());
                
                // Handle Term consistently
                Map<String, Object> termMap = new HashMap<>();
                if (classObj.getTerm() != null) {
                    termMap.put("id", classObj.getTerm().getId());
                    termMap.put("name", classObj.getTerm().getName());
                } else {
                    // If term is just an ID (not fully loaded)
                    try {
                        Integer termId = null;
                        Field termField = classObj.getClass().getDeclaredField("term");
                        termField.setAccessible(true);
                        Object termValue = termField.get(classObj);
                        if (termValue instanceof Integer) {
                            termId = (Integer) termValue;
                            Optional<Term> termOpt = termRepository.findById(termId);
                            if (termOpt.isPresent()) {
                                Term term = termOpt.get();
                                termMap.put("id", term.getId());
                                termMap.put("name", term.getName());
                            } else {
                                termMap.put("id", termId);
                                termMap.put("name", "Unknown");
                            }
                        }
                    } catch (Exception e) {
                        // Fallback
                        termMap.put("id", null);
                        termMap.put("name", "Unknown");
                    }
                }
                classMap.put("term", termMap);
                
                // Add semester and academic year from term name
                String termName = (String) termMap.get("name");
                if (termName != null) {
                    classMap.put("semester", termName);
                    classMap.put("academicYear", termName);
                }
                
                // Handle AcademicMajor consistently
                Map<String, Object> majorMap = new HashMap<>();
                if (classObj.getAcademicMajor() != null) {
                    majorMap.put("id", classObj.getAcademicMajor().getId());
                    majorMap.put("name", classObj.getAcademicMajor().getName());
                } else {
                    // If academicMajor is just an ID (not fully loaded)
                    try {
                        Integer majorId = null;
                        Field majorField = classObj.getClass().getDeclaredField("academicMajor");
                        majorField.setAccessible(true);
                        Object majorValue = majorField.get(classObj);
                        if (majorValue instanceof Integer) {
                            majorId = (Integer) majorValue;
                            Optional<AcademicMajor> majorOpt = academicMajorRepository.findById(majorId);
                            if (majorOpt.isPresent()) {
                                AcademicMajor major = majorOpt.get();
                                majorMap.put("id", major.getId());
                                majorMap.put("name", major.getName());
                            } else {
                                majorMap.put("id", majorId);
                                majorMap.put("name", "Unknown");
                            }
                        }
                    } catch (Exception e) {
                        // Fallback
                        majorMap.put("id", null);
                        majorMap.put("name", "Unknown");
                    }
                }
                classMap.put("academicMajor", majorMap);
                
                // Add department from academic major
                classMap.put("department", majorMap.get("name"));
                
                classMap.put("maxStudents", classObj.getMaxStudents());
                classMap.put("currentStudents", classObj.getCurrentStudents());
                classMap.put("homeroomTeacherId", classObj.getHomeroomTeacherId());
                classMap.put("isActive", classObj.getIsActive());
                classMap.put("createdAt", classObj.getCreatedAt());
                classMap.put("updatedAt", classObj.getUpdatedAt());
                
                return classMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(classesResponse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Class>> getActiveClasses() {
        try {
            List<Class> classes = classService.getActiveClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{classId}")
    public ResponseEntity<Class> getClassById(@PathVariable String classId) {
        try {
            Optional<Class> classObj = classService.getClassById(classId);
            return classObj.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Class> createClass(@RequestBody Class classObj) {
        try {
            Class createdClass = classService.createClass(classObj);
            return ResponseEntity.ok(createdClass);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{classId}")
    public ResponseEntity<Class> updateClass(
            @PathVariable String classId,
            @RequestBody Class classDetails) {
        try {
            Class updatedClass = classService.updateClass(classId, classDetails);
            if (updatedClass != null) {
                return ResponseEntity.ok(updatedClass);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable String classId) {
        try {
            boolean deleted = classService.deleteClass(classId);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Class Filtering Endpoints
    @GetMapping("/term/{termId}")
    public ResponseEntity<List<Class>> getClassesByTermId(@PathVariable Integer termId) {
        try {
            List<Class> classes = classService.getClassesByTermId(termId);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/term-name/{termName}")
    public ResponseEntity<List<Class>> getClassesByTermName(@PathVariable String termName) {
        try {
            List<Class> classes = classService.getClassesByTermName(termName);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/academic-major/{majorId}")
    public ResponseEntity<List<Class>> getClassesByAcademicMajor(@PathVariable Integer majorId) {
        try {
            Optional<AcademicMajor> majorOpt = academicMajorRepository.findById(majorId);
            if (majorOpt.isPresent()) {
                List<Class> classes = classService.getClassesByAcademicMajor(majorOpt.get());
                return ResponseEntity.ok(classes);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/academic-major-name/{majorName}")
    public ResponseEntity<List<Class>> getClassesByAcademicMajorName(@PathVariable String majorName) {
        try {
            List<Class> classes = classService.getClassesByAcademicMajorName(majorName);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Class>> getClassesByHomeroomTeacher(@PathVariable Integer teacherId) {
        try {
            List<Class> classes = classService.getClassesByHomeroomTeacher(teacherId);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Class>> getAvailableClasses() {
        try {
            List<Class> classes = classService.getAvailableClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Class>> searchClasses(@RequestParam String keyword) {
        try {
            List<Class> classes = classService.searchClasses(keyword);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Student Management Endpoints
    @PostMapping("/{classId}/students/{userId}")
    public ResponseEntity<Map<String, Object>> assignStudentToClass(
            @PathVariable String classId,
            @PathVariable Integer userId) {
        try {
            boolean assigned = classService.assignStudentToClass(userId, classId);
            Map<String, Object> response = new HashMap<>();
            
            if (assigned) {
                response.put("success", true);
                response.put("message", "Student successfully assigned to class");
            } else {
                response.put("success", false);
                response.put("message", "Failed to assign student to class");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{classId}/students/{userId}")
    public ResponseEntity<Map<String, Object>> removeStudentFromClass(
            @PathVariable String classId,
            @PathVariable Integer userId) {
        try {
            boolean removed = classService.removeStudentFromClass(userId, classId);
            Map<String, Object> response = new HashMap<>();
            
            if (removed) {
                response.put("success", true);
                response.put("message", "Student successfully removed from class");
            } else {
                response.put("success", false);
                response.put("message", "Failed to remove student from class");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{classId}/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentsByClass(@PathVariable String classId) {
        try {
            // Query both users and students tables to get complete student information
            String query = "SELECT u.id, u.username, u.full_name, u.email, u.role, u.profile_image_url, " +
                          "s.student_id, s.gender, s.date_of_birth " +
                          "FROM users u " +
                          "JOIN students s ON u.id = s.user_id " +
                          "WHERE s.class_id = ?";
            
            List<Map<String, Object>> studentDetails = new ArrayList<>();
            Connection conn = null;
            PreparedStatement ps = null;
            ResultSet rs = null;
            
            try {
                conn = dataSource.getConnection();
                ps = conn.prepareStatement(query);
                ps.setString(1, classId);
                rs = ps.executeQuery();
                
                while (rs.next()) {
                    Map<String, Object> details = new HashMap<>();
                    details.put("id", rs.getInt("id"));
                    details.put("username", rs.getString("username"));
                    details.put("fullName", rs.getString("full_name"));
                    details.put("email", rs.getString("email"));
                    details.put("role", rs.getString("role"));
                    details.put("profileImageUrl", rs.getString("profile_image_url"));
                    details.put("studentId", rs.getString("student_id"));
                    details.put("gender", rs.getString("gender"));
                    details.put("dateOfBirth", rs.getString("date_of_birth"));
                    
                    studentDetails.add(details);
                }
            } finally {
                if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignored */ }
                if (ps != null) try { ps.close(); } catch (SQLException e) { /* ignored */ }
                if (conn != null) try { conn.close(); } catch (SQLException e) { /* ignored */ }
            }
            
            return ResponseEntity.ok(studentDetails);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{classId}/update-count")
    public ResponseEntity<Map<String, Object>> updateClassStudentCount(@PathVariable String classId) {
        try {
            boolean updated = classService.updateClassStudentCount(classId);
            Map<String, Object> response = new HashMap<>();
            
            if (updated) {
                response.put("success", true);
                response.put("message", "Class student count updated successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update class student count");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/terms")
    public ResponseEntity<List<Map<String, Object>>> getAvailableTerms() {
        try {
            List<Term> terms = termRepository.findAll();
            List<Map<String, Object>> termsList = new ArrayList<>();
            
            for (Term term : terms) {
                try {
                    // Use direct field access with reflection to avoid getter method issues
                    java.lang.reflect.Field idField = Term.class.getDeclaredField("id");
                    java.lang.reflect.Field nameField = Term.class.getDeclaredField("name");
                    idField.setAccessible(true);
                    nameField.setAccessible(true);
                    
                    Integer id = (Integer) idField.get(term);
                    String name = (String) nameField.get(term);
                    
                    Map<String, Object> termMap = new HashMap<>();
                    termMap.put("id", id);
                    termMap.put("name", name);
                    termsList.add(termMap);
                } catch (Exception e) {
                    System.out.println("Error accessing Term fields: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            return ResponseEntity.ok(termsList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getAvailableDepartments() {
        try {
            List<AcademicMajor> majors = academicMajorRepository.findAll();
            List<Map<String, Object>> departments = new ArrayList<>();
            
            for (AcademicMajor major : majors) {
                try {
                    // Use direct field access with reflection to avoid getter method issues
                    java.lang.reflect.Field idField = AcademicMajor.class.getDeclaredField("id");
                    java.lang.reflect.Field nameField = AcademicMajor.class.getDeclaredField("name");
                    idField.setAccessible(true);
                    nameField.setAccessible(true);
                    
                    Integer id = (Integer) idField.get(major);
                    String name = (String) nameField.get(major);
                    
                    Map<String, Object> dept = new HashMap<>();
                    dept.put("id", id);
                    dept.put("name", name);
                    departments.add(dept);
                } catch (Exception e) {
                    System.out.println("Error accessing AcademicMajor fields: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 