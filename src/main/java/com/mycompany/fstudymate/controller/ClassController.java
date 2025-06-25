package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.service.ClassService;
import com.mycompany.fstudymate.service.UserActivityService;
import com.mycompany.fstudymate.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    @Autowired
    private ClassService classService;
    
    @Autowired
    private UserRepository userRepository;
    
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
                    .orElse(ResponseEntity.notFound().build());
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
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable String classId) {
        try {
            boolean deleted = classService.deleteClass(classId);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Class Filtering Endpoints
    @GetMapping("/academic-year/{academicYear}")
    public ResponseEntity<List<Class>> getClassesByAcademicYear(@PathVariable String academicYear) {
        try {
            List<Class> classes = classService.getClassesByAcademicYear(academicYear);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/academic-year/{academicYear}/semester/{semester}")
    public ResponseEntity<List<Class>> getClassesByAcademicYearAndSemester(
            @PathVariable String academicYear,
            @PathVariable String semester) {
        try {
            List<Class> classes = classService.getClassesByAcademicYearAndSemester(academicYear, semester);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<List<Class>> getClassesByDepartment(@PathVariable String department) {
        try {
            List<Class> classes = classService.getClassesByDepartment(department);
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
    
    @GetMapping("/academic-years")
    public ResponseEntity<List<String>> getAvailableAcademicYears() {
        try {
            List<String> academicYears = classService.getAllClasses().stream()
                    .map(Class::getAcademicYear)
                    .distinct()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(academicYears);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/semesters")
    public ResponseEntity<List<String>> getAvailableSemesters() {
        try {
            List<String> semesters = classService.getAllClasses().stream()
                    .map(Class::getSemester)
                    .distinct()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(semesters);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getAvailableDepartments() {
        try {
            List<String> departments = classService.getAllClasses().stream()
                    .map(Class::getDepartment)
                    .filter(dept -> dept != null && !dept.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 