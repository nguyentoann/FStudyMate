package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.PersonalSchedule;
import com.mycompany.fstudymate.model.ClassSchedule;
import com.mycompany.fstudymate.repository.PersonalScheduleRepository;
import com.mycompany.fstudymate.repository.ClassScheduleRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScheduleService {

    @Autowired
    private PersonalScheduleRepository personalScheduleRepository;

    @Autowired
    private ClassScheduleRepository classScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    // Personal Schedule Methods
    public List<PersonalSchedule> getUserPersonalSchedules(Integer userId) {
        return personalScheduleRepository.findByUserIdOrderByStartTimeAsc(userId);
    }

    public List<PersonalSchedule> getUserSchedulesByDateRange(Integer userId, LocalDateTime startDate, LocalDateTime endDate) {
        return personalScheduleRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public List<PersonalSchedule> getUserSchedulesByType(Integer userId, PersonalSchedule.ScheduleType type) {
        return personalScheduleRepository.findByUserIdAndType(userId, type);
    }

    public PersonalSchedule createPersonalSchedule(PersonalSchedule schedule) {
        schedule.setUserId(schedule.getUserId());
        return personalScheduleRepository.save(schedule);
    }

    public Optional<PersonalSchedule> getPersonalScheduleById(Integer id) {
        return personalScheduleRepository.findById(id);
    }

    public PersonalSchedule updatePersonalSchedule(Integer id, PersonalSchedule scheduleDetails) {
        Optional<PersonalSchedule> optionalSchedule = personalScheduleRepository.findById(id);
        if (optionalSchedule.isPresent()) {
            PersonalSchedule schedule = optionalSchedule.get();
            schedule.setTitle(scheduleDetails.getTitle());
            schedule.setDescription(scheduleDetails.getDescription());
            schedule.setStartTime(scheduleDetails.getStartTime());
            schedule.setEndTime(scheduleDetails.getEndTime());
            schedule.setType(scheduleDetails.getType());
            schedule.setLocation(scheduleDetails.getLocation());
            schedule.setColor(scheduleDetails.getColor());
            schedule.setIsRecurring(scheduleDetails.getIsRecurring());
            schedule.setRecurrencePattern(scheduleDetails.getRecurrencePattern());
            schedule.setReminderMinutes(scheduleDetails.getReminderMinutes());
            return personalScheduleRepository.save(schedule);
        }
        return null;
    }

    public boolean deletePersonalSchedule(Integer id) {
        if (personalScheduleRepository.existsById(id)) {
            personalScheduleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<PersonalSchedule> getUpcomingSchedules(Integer userId, int limit) {
        LocalDateTime now = LocalDateTime.now();
        return personalScheduleRepository.findNextFiveSchedules(userId, now);
    }

    // Class Schedule Methods
    public List<ClassSchedule> getClassSchedules(String classId) {
        return classScheduleRepository.findByClassIdAndIsActiveTrueOrderByStartTimeAsc(classId);
    }

    public List<ClassSchedule> getLecturerSchedules(Integer lecturerId) {
        return classScheduleRepository.findByLecturerIdAndIsActiveTrueOrderByStartTimeAsc(lecturerId);
    }

    public List<ClassSchedule> getSubjectSchedules(Integer subjectId) {
        return classScheduleRepository.findBySubjectIdAndIsActiveTrueOrderByStartTimeAsc(subjectId);
    }

    public List<ClassSchedule> getClassSchedulesBySemester(String classId, String semester, String academicYear) {
        // Since semester and academicYear columns are removed, we now use termId instead
        // This method needs to be updated based on how you want to handle this change
        return classScheduleRepository.findByClassId(classId);
    }
    
    public List<ClassSchedule> getClassSchedulesByTerm(String classId, Integer termId) {
        return classScheduleRepository.findByClassIdAndTermId(classId, termId);
    }

    public List<ClassSchedule> findByLecturerIdAndTermId(Integer lecturerId, Integer termId) {
        return classScheduleRepository.findByLecturerIdAndTermId(lecturerId, termId);
    }

    /**
     * Checks if there are any scheduling conflicts for a lecturer
     * @param lecturerId The ID of the lecturer
     * @param specificDate The specific date of the class
     * @param startTime The start time of the class
     * @param endTime The end time of the class
     * @param excludeScheduleId Optional schedule ID to exclude from checking (useful for updates)
     * @return true if there is a conflict, false otherwise
     */
    public boolean hasLecturerScheduleConflict(Integer lecturerId, LocalDate specificDate,
                                             LocalTime startTime, LocalTime endTime, 
                                             Integer excludeScheduleId) {
        // Safety check for null parameters
        if (lecturerId == null || startTime == null || endTime == null) {
            return false; // Can't determine conflict with null values
        }
        
        List<ClassSchedule> lecturerSchedules = classScheduleRepository
            .findByLecturerIdAndIsActiveTrueOrderByStartTimeAsc(lecturerId);
        
        return lecturerSchedules.stream()
            .filter(schedule -> 
                schedule.getId() != null && 
                excludeScheduleId != null && 
                !schedule.getId().equals(excludeScheduleId)) // Exclude the current schedule if updating
            .anyMatch(schedule -> {
                // Check if dates match or overlap
                boolean datesMatch = false;
                if (specificDate != null && schedule.getSpecificDate() != null) {
                    // Both have specific dates, check if they match
                    datesMatch = specificDate.equals(schedule.getSpecificDate());
                } else if (specificDate == null && schedule.getSpecificDate() == null) {
                    // Both are recurring schedules without specific dates
                    // In this case, we'll consider them as potential conflicts
                    datesMatch = true;
                }
                // If dates match, check time overlap
                return datesMatch && 
                       schedule.getStartTime() != null &&
                       schedule.getEndTime() != null &&
                       ((startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime())) ||
                        startTime.equals(schedule.getStartTime()) || endTime.equals(schedule.getEndTime()));
            });
    }

    /**
     * Checks if there are any scheduling conflicts for a class
     * @param classId The ID of the class
     * @param specificDate The specific date of the class
     * @param startTime The start time of the class
     * @param endTime The end time of the class
     * @param excludeScheduleId Optional schedule ID to exclude from checking (useful for updates)
     * @return true if there is a conflict, false otherwise
     */
    public boolean hasClassScheduleConflict(String classId, LocalDate specificDate,
                                          LocalTime startTime, LocalTime endTime,
                                          Integer excludeScheduleId) {
        // Safety check for null parameters
        if (classId == null || startTime == null || endTime == null) {
            return false; // Can't determine conflict with null values
        }
        
        List<ClassSchedule> classSchedules = classScheduleRepository
            .findByClassIdAndIsActiveTrueOrderByStartTimeAsc(classId);
        
        return classSchedules.stream()
            .filter(schedule -> 
                schedule.getId() != null && 
                excludeScheduleId != null && 
                !schedule.getId().equals(excludeScheduleId))
            .anyMatch(schedule -> {
                // Check if dates match or overlap
                boolean datesMatch = false;
                if (specificDate != null && schedule.getSpecificDate() != null) {
                    // Both have specific dates, check if they match
                    datesMatch = specificDate.equals(schedule.getSpecificDate());
                } else if (specificDate == null && schedule.getSpecificDate() == null) {
                    // Both are recurring schedules without specific dates
                    // In this case, we'll consider them as potential conflicts
                    datesMatch = true;
                }
                // If dates match, check time overlap
                return datesMatch && 
                       schedule.getStartTime() != null &&
                       schedule.getEndTime() != null &&
                       ((startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime())) ||
                        startTime.equals(schedule.getStartTime()) || endTime.equals(schedule.getEndTime()));
            });
    }

    /**
     * Checks if there are any scheduling conflicts for a room
     * @param roomId The ID of the room
     * @param specificDate The specific date of the class
     * @param startTime The start time of the class
     * @param endTime The end time of the class
     * @param excludeScheduleId Optional schedule ID to exclude from checking (useful for updates)
     * @return true if there is a conflict, false otherwise
     */
    public boolean hasRoomScheduleConflict(Integer roomId, LocalDate specificDate,
                                         LocalTime startTime, LocalTime endTime,
                                         Integer excludeScheduleId) {
        // Safety check for null parameters
        if (roomId == null || startTime == null || endTime == null) {
            return false; // Can't determine conflict with null values
        }
                                         
        List<ClassSchedule> roomSchedules = classScheduleRepository.findAll().stream()
            .filter(schedule -> 
                schedule.getRoom() != null && 
                schedule.getRoom().getId() != null &&
                schedule.getRoom().getId().equals(roomId) &&
                schedule.getIsActive() != null &&
                schedule.getIsActive())
            .collect(Collectors.toList());
        
        return roomSchedules.stream()
            .filter(schedule -> 
                schedule.getId() != null && 
                excludeScheduleId != null && 
                !schedule.getId().equals(excludeScheduleId))
            .anyMatch(schedule -> {
                // Check if dates match or overlap
                boolean datesMatch = false;
                if (specificDate != null && schedule.getSpecificDate() != null) {
                    // Both have specific dates, check if they match
                    datesMatch = specificDate.equals(schedule.getSpecificDate());
                } else if (specificDate == null && schedule.getSpecificDate() == null) {
                    // Both are recurring schedules without specific dates
                    // In this case, we'll consider them as potential conflicts
                    datesMatch = true;
                }
                // If dates match, check time overlap
                return datesMatch && 
                       schedule.getStartTime() != null &&
                       schedule.getEndTime() != null &&
                       ((startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime())) ||
                        startTime.equals(schedule.getStartTime()) || endTime.equals(schedule.getEndTime()));
            });
    }

    /**
     * Validates a new schedule for conflicts
     * @param schedule The schedule to validate
     * @return A map containing conflict information, empty if no conflicts
     */
    public Map<String, Boolean> validateScheduleForConflicts(ClassSchedule schedule) {
        return validateScheduleForConflicts(schedule, null);
    }

    /**
     * Create a class schedule
     * @param schedule The schedule to create
     * @return The created schedule
     */
    public ClassSchedule createClassSchedule(ClassSchedule schedule) {
        // Validate the schedule
        validateSchedule(schedule);
        
        // Check for conflicts
        Map<String, Boolean> conflicts = validateScheduleForConflicts(schedule);
        if (conflicts.get("lecturerConflict") || conflicts.get("classConflict") || conflicts.get("roomConflict")) {
            throw new RuntimeException("Schedule conflicts detected");
        }
        
        return classScheduleRepository.save(schedule);
    }

    public Optional<ClassSchedule> getClassScheduleById(Integer id) {
        return classScheduleRepository.findById(id);
    }

    public ClassSchedule updateSchedule(Integer id, ClassSchedule scheduleDetails) {
        ClassSchedule schedule = classScheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));
        
        if (scheduleDetails.getSubjectId() != null) {
            schedule.setSubjectId(scheduleDetails.getSubjectId());
        }
        
        if (scheduleDetails.getClassId() != null) {
            schedule.setClassId(scheduleDetails.getClassId());
        }
        
        if (scheduleDetails.getLecturerId() != null) {
            schedule.setLecturerId(scheduleDetails.getLecturerId());
        }
        
        if (scheduleDetails.getStartTime() != null) {
            schedule.setStartTime(scheduleDetails.getStartTime());
        }
        
        if (scheduleDetails.getEndTime() != null) {
            schedule.setEndTime(scheduleDetails.getEndTime());
        }
        
        if (scheduleDetails.getRoom() != null) {
            schedule.setRoom(scheduleDetails.getRoom());
        }
        
        if (scheduleDetails.getStatus() != null) {
            schedule.setStatus(scheduleDetails.getStatus());
        }
        
        if (scheduleDetails.getBuilding() != null) {
            schedule.setBuilding(scheduleDetails.getBuilding());
        }
        
        if (scheduleDetails.getTermId() != null) {
            schedule.setTermId(scheduleDetails.getTermId());
        }
        
        if (scheduleDetails.getIsActive() != null) {
            schedule.setIsActive(scheduleDetails.getIsActive());
        }
        
        if (scheduleDetails.getSpecificDate() != null) {
            schedule.setSpecificDate(scheduleDetails.getSpecificDate());
        }
        
        if (scheduleDetails.getIsRecurring() != null) {
            schedule.setIsRecurring(scheduleDetails.getIsRecurring());
        }
        
        if (scheduleDetails.getRecurrenceCount() != null) {
            schedule.setRecurrenceCount(scheduleDetails.getRecurrenceCount());
        }
        
        return classScheduleRepository.save(schedule);
    }

    public boolean deleteClassSchedule(Integer id) {
        if (classScheduleRepository.existsById(id)) {
            classScheduleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<String> getAvailableSemesters() {
        // This method needs to be updated since the semester column is removed
        // You might want to fetch this information from the Term entity instead
        return List.of("Spring", "Summer", "Fall", "Winter");
    }

    public List<String> getAvailableAcademicYears() {
        // This method needs to be updated since the academicYear column is removed
        // You might want to fetch this information from the Term entity instead
        return List.of("2023-2024", "2024-2025", "2025-2026");
    }
    
    public List<Integer> getAvailableTermIds() {
        return classScheduleRepository.findDistinctTermIds();
    }

    /**
     * Creates multiple recurring schedules based on a base schedule
     * @param baseSchedule The base schedule with recurring information
     * @return List of created schedules
     */
    public List<ClassSchedule> createRecurringSchedules(ClassSchedule baseSchedule) {
        List<ClassSchedule> createdSchedules = new ArrayList<>();
        
        // Validate required fields
        if (baseSchedule.getRecurrenceCount() == null || baseSchedule.getRecurrenceCount() <= 0) {
            baseSchedule.setRecurrenceCount(1); // Default to 1 if not specified
        }
        
        // Create the base schedule
        ClassSchedule firstSchedule = new ClassSchedule();
        firstSchedule.setSubjectId(baseSchedule.getSubjectId());
        firstSchedule.setClassId(baseSchedule.getClassId());
        firstSchedule.setLecturerId(baseSchedule.getLecturerId());
        firstSchedule.setStartTime(baseSchedule.getStartTime());
        firstSchedule.setEndTime(baseSchedule.getEndTime());
        firstSchedule.setRoom(baseSchedule.getRoom());
        firstSchedule.setStatus(baseSchedule.getStatus());
        firstSchedule.setBuilding(baseSchedule.getBuilding());
        firstSchedule.setTermId(baseSchedule.getTermId());
        firstSchedule.setIsActive(baseSchedule.getIsActive());
        firstSchedule.setIsRecurring(true);
        firstSchedule.setRecurrenceCount(baseSchedule.getRecurrenceCount());
        
        // Set the specific date for the first schedule
        firstSchedule.setSpecificDate(LocalDate.now());
        
        // Save the first schedule
        ClassSchedule savedFirstSchedule = classScheduleRepository.save(firstSchedule);
        createdSchedules.add(savedFirstSchedule);
        
        // Create additional recurring schedules if needed
        for (int i = 1; i < baseSchedule.getRecurrenceCount(); i++) {
            ClassSchedule recurringSchedule = new ClassSchedule();
            recurringSchedule.setSubjectId(baseSchedule.getSubjectId());
            recurringSchedule.setClassId(baseSchedule.getClassId());
            recurringSchedule.setLecturerId(baseSchedule.getLecturerId());
            recurringSchedule.setStartTime(baseSchedule.getStartTime());
            recurringSchedule.setEndTime(baseSchedule.getEndTime());
            recurringSchedule.setRoom(baseSchedule.getRoom());
            recurringSchedule.setStatus(baseSchedule.getStatus());
            recurringSchedule.setBuilding(baseSchedule.getBuilding());
            recurringSchedule.setTermId(baseSchedule.getTermId());
            recurringSchedule.setIsActive(baseSchedule.getIsActive());
            recurringSchedule.setIsRecurring(true);
            recurringSchedule.setRecurrenceCount(baseSchedule.getRecurrenceCount());
            
            // Set specific date for this recurring instance
            // For weekly recurrence, add 7 days for each iteration
            LocalDate specificDate = LocalDate.now().plusDays(7 * i);
            recurringSchedule.setSpecificDate(specificDate);
            
            // Save the recurring schedule
            ClassSchedule savedRecurringSchedule = classScheduleRepository.save(recurringSchedule);
            createdSchedules.add(savedRecurringSchedule);
        }
        
        return createdSchedules;
    }
    
    /**
     * Gets class schedules for a specific date
     * @param classId The class ID
     * @param date The specific date
     * @return List of class schedules for that date
     */
    public List<ClassSchedule> getClassSchedulesByDate(String classId, LocalDate date) {
        // Get schedules with the specific date
        List<ClassSchedule> specificDateSchedules = classScheduleRepository
            .findByClassIdAndSpecificDate(classId, date);
        
        // Get regular schedules without specific dates
        List<ClassSchedule> regularSchedules = classScheduleRepository
            .findByClassIdAndSpecificDateIsNull(classId);
        
        // Combine both lists, with specific date schedules taking precedence
        List<ClassSchedule> allSchedules = new ArrayList<>(specificDateSchedules);
        
        // Add regular schedules only if there's no specific date schedule for the same time slot
        for (ClassSchedule regularSchedule : regularSchedules) {
            boolean hasConflict = specificDateSchedules.stream()
                .anyMatch(specificSchedule -> 
                    specificSchedule.getStartTime().equals(regularSchedule.getStartTime()) &&
                    specificSchedule.getEndTime().equals(regularSchedule.getEndTime()));
            
            if (!hasConflict) {
                // Create a copy with the specific date
                ClassSchedule scheduleWithDate = new ClassSchedule();
                scheduleWithDate.setId(regularSchedule.getId());
                scheduleWithDate.setSubjectId(regularSchedule.getSubjectId());
                scheduleWithDate.setClassId(regularSchedule.getClassId());
                scheduleWithDate.setLecturerId(regularSchedule.getLecturerId());
                scheduleWithDate.setStartTime(regularSchedule.getStartTime());
                scheduleWithDate.setEndTime(regularSchedule.getEndTime());
                scheduleWithDate.setRoom(regularSchedule.getRoom());
                scheduleWithDate.setStatus(regularSchedule.getStatus());
                scheduleWithDate.setBuilding(regularSchedule.getBuilding());
                scheduleWithDate.setTermId(regularSchedule.getTermId());
                scheduleWithDate.setIsActive(regularSchedule.getIsActive());
                scheduleWithDate.setSpecificDate(date);
                
                allSchedules.add(scheduleWithDate);
            }
        }
        
        return allSchedules;
    }
    
    /**
     * Gets class schedules for a date range
     * @param classId The class ID
     * @param startDate The start date
     * @param endDate The end date
     * @return List of class schedules for that date range
     */
    public List<ClassSchedule> getClassSchedulesByDateRange(String classId, LocalDate startDate, LocalDate endDate) {
        // Get all specific date schedules within the range
        List<ClassSchedule> specificDateSchedules = classScheduleRepository
            .findByClassIdAndSpecificDateBetween(classId, startDate, endDate);
        
        // Get all regular weekly schedules
        List<ClassSchedule> regularSchedules = classScheduleRepository
            .findByClassIdAndSpecificDateIsNull(classId);
        
        // Combine both lists, with specific date schedules taking precedence
        List<ClassSchedule> allSchedules = new ArrayList<>(specificDateSchedules);
        
        // For each day in the range, add regular schedules for that day
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            LocalDate finalCurrentDate = currentDate;
            
            // For each regular schedule, check if there's a specific date schedule
            for (ClassSchedule regularSchedule : regularSchedules) {
                boolean hasConflict = specificDateSchedules.stream()
                    .anyMatch(specificSchedule -> 
                        specificSchedule.getSpecificDate() != null &&
                        specificSchedule.getSpecificDate().equals(finalCurrentDate) &&
                        specificSchedule.getStartTime().equals(regularSchedule.getStartTime()) &&
                        specificSchedule.getEndTime().equals(regularSchedule.getEndTime()));
                
                if (!hasConflict) {
                    // Create a copy of the regular schedule with the specific date
                    ClassSchedule scheduleForDate = new ClassSchedule();
                    scheduleForDate.setId(regularSchedule.getId());
                    scheduleForDate.setSubjectId(regularSchedule.getSubjectId());
                    scheduleForDate.setClassId(regularSchedule.getClassId());
                    scheduleForDate.setLecturerId(regularSchedule.getLecturerId());
                    scheduleForDate.setStartTime(regularSchedule.getStartTime());
                    scheduleForDate.setEndTime(regularSchedule.getEndTime());
                    scheduleForDate.setRoom(regularSchedule.getRoom());
                    scheduleForDate.setStatus(regularSchedule.getStatus());
                    scheduleForDate.setBuilding(regularSchedule.getBuilding());
                    scheduleForDate.setTermId(regularSchedule.getTermId());
                    scheduleForDate.setIsActive(regularSchedule.getIsActive());
                    scheduleForDate.setSpecificDate(finalCurrentDate);
                    
                    allSchedules.add(scheduleForDate);
                }
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        return allSchedules;
    }
    
    // Combined Schedule Methods
    public Map<String, Object> getWeeklySchedule(Integer userId, String classId, LocalDate weekStart) {
        Map<String, Object> weeklySchedule = new HashMap<>();
        
        // Get personal schedules for the week
        LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
        LocalDateTime weekEndDateTime = weekStart.plusDays(6).atTime(23, 59, 59);
        List<PersonalSchedule> personalSchedules = getUserSchedulesByDateRange(userId, weekStartDateTime, weekEndDateTime);
        
        // Get class schedules for the date range
        List<ClassSchedule> classSchedules = getClassSchedulesByDateRange(classId, weekStart, weekStart.plusDays(6));
        
        // Group personal schedules by day
        Map<Integer, List<PersonalSchedule>> personalByDay = new HashMap<>();
        for (int i = 1; i <= 7; i++) {
            final int dayValue = i;
            List<PersonalSchedule> daySchedules = personalSchedules.stream()
                .filter(schedule -> schedule.getStartTime().getDayOfWeek().getValue() == dayValue)
                .collect(Collectors.toList());
            personalByDay.put(i, daySchedules);
        }
        
        // Group class schedules by day
        Map<Integer, List<ClassSchedule>> classByDay = new HashMap<>();
        for (int i = 1; i <= 7; i++) {
            final int dayValue = i;
            final LocalDate dayDate = weekStart.plusDays(dayValue - 1);
            List<ClassSchedule> daySchedules = classSchedules.stream()
                .filter(schedule -> {
                    if (schedule.getSpecificDate() != null) {
                        return schedule.getSpecificDate().equals(dayDate);
                    }
                    return false;
                })
                .collect(Collectors.toList());
            classByDay.put(dayValue, daySchedules);
        }
        
        weeklySchedule.put("personalSchedules", personalByDay);
        weeklySchedule.put("classSchedules", classByDay);
        
        return weeklySchedule;
    }

    public Map<String, Object> getTodaySchedule(Integer userId, String classId) {
        LocalDate today = LocalDate.now();
        return getWeeklySchedule(userId, classId, today);
    }

    public List<ClassSchedule> getAllClassSchedules() {
        return classScheduleRepository.findAll();
    }

    public ClassSchedule createOneTimeSchedule(ClassSchedule schedule) {
        // Set the specific date if not already set
        if (schedule.getSpecificDate() == null) {
            schedule.setSpecificDate(LocalDate.now());
        }
        
        // Validate the schedule for conflicts
        Map<String, Boolean> conflicts = validateScheduleForConflicts(schedule);
        if (conflicts.get("lecturerConflict") || conflicts.get("classConflict") || conflicts.get("roomConflict")) {
            throw new RuntimeException("Schedule conflicts detected");
        }
        
        // Save the schedule
        return classScheduleRepository.save(schedule);
    }

    /**
     * Get a schedule by ID
     * @param id The ID of the schedule
     * @return The schedule or null if not found
     */
    public ClassSchedule getScheduleById(Integer id) {
        return classScheduleRepository.findById(id).orElse(null);
    }
    
    /**
     * Create a schedule (alias for createClassSchedule)
     * @param schedule The schedule to create
     * @return The created schedule
     */
    public ClassSchedule createSchedule(ClassSchedule schedule) {
        return createClassSchedule(schedule);
    }
    
    /**
     * Validates if a schedule has any conflicts
     * @param schedule The schedule to validate
     * @param excludeScheduleId Optional ID to exclude from conflict checking (for updates)
     * @return Map with conflict flags
     */
    public Map<String, Boolean> validateScheduleForConflicts(ClassSchedule schedule, Integer excludeScheduleId) {
        Map<String, Boolean> conflicts = new HashMap<>();
        
        // Check for required fields
        if (schedule.getSubjectId() == null || schedule.getClassId() == null || 
            schedule.getLecturerId() == null || schedule.getStartTime() == null || 
            schedule.getEndTime() == null) {
            
            conflicts.put("missingFields", true);
            conflicts.put("lecturerConflict", false);
            conflicts.put("classConflict", false);
            conflicts.put("roomConflict", false);
            return conflicts;
        }
        
        boolean lecturerConflict = hasLecturerScheduleConflict(
            schedule.getLecturerId(), schedule.getSpecificDate(),
            schedule.getStartTime(), schedule.getEndTime(), excludeScheduleId
        );
        
        boolean classConflict = hasClassScheduleConflict(
            schedule.getClassId(), schedule.getSpecificDate(),
            schedule.getStartTime(), schedule.getEndTime(), excludeScheduleId
        );
        
        boolean roomConflict = false;
        if (schedule.getRoom() != null && schedule.getRoom().getId() != null) {
            roomConflict = hasRoomScheduleConflict(
                schedule.getRoom().getId(), schedule.getSpecificDate(),
                schedule.getStartTime(), schedule.getEndTime(), excludeScheduleId
            );
        }
        
        conflicts.put("missingFields", false);
        conflicts.put("lecturerConflict", lecturerConflict);
        conflicts.put("classConflict", classConflict);
        conflicts.put("roomConflict", roomConflict);
        
        return conflicts;
    }

    /**
     * Validates a class schedule before saving
     * @param schedule The schedule to validate
     * @return The validated schedule
     */
    public ClassSchedule validateSchedule(ClassSchedule schedule) {
        // Check required fields
        if (schedule.getSubjectId() == null || schedule.getClassId() == null || 
            schedule.getLecturerId() == null || schedule.getStartTime() == null || 
            schedule.getEndTime() == null) {
            throw new IllegalArgumentException("Missing required fields for class schedule");
        }
        
        // Additional validation logic can be added here
        
        return schedule;
    }
} 