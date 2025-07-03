package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Class;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.model.ClassSchedule;
import com.mycompany.fstudymate.model.Subject;
import com.mycompany.fstudymate.service.ClassService;
import com.mycompany.fstudymate.service.UserActivityService;
import com.mycompany.fstudymate.repository.UserRepository;
import com.mycompany.fstudymate.repository.ClassScheduleRepository;
import com.mycompany.fstudymate.repository.SubjectRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
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
    
    @Autowired
    private ClassScheduleRepository classScheduleRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
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
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Class>> getClassesByStudent(@PathVariable Integer studentId) {
        try {
            // Find the user by ID
            Optional<User> user = userRepository.findById(studentId);
            
            if (user.isPresent() && user.get().getClassId() != null) {
                // Get the class ID from the user
                String classId = user.get().getClassId();
                
                // Find the class by ID
                Optional<Class> classObj = classService.getClassById(classId);
                
                if (classObj.isPresent()) {
                    return ResponseEntity.ok(List.of(classObj.get()));
                }
            }
            
            // Return empty list if user not found or has no class
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{classId}/students")
    public ResponseEntity<List<User>> getStudentsByClass(@PathVariable String classId) {
        try {
            // Get students by class ID
            List<User> students = userRepository.findByClassId(classId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{classId}/schedule")
    public ResponseEntity<List<Map<String, Object>>> getClassSchedule(@PathVariable String classId) {
        try {
            // Truy vấn dữ liệu từ cơ sở dữ liệu
            List<ClassSchedule> schedules = classScheduleRepository.findByClassIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(classId);
            
            if (schedules.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            // Chuyển đổi từ ClassSchedule thành Map để trả về kết quả
            List<Map<String, Object>> result = schedules.stream().map(schedule -> {
                Map<String, Object> scheduleMap = new HashMap<>();
                
                // Convert day of week from integer to string
                String dayOfWeekStr;
                switch (schedule.getDayOfWeek()) {
                    case 1: dayOfWeekStr = "Monday"; break;
                    case 2: dayOfWeekStr = "Tuesday"; break;
                    case 3: dayOfWeekStr = "Wednesday"; break;
                    case 4: dayOfWeekStr = "Thursday"; break;
                    case 5: dayOfWeekStr = "Friday"; break;
                    case 6: dayOfWeekStr = "Saturday"; break;
                    case 7: dayOfWeekStr = "Sunday"; break;
                    default: dayOfWeekStr = "Unknown";
                }
                
                scheduleMap.put("dayOfWeek", dayOfWeekStr);
                scheduleMap.put("startTime", schedule.getStartTime().toString());
                scheduleMap.put("endTime", schedule.getEndTime().toString());
                scheduleMap.put("room", schedule.getRoom());
                
                // Thêm thông tin môn học
                try {
                    Optional<Subject> subject = subjectRepository.findById(schedule.getSubjectId());
                    scheduleMap.put("subject", subject.isPresent() ? subject.get().getName() : "Unknown Subject");
                } catch (Exception ex) {
                    scheduleMap.put("subject", "Unknown Subject");
                }
                
                return scheduleMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Return error response instead of sample data
            return ResponseEntity.status(500).body(Collections.emptyList());
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
    
    // Thêm lịch học mới cho lớp
    @PostMapping("/{classId}/schedule")
    public ResponseEntity<?> addClassSchedule(
            @PathVariable String classId,
            @RequestBody ClassSchedule classSchedule) {
        try {
            // Kiểm tra xem lớp học có tồn tại hay không
            Optional<Class> classObj = classService.getClassById(classId);
            if (!classObj.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Class not found");
                return ResponseEntity.status(404).body(response);
            }
            
            // Đặt classId cho lịch học
            classSchedule.setClassId(classId);
            
            // Lưu lịch học mới
            ClassSchedule savedSchedule = classScheduleRepository.save(classSchedule);
            return ResponseEntity.ok(savedSchedule);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to add schedule: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Cập nhật lịch học
    @PutMapping("/schedule/{scheduleId}")
    public ResponseEntity<?> updateClassSchedule(
            @PathVariable Integer scheduleId,
            @RequestBody ClassSchedule classSchedule) {
        try {
            // Kiểm tra xem lịch học có tồn tại hay không
            Optional<ClassSchedule> existingSchedule = classScheduleRepository.findById(scheduleId);
            if (!existingSchedule.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Schedule not found");
                return ResponseEntity.status(404).body(response);
            }
            
            // Cập nhật lịch học
            ClassSchedule scheduleToUpdate = existingSchedule.get();
            scheduleToUpdate.setSubjectId(classSchedule.getSubjectId());
            scheduleToUpdate.setLecturerId(classSchedule.getLecturerId());
            scheduleToUpdate.setDayOfWeek(classSchedule.getDayOfWeek());
            scheduleToUpdate.setStartTime(classSchedule.getStartTime());
            scheduleToUpdate.setEndTime(classSchedule.getEndTime());
            scheduleToUpdate.setRoom(classSchedule.getRoom());
            scheduleToUpdate.setBuilding(classSchedule.getBuilding());
            scheduleToUpdate.setSemester(classSchedule.getSemester());
            scheduleToUpdate.setAcademicYear(classSchedule.getAcademicYear());
            scheduleToUpdate.setIsActive(classSchedule.getIsActive());
            
            // Lưu lịch học đã cập nhật
            ClassSchedule updatedSchedule = classScheduleRepository.save(scheduleToUpdate);
            return ResponseEntity.ok(updatedSchedule);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update schedule: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Xóa lịch học
    @DeleteMapping("/schedule/{scheduleId}")
    public ResponseEntity<?> deleteClassSchedule(@PathVariable Integer scheduleId) {
        try {
            // Kiểm tra xem lịch học có tồn tại hay không
            Optional<ClassSchedule> existingSchedule = classScheduleRepository.findById(scheduleId);
            if (!existingSchedule.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Schedule not found");
                return ResponseEntity.status(404).body(response);
            }
            
            // Xóa lịch học
            classScheduleRepository.deleteById(scheduleId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Schedule deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete schedule: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Lấy danh sách môn học cho việc chọn lịch học
    @GetMapping("/subjects")
    public ResponseEntity<?> getAllSubjects() {
        try {
            List<Subject> subjects = subjectRepository.findAll();
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to get subjects: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // Lấy danh sách giảng viên cho việc chọn lịch học
    @GetMapping("/lecturers")
    public ResponseEntity<?> getAllLecturers() {
        try {
            List<User> lecturers = userRepository.findByRole("LECTURER");
            return ResponseEntity.ok(lecturers);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to get lecturers: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 