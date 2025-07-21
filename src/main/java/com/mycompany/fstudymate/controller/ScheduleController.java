package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.PersonalSchedule;
import com.mycompany.fstudymate.model.ClassSchedule;
import com.mycompany.fstudymate.service.ScheduleService;
import com.mycompany.fstudymate.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mycompany.fstudymate.model.Room;
import com.mycompany.fstudymate.repository.RoomRepository;
import com.mycompany.fstudymate.repository.TermRepository;
import com.mycompany.fstudymate.model.Term;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import java.util.HashMap;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private UserActivityService userActivityService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TermRepository termRepository;

    // Personal Schedule Endpoints
    @GetMapping("/personal/{userId}")
    public ResponseEntity<List<PersonalSchedule>> getUserPersonalSchedules(@PathVariable Integer userId) {
        try {
            logger.info("Fetching personal schedules for user ID: {}", userId);
            List<PersonalSchedule> schedules = scheduleService.getUserPersonalSchedules(userId);
            logger.info("Found {} personal schedules for user ID: {}", schedules.size(), userId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            logger.error("Error fetching personal schedules for user ID: {}", userId, e);
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/personal/{userId}/range")
    public ResponseEntity<List<PersonalSchedule>> getUserSchedulesByDateRange(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<PersonalSchedule> schedules = scheduleService.getUserSchedulesByDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/personal/{userId}/type/{type}")
    public ResponseEntity<List<PersonalSchedule>> getUserSchedulesByType(
            @PathVariable Integer userId,
            @PathVariable PersonalSchedule.ScheduleType type) {
        try {
            List<PersonalSchedule> schedules = scheduleService.getUserSchedulesByType(userId, type);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/personal")
    public ResponseEntity<PersonalSchedule> createPersonalSchedule(@RequestBody PersonalSchedule schedule) {
        try {
            PersonalSchedule createdSchedule = scheduleService.createPersonalSchedule(schedule);
            return ResponseEntity.ok(createdSchedule);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/personal/schedule/{id}")
    public ResponseEntity<PersonalSchedule> getPersonalScheduleById(@PathVariable Integer id) {
        try {
            Optional<PersonalSchedule> schedule = scheduleService.getPersonalScheduleById(id);
            return schedule.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/personal/schedule/{id}")
    public ResponseEntity<PersonalSchedule> updatePersonalSchedule(
            @PathVariable Integer id,
            @RequestBody PersonalSchedule scheduleDetails) {
        try {
            PersonalSchedule updatedSchedule = scheduleService.updatePersonalSchedule(id, scheduleDetails);
            if (updatedSchedule != null) {
                return ResponseEntity.ok(updatedSchedule);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/personal/schedule/{id}")
    public ResponseEntity<Void> deletePersonalSchedule(@PathVariable Integer id) {
        try {
            boolean deleted = scheduleService.deletePersonalSchedule(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/personal/{userId}/upcoming")
    public ResponseEntity<List<PersonalSchedule>> getUpcomingSchedules(@PathVariable Integer userId) {
        try {
            List<PersonalSchedule> schedules = scheduleService.getUpcomingSchedules(userId, 5);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    // Class Schedule Endpoints
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ClassSchedule>> getClassSchedules(@PathVariable String classId) {
        try {
            List<ClassSchedule> schedules = scheduleService.getClassSchedules(classId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/class/lecturer/{lecturerId}")
    public ResponseEntity<List<ClassSchedule>> getLecturerSchedules(@PathVariable Integer lecturerId) {
        try {
            List<ClassSchedule> schedules = scheduleService.getLecturerSchedules(lecturerId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/class/subject/{subjectId}")
    public ResponseEntity<List<ClassSchedule>> getSubjectSchedules(@PathVariable Integer subjectId) {
        try {
            List<ClassSchedule> schedules = scheduleService.getSubjectSchedules(subjectId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/class/{classId}/term/{termId}")
    public ResponseEntity<List<ClassSchedule>> getClassSchedulesByTerm(
            @PathVariable String classId,
            @PathVariable Integer termId) {
        try {
            List<ClassSchedule> schedules = scheduleService.getClassSchedulesByTerm(classId, termId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/class")
    public ResponseEntity<?> createClassSchedule(@RequestBody Map<String, Object> payload) {
        try {
            ClassSchedule schedule = new ClassSchedule();
            
            if (payload.containsKey("subjectId")) schedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) schedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) schedule.setLecturerId((Integer) payload.get("lecturerId"));
            
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                schedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                schedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            if (payload.containsKey("roomId")) {
                Integer roomId = (Integer) payload.get("roomId");
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
                schedule.setRoom(room);
            }
            
            if (payload.containsKey("status")) schedule.setStatus(ClassSchedule.Status.valueOf((String) payload.get("status")));
            if (payload.containsKey("building")) schedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) schedule.setTermId((Integer) payload.get("termId"));
            if (payload.containsKey("isActive")) schedule.setIsActive((Boolean) payload.get("isActive"));
            
            if (payload.containsKey("specificDate")) {
                String specificDateStr = (String) payload.get("specificDate");
                schedule.setSpecificDate(LocalDate.parse(specificDateStr));
            }
            
            if (payload.containsKey("isRecurring")) schedule.setIsRecurring((Boolean) payload.get("isRecurring"));
            if (payload.containsKey("recurrenceCount")) schedule.setRecurrenceCount((Integer) payload.get("recurrenceCount"));
            
            // Validate for conflicts
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(schedule, null);
            
            if (conflicts.get("lecturerConflict") || conflicts.get("classConflict") || conflicts.get("roomConflict")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("conflicts", conflicts);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            ClassSchedule savedSchedule = scheduleService.createSchedule(schedule);
            return ResponseEntity.ok(savedSchedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating class schedule: " + e.getMessage());
        }
    }

    @GetMapping("/class/schedule/{id}")
    public ResponseEntity<ClassSchedule> getClassScheduleById(@PathVariable Integer id) {
        try {
            Optional<ClassSchedule> schedule = scheduleService.getClassScheduleById(id);
            return schedule.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/class/{id}")
    public ResponseEntity<?> updateClassSchedule(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        try {
            ClassSchedule existingSchedule = scheduleService.getScheduleById(id);
            if (existingSchedule == null) {
                return ResponseEntity.notFound().build();
            }
            
            if (payload.containsKey("subjectId")) existingSchedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) existingSchedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) existingSchedule.setLecturerId((Integer) payload.get("lecturerId"));
            
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                existingSchedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                existingSchedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            if (payload.containsKey("roomId")) {
                Integer roomId = (Integer) payload.get("roomId");
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
                existingSchedule.setRoom(room);
            }
            
            if (payload.containsKey("status")) existingSchedule.setStatus(ClassSchedule.Status.valueOf((String) payload.get("status")));
            if (payload.containsKey("building")) existingSchedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) existingSchedule.setTermId((Integer) payload.get("termId"));
            if (payload.containsKey("isActive")) existingSchedule.setIsActive((Boolean) payload.get("isActive"));
            
            if (payload.containsKey("specificDate")) {
                String specificDateStr = (String) payload.get("specificDate");
                existingSchedule.setSpecificDate(LocalDate.parse(specificDateStr));
            }
            
            if (payload.containsKey("isRecurring")) existingSchedule.setIsRecurring((Boolean) payload.get("isRecurring"));
            if (payload.containsKey("recurrenceCount")) existingSchedule.setRecurrenceCount((Integer) payload.get("recurrenceCount"));
            
            // Validate for conflicts
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(existingSchedule, id);
            
            if (conflicts.get("lecturerConflict") || conflicts.get("classConflict") || conflicts.get("roomConflict")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("conflicts", conflicts);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            ClassSchedule updatedSchedule = scheduleService.updateSchedule(id, existingSchedule);
            return ResponseEntity.ok(updatedSchedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating class schedule: " + e.getMessage());
        }
    }

    @DeleteMapping("/class/{id}")
    public ResponseEntity<Void> deleteClassSchedule(@PathVariable Integer id) {
        try {
            boolean deleted = scheduleService.deleteClassSchedule(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/terms")
    public ResponseEntity<List<Term>> getAvailableTermIds() {
        try {
            // Fetch terms from the Terms table instead of getting term IDs from schedules
            List<Term> terms = termRepository.findAllByOrderByIdAsc();
            logger.info("Fetched {} terms from the database", terms.size());
            return ResponseEntity.ok(terms);
        } catch (Exception e) {
            logger.error("Error fetching terms", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Combined Schedule Endpoints
    @GetMapping("/weekly/{userId}/{classId}")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule(
            @PathVariable Integer userId,
            @PathVariable String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        try {
            Map<String, Object> weeklySchedule = scheduleService.getWeeklySchedule(userId, classId, weekStart);
            return ResponseEntity.ok(weeklySchedule);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/today/{userId}/{classId}")
    public ResponseEntity<Map<String, Object>> getTodaySchedule(
            @PathVariable Integer userId,
            @PathVariable String classId) {
        try {
            Map<String, Object> todaySchedule = scheduleService.getTodaySchedule(userId, classId);
            return ResponseEntity.ok(todaySchedule);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/class/all")
    public ResponseEntity<List<ClassSchedule>> getAllClassSchedules() {
        List<ClassSchedule> schedules = scheduleService.getAllClassSchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/class/lecturer/{lecturerId}/term/{termId}")
    public ResponseEntity<List<ClassSchedule>> getLecturerSchedulesByTerm(
            @PathVariable Integer lecturerId,
            @PathVariable Integer termId) {
        try {
            List<ClassSchedule> schedules = scheduleService.findByLecturerIdAndTermId(lecturerId, termId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/class/validate-conflicts")
    public ResponseEntity<Map<String, Boolean>> validateScheduleConflicts(@RequestBody Map<String, Object> payload) {
        try {
            ClassSchedule schedule = new ClassSchedule();
            
            if (payload.containsKey("subjectId")) schedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) schedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) schedule.setLecturerId((Integer) payload.get("lecturerId"));
            
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                schedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                schedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            if (payload.containsKey("roomId")) {
                Integer roomId = (Integer) payload.get("roomId");
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
                schedule.setRoom(room);
            } else if (payload.containsKey("room") && payload.get("room") instanceof Map) {
                Map<String, Object> roomData = (Map<String, Object>) payload.get("room");
                Integer roomId = (Integer) roomData.get("id");
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
                schedule.setRoom(room);
            }
            
            if (payload.containsKey("status")) schedule.setStatus(ClassSchedule.Status.valueOf((String) payload.get("status")));
            if (payload.containsKey("building")) schedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) schedule.setTermId((Integer) payload.get("termId"));
            
            // Handle specific date
            if (payload.containsKey("specificDate")) {
                String specificDateStr = (String) payload.get("specificDate");
                if (specificDateStr != null && !specificDateStr.isEmpty()) {
                    schedule.setSpecificDate(LocalDate.parse(specificDateStr));
                }
            }
            
            // Handle recurring schedule info
            if (payload.containsKey("isRecurring")) schedule.setIsRecurring((Boolean) payload.get("isRecurring"));
            if (payload.containsKey("recurrenceCount")) schedule.setRecurrenceCount((Integer) payload.get("recurrenceCount"));
            
            // Get schedule ID if it's an update
            Integer scheduleId = null;
            if (payload.containsKey("id")) {
                scheduleId = (Integer) payload.get("id");
            }
            
            // Validate for conflicts
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(schedule, scheduleId);
            return ResponseEntity.ok(conflicts);
        } catch (Exception e) {
            logger.error("Error validating schedule conflicts", e);
            Map<String, Boolean> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/class/one-time")
    public ResponseEntity<?> createOneTimeClassSchedule(@RequestBody Map<String, Object> payload) {
        try {
            ClassSchedule schedule = new ClassSchedule();
            
            if (payload.containsKey("subjectId")) schedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) schedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) schedule.setLecturerId((Integer) payload.get("lecturerId"));
            
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                schedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                schedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            if (payload.containsKey("roomId")) {
                Integer roomId = (Integer) payload.get("roomId");
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
                schedule.setRoom(room);
            }
            
            if (payload.containsKey("status")) schedule.setStatus(ClassSchedule.Status.valueOf((String) payload.get("status")));
            if (payload.containsKey("building")) schedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) schedule.setTermId((Integer) payload.get("termId"));
            if (payload.containsKey("isActive")) schedule.setIsActive((Boolean) payload.get("isActive"));
            
            // Specific date is required for one-time schedules
            if (payload.containsKey("specificDate")) {
                String specificDateStr = (String) payload.get("specificDate");
                schedule.setSpecificDate(LocalDate.parse(specificDateStr));
            } else {
                return ResponseEntity.badRequest().body("Specific date is required for one-time schedules");
            }
            
            // Validate for conflicts
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(schedule, null);
            
            if (conflicts.get("lecturerConflict") || conflicts.get("classConflict") || conflicts.get("roomConflict")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("conflicts", conflicts);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            ClassSchedule savedSchedule = scheduleService.createOneTimeSchedule(schedule);
            return ResponseEntity.ok(savedSchedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating one-time class schedule: " + e.getMessage());
        }
    }

    @PostMapping("/class/recurring")
    public ResponseEntity<?> createRecurringClassSchedule(@RequestBody Map<String, Object> payload) {
        try {
            ClassSchedule baseSchedule = new ClassSchedule();
            
            if (payload.containsKey("subjectId")) baseSchedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) baseSchedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) baseSchedule.setLecturerId((Integer) payload.get("lecturerId"));
            
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                baseSchedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                baseSchedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            if (payload.containsKey("roomId")) {
                Integer roomId = (Integer) payload.get("roomId");
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
                baseSchedule.setRoom(room);
            }
            
            if (payload.containsKey("status")) baseSchedule.setStatus(ClassSchedule.Status.valueOf((String) payload.get("status")));
            if (payload.containsKey("building")) baseSchedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) baseSchedule.setTermId((Integer) payload.get("termId"));
            if (payload.containsKey("isActive")) baseSchedule.setIsActive((Boolean) payload.get("isActive"));
            
            // Set recurring flag
            baseSchedule.setIsRecurring(true);
            
            // Set recurrence count
            if (payload.containsKey("recurrenceCount")) {
                baseSchedule.setRecurrenceCount((Integer) payload.get("recurrenceCount"));
            } else {
                baseSchedule.setRecurrenceCount(1); // Default to 1 if not specified
            }
            
            // Validate the base schedule for conflicts
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(baseSchedule, null);
            
            if (conflicts.get("lecturerConflict") || conflicts.get("classConflict") || conflicts.get("roomConflict")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("conflicts", conflicts);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            List<ClassSchedule> createdSchedules = scheduleService.createRecurringSchedules(baseSchedule);
            return ResponseEntity.ok(createdSchedules);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating recurring class schedules: " + e.getMessage());
        }
    }
    
    @GetMapping("/class/{classId}/date/{date}")
    public ResponseEntity<List<ClassSchedule>> getClassSchedulesByDate(
            @PathVariable String classId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<ClassSchedule> schedules = scheduleService.getClassSchedulesByDate(classId, date);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/class/date-range")
    public ResponseEntity<List<ClassSchedule>> getClassSchedulesByDateRange(
            @RequestParam String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<ClassSchedule> schedules = scheduleService.getClassSchedulesByDateRange(classId, startDate, endDate);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 