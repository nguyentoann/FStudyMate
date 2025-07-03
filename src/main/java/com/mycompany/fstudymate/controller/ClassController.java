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
    
    // Class Management Endpoints
    @GetMapping
    public ResponseEntity<List<Class>> getAllClasses() {
        try {
            List<Class> classes = classService.getAllClasses();
            return ResponseEntity.ok(classes);
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
            List<User> students = userRepository.findByClassId(classId);
            List<Map<String, Object>> studentDetails = students.stream()
                    .map(student -> {
                        Map<String, Object> details = new HashMap<>();
                        details.put("id", student.getId());
                        details.put("username", student.getUsername());
                        details.put("fullName", student.getFullName());
                        details.put("email", student.getEmail());
                        details.put("role", student.getRole());
                        return details;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(studentDetails);
        } catch (Exception e) {
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