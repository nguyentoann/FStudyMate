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
    public ResponseEntity<ClassSchedule> createClassSchedule(@RequestBody Map<String, Object> payload) {
        try {
            logger.info("Creating class schedule with payload: {}", payload);
            
            // Validate that required fields are present
            if (!payload.containsKey("room_id") || payload.get("room_id") == null) {
                logger.error("Room ID is missing or null in the request");
                return ResponseEntity.badRequest().body(null);
            }
            
            Integer roomId = (Integer) payload.get("room_id");
            
            // Find the room by ID
            Room room = roomRepository.findById(roomId).orElse(null);
            if (room == null) {
                logger.error("Room with ID {} not found", roomId);
                return ResponseEntity.badRequest().body(null);
            }
            
            // Create new schedule
            ClassSchedule schedule = new ClassSchedule();
            schedule.setRoom(room);
            
            // Set status
            String statusStr = (String) payload.get("status");
            schedule.setStatus(ClassSchedule.Status.valueOf(statusStr != null ? statusStr : "NotYet"));
            
            // Set other fields from payload
            if (payload.containsKey("subjectId")) schedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) schedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) schedule.setLecturerId((Integer) payload.get("lecturerId"));
            if (payload.containsKey("dayOfWeek")) schedule.setDayOfWeek((Integer) payload.get("dayOfWeek"));
            if (payload.containsKey("building")) schedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) schedule.setTermId((Integer) payload.get("termId"));
            if (payload.containsKey("isActive")) schedule.setIsActive((Boolean) payload.get("isActive"));
            else schedule.setIsActive(true); // Default to active
            
            // Parse time fields
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                schedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                schedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            // Validate required fields
            if (schedule.getSubjectId() == null || schedule.getClassId() == null || 
                schedule.getLecturerId() == null || schedule.getDayOfWeek() == null || 
                schedule.getStartTime() == null || schedule.getEndTime() == null || 
                schedule.getRoom() == null || schedule.getTermId() == null) {
                logger.error("Missing required fields for creating schedule");
                return ResponseEntity.badRequest().body(null);
            }
            
            ClassSchedule createdSchedule = scheduleService.createClassSchedule(schedule);
            logger.info("Schedule created successfully with ID: {}", createdSchedule.getId());
            return ResponseEntity.ok(createdSchedule);
        } catch (Exception e) {
            logger.error("Error creating class schedule", e);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
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
    public ResponseEntity<ClassSchedule> updateClassSchedule(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        try {
            Optional<ClassSchedule> existingScheduleOpt = scheduleService.getClassScheduleById(id);
            if (!existingScheduleOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ClassSchedule existingSchedule = existingScheduleOpt.get();
            
            // Update fields from payload
            if (payload.containsKey("room_id")) {
                Integer roomId = (Integer) payload.get("room_id");
                Room room = roomRepository.findById(roomId).orElse(null);
                if (room == null) return ResponseEntity.badRequest().build();
                existingSchedule.setRoom(room);
            }
            
            if (payload.containsKey("status")) {
                String statusStr = (String) payload.get("status");
                existingSchedule.setStatus(ClassSchedule.Status.valueOf(statusStr));
            }
            
            if (payload.containsKey("subjectId")) existingSchedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) existingSchedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) existingSchedule.setLecturerId((Integer) payload.get("lecturerId"));
            if (payload.containsKey("dayOfWeek")) existingSchedule.setDayOfWeek((Integer) payload.get("dayOfWeek"));
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                existingSchedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                existingSchedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            if (payload.containsKey("building")) existingSchedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) existingSchedule.setTermId((Integer) payload.get("termId"));
            
            // Check for conflicts
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(existingSchedule);
            boolean hasConflicts = conflicts.values().stream().anyMatch(conflict -> conflict);
            
            if (hasConflicts) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            ClassSchedule updatedSchedule = scheduleService.updateClassSchedule(id, existingSchedule);
            if (updatedSchedule != null) {
                return ResponseEntity.ok(updatedSchedule);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
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
            logger.info("Validating conflicts with payload: {}", payload);
            
            ClassSchedule schedule = new ClassSchedule();
            
            // Extract and set room information
            if (payload.containsKey("room") && payload.get("room") != null) {
                Map<String, Object> roomData = (Map<String, Object>) payload.get("room");
                Integer roomId = (Integer) roomData.get("id");
                if (roomId == null) {
                    logger.error("Room ID is null in the room object");
                    Map<String, Boolean> errorResponse = new HashMap<>();
                    errorResponse.put("error", true);
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                Room room = roomRepository.findById(roomId).orElse(null);
                if (room == null) {
                    logger.error("Room with ID {} not found", roomId);
                    Map<String, Boolean> errorResponse = new HashMap<>();
                    errorResponse.put("error", true);
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                schedule.setRoom(room);
            } else if (payload.containsKey("room_id") && payload.get("room_id") != null) {
                Integer roomId = (Integer) payload.get("room_id");
                Room room = roomRepository.findById(roomId).orElse(null);
                if (room == null) {
                    logger.error("Room with ID {} not found", roomId);
                    Map<String, Boolean> errorResponse = new HashMap<>();
                    errorResponse.put("error", true);
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                schedule.setRoom(room);
            } else {
                logger.error("No room or room_id provided in the payload");
                Map<String, Boolean> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Set other schedule fields
            if (payload.containsKey("id")) schedule.setId((Integer) payload.get("id"));
            if (payload.containsKey("subjectId")) schedule.setSubjectId((Integer) payload.get("subjectId"));
            if (payload.containsKey("classId")) schedule.setClassId((String) payload.get("classId"));
            if (payload.containsKey("lecturerId")) schedule.setLecturerId((Integer) payload.get("lecturerId"));
            if (payload.containsKey("dayOfWeek")) schedule.setDayOfWeek((Integer) payload.get("dayOfWeek"));
            if (payload.containsKey("status")) {
                String statusStr = (String) payload.get("status");
                schedule.setStatus(ClassSchedule.Status.valueOf(statusStr));
            }
            if (payload.containsKey("building")) schedule.setBuilding((String) payload.get("building"));
            if (payload.containsKey("termId")) schedule.setTermId((Integer) payload.get("termId"));
            
            // Parse time fields
            if (payload.containsKey("startTime")) {
                String startTimeStr = (String) payload.get("startTime");
                schedule.setStartTime(LocalTime.parse(startTimeStr));
            }
            if (payload.containsKey("endTime")) {
                String endTimeStr = (String) payload.get("endTime");
                schedule.setEndTime(LocalTime.parse(endTimeStr));
            }
            
            // Validate required fields
            if (schedule.getDayOfWeek() == null || schedule.getStartTime() == null || 
                schedule.getEndTime() == null || schedule.getRoom() == null) {
                logger.error("Missing required fields for schedule validation");
                Map<String, Boolean> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("missingFields", true);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Map<String, Boolean> conflicts = scheduleService.validateScheduleForConflicts(schedule);
            logger.info("Conflict validation completed: {}", conflicts);
            return ResponseEntity.ok(conflicts);
        } catch (Exception e) {
            logger.error("Error validating schedule conflicts", e);
            e.printStackTrace();
            Map<String, Boolean> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 