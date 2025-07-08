package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.PersonalSchedule;
import com.mycompany.fstudymate.model.ClassSchedule;
import com.mycompany.fstudymate.service.ScheduleService;
import com.mycompany.fstudymate.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private UserActivityService userActivityService;

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
    public ResponseEntity<ClassSchedule> createClassSchedule(@RequestBody ClassSchedule schedule) {
        try {
            ClassSchedule createdSchedule = scheduleService.createClassSchedule(schedule);
            return ResponseEntity.ok(createdSchedule);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
            return ResponseEntity.internalServerError().build();
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
            @RequestBody ClassSchedule scheduleDetails) {
        try {
            ClassSchedule updatedSchedule = scheduleService.updateClassSchedule(id, scheduleDetails);
            if (updatedSchedule != null) {
                return ResponseEntity.ok(updatedSchedule);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
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
    public ResponseEntity<List<Integer>> getAvailableTermIds() {
        try {
            List<Integer> termIds = scheduleService.getAvailableTermIds();
            return ResponseEntity.ok(termIds);
        } catch (Exception e) {
            e.printStackTrace(); // Add this to log the exception
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
} 