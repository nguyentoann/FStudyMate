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
     * @param dayOfWeek The day of the week (1-7 where 1 is Monday)
     * @param startTime The start time of the class
     * @param endTime The end time of the class
     * @param excludeScheduleId Optional schedule ID to exclude from checking (useful for updates)
     * @return true if there is a conflict, false otherwise
     */
    public boolean hasLecturerScheduleConflict(Integer lecturerId, Integer dayOfWeek, 
                                             LocalTime startTime, LocalTime endTime, 
                                             Integer excludeScheduleId) {
        // Safety check for null parameters
        if (lecturerId == null || dayOfWeek == null || startTime == null || endTime == null) {
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
                Integer scheduleDayOfWeek = schedule.getDayOfWeekValue();
                return scheduleDayOfWeek != null &&
                    scheduleDayOfWeek.equals(dayOfWeek) && 
                    schedule.getStartTime() != null &&
                    schedule.getEndTime() != null &&
                    ((startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime())) ||
                     startTime.equals(schedule.getStartTime()) || endTime.equals(schedule.getEndTime()));
            });
    }

    /**
     * Checks if there are any scheduling conflicts for a class
     * @param classId The ID of the class
     * @param dayOfWeek The day of the week (1-7 where 1 is Monday)
     * @param startTime The start time of the class
     * @param endTime The end time of the class
     * @param excludeScheduleId Optional schedule ID to exclude from checking (useful for updates)
     * @return true if there is a conflict, false otherwise
     */
    public boolean hasClassScheduleConflict(String classId, Integer dayOfWeek,
                                          LocalTime startTime, LocalTime endTime,
                                          Integer excludeScheduleId) {
        // Safety check for null parameters
        if (classId == null || dayOfWeek == null || startTime == null || endTime == null) {
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
                Integer scheduleDayOfWeek = schedule.getDayOfWeekValue();
                return scheduleDayOfWeek != null &&
                    scheduleDayOfWeek.equals(dayOfWeek) && 
                    schedule.getStartTime() != null &&
                    schedule.getEndTime() != null &&
                    ((startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime())) ||
                     startTime.equals(schedule.getStartTime()) || endTime.equals(schedule.getEndTime()));
            });
    }

    /**
     * Checks if there are any scheduling conflicts for a room
     * @param roomId The ID of the room
     * @param dayOfWeek The day of the week (1-7 where 1 is Monday)
     * @param startTime The start time of the class
     * @param endTime The end time of the class
     * @param excludeScheduleId Optional schedule ID to exclude from checking (useful for updates)
     * @return true if there is a conflict, false otherwise
     */
    public boolean hasRoomScheduleConflict(Integer roomId, Integer dayOfWeek,
                                         LocalTime startTime, LocalTime endTime,
                                         Integer excludeScheduleId) {
        // Safety check for null parameters
        if (roomId == null || dayOfWeek == null || startTime == null || endTime == null) {
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
                Integer scheduleDayOfWeek = schedule.getDayOfWeekValue();
                return scheduleDayOfWeek != null &&
                    scheduleDayOfWeek.equals(dayOfWeek) && 
                    schedule.getStartTime() != null &&
                    schedule.getEndTime() != null &&
                    ((startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime())) ||
                     startTime.equals(schedule.getStartTime()) || endTime.equals(schedule.getEndTime()));
            });
    }

    /**
     * Validates a new schedule for conflicts
     * @param schedule The schedule to validate
     * @param scheduleId Optional schedule ID to exclude from conflict checks
     * @return A map containing conflict information, empty if no conflicts
     */
    public Map<String, Boolean> validateScheduleForConflicts(ClassSchedule schedule, Integer scheduleId) {
        Map<String, Boolean> conflicts = new HashMap<>();
        
        // Initialize with no conflicts
        conflicts.put("lecturerConflict", false);
        conflicts.put("classConflict", false);
        conflicts.put("roomConflict", false);
        
        // Validate required fields
        if (schedule.getLecturerId() == null || schedule.getClassId() == null || 
            schedule.getStartTime() == null || schedule.getEndTime() == null || 
            schedule.getRoom() == null) {
            return conflicts; // Return no conflicts if missing fields
        }
        
        // Get day of week value from schedule's specificDate if available
        Integer dayOfWeek = schedule.getDayOfWeekValue();
        if (dayOfWeek == null) {
            return conflicts; // Return no conflicts if missing day of week
        }
        
        boolean lecturerConflict = hasLecturerScheduleConflict(
            schedule.getLecturerId(), dayOfWeek,
            schedule.getStartTime(), schedule.getEndTime(), scheduleId
        );
        
        boolean classConflict = hasClassScheduleConflict(
            schedule.getClassId(), dayOfWeek,
            schedule.getStartTime(), schedule.getEndTime(), scheduleId
        );
        
        boolean roomConflict = false;
        // Only check room conflicts if room is provided and has a valid ID
        if (schedule.getRoom() != null && schedule.getRoom().getId() != null) {
            roomConflict = hasRoomScheduleConflict(
                schedule.getRoom().getId(), dayOfWeek,
                schedule.getStartTime(), schedule.getEndTime(), scheduleId
            );
        }
        
        conflicts.put("lecturerConflict", lecturerConflict);
        conflicts.put("classConflict", classConflict);
        conflicts.put("roomConflict", roomConflict);
        
        return conflicts;
    }

    public ClassSchedule createClassSchedule(ClassSchedule schedule) {
        // Đảm bảo schedule.getRoom() là Room entity hợp lệ
        // Đảm bảo schedule.getStatus() là giá trị hợp lệ
        return classScheduleRepository.save(schedule);
    }

    public Optional<ClassSchedule> getClassScheduleById(Integer id) {
        return classScheduleRepository.findById(id);
    }

    public ClassSchedule updateClassSchedule(Integer id, ClassSchedule scheduleDetails) {
        Optional<ClassSchedule> optionalSchedule = classScheduleRepository.findById(id);
        if (optionalSchedule.isPresent()) {
            ClassSchedule schedule = optionalSchedule.get();
            schedule.setSubjectId(scheduleDetails.getSubjectId());
            schedule.setClassId(scheduleDetails.getClassId());
            schedule.setLecturerId(scheduleDetails.getLecturerId());
            schedule.setStartTime(scheduleDetails.getStartTime());
            schedule.setEndTime(scheduleDetails.getEndTime());
            schedule.setRoom(scheduleDetails.getRoom());
            schedule.setStatus(scheduleDetails.getStatus());
            schedule.setBuilding(scheduleDetails.getBuilding());
            schedule.setTermId(scheduleDetails.getTermId());
            schedule.setIsActive(scheduleDetails.getIsActive());
            schedule.setSpecificDate(scheduleDetails.getSpecificDate());
            schedule.setIsRecurring(scheduleDetails.getIsRecurring());
            schedule.setRecurrenceCount(scheduleDetails.getRecurrenceCount());
            return classScheduleRepository.save(schedule);
        }
        return null;
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

    // Combined Schedule Methods
    public Map<String, Object> getWeeklySchedule(Integer userId, String classId, LocalDate weekStart) {
        Map<String, Object> weeklySchedule = new HashMap<>();
        
        // Get personal schedules for the week
        LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
        LocalDateTime weekEndDateTime = weekStart.plusDays(6).atTime(23, 59, 59);
        List<PersonalSchedule> personalSchedules = getUserSchedulesByDateRange(userId, weekStartDateTime, weekEndDateTime);
        
        // Get class schedules
        List<ClassSchedule> classSchedules = getClassSchedules(classId);
        
        // Group by day of week
        Map<DayOfWeek, List<PersonalSchedule>> personalByDay = personalSchedules.stream()
            .collect(Collectors.groupingBy(schedule -> schedule.getStartTime().getDayOfWeek()));
        
        // Use a different approach for class schedules since they might not have a DayOfWeek
        Map<Integer, List<ClassSchedule>> classByDayInt = new HashMap<>();
        for (ClassSchedule schedule : classSchedules) {
            Integer dayValue = schedule.getDayOfWeekValue();
            if (dayValue != null) {
                if (!classByDayInt.containsKey(dayValue)) {
                    classByDayInt.put(dayValue, new ArrayList<>());
                }
                classByDayInt.get(dayValue).add(schedule);
            }
        }
        
        // Convert Integer keys to DayOfWeek for API consistency
        Map<DayOfWeek, List<ClassSchedule>> classByDay = new HashMap<>();
        for (Map.Entry<Integer, List<ClassSchedule>> entry : classByDayInt.entrySet()) {
            if (entry.getKey() >= 1 && entry.getKey() <= 7) {
                classByDay.put(DayOfWeek.of(entry.getKey()), entry.getValue());
            }
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

    public ClassSchedule getScheduleById(Integer id) {
        return classScheduleRepository.findById(id).orElse(null);
    }

    public ClassSchedule createSchedule(ClassSchedule schedule) {
        return classScheduleRepository.save(schedule);
    }

    public ClassSchedule updateSchedule(Integer id, ClassSchedule scheduleDetails) {
        Optional<ClassSchedule> optionalSchedule = classScheduleRepository.findById(id);
        if (optionalSchedule.isPresent()) {
            ClassSchedule schedule = optionalSchedule.get();
            schedule.setSubjectId(scheduleDetails.getSubjectId());
            schedule.setClassId(scheduleDetails.getClassId());
            schedule.setLecturerId(scheduleDetails.getLecturerId());
            schedule.setStartTime(scheduleDetails.getStartTime());
            schedule.setEndTime(scheduleDetails.getEndTime());
            schedule.setRoom(scheduleDetails.getRoom());
            schedule.setStatus(scheduleDetails.getStatus());
            schedule.setBuilding(scheduleDetails.getBuilding());
            schedule.setTermId(scheduleDetails.getTermId());
            schedule.setIsActive(scheduleDetails.getIsActive());
            schedule.setSpecificDate(scheduleDetails.getSpecificDate());
            schedule.setIsRecurring(scheduleDetails.getIsRecurring());
            schedule.setRecurrenceCount(scheduleDetails.getRecurrenceCount());
            return classScheduleRepository.save(schedule);
        }
        return null;
    }

    public ClassSchedule createOneTimeSchedule(ClassSchedule schedule) {
        // Ensure this is marked as a one-time schedule
        schedule.setIsRecurring(false);
        
        // Make sure specific date is set
        if (schedule.getSpecificDate() == null) {
            throw new IllegalArgumentException("Specific date is required for one-time schedules");
        }
        
        return classScheduleRepository.save(schedule);
    }

    public List<ClassSchedule> createRecurringSchedules(ClassSchedule baseSchedule) {
        if (baseSchedule.getSpecificDate() == null) {
            throw new IllegalArgumentException("Specific date is required for recurring schedules");
        }
        
        if (baseSchedule.getRecurrenceCount() == null || baseSchedule.getRecurrenceCount() < 1) {
            baseSchedule.setRecurrenceCount(1);
        }
        
        List<ClassSchedule> createdSchedules = new ArrayList<>();
        
        // Create the first schedule
        ClassSchedule firstSchedule = new ClassSchedule();
        copyScheduleProperties(baseSchedule, firstSchedule);
        firstSchedule = classScheduleRepository.save(firstSchedule);
        createdSchedules.add(firstSchedule);
        
        // Create subsequent schedules
        LocalDate startDate = baseSchedule.getSpecificDate();
        for (int i = 1; i < baseSchedule.getRecurrenceCount(); i++) {
            // Create a new schedule for each recurrence
            ClassSchedule recurrenceSchedule = new ClassSchedule();
            copyScheduleProperties(baseSchedule, recurrenceSchedule);
            
            // Calculate the date for this recurrence
            LocalDate recurrenceDate = startDate.plusWeeks(i); // Default to weekly recurrence
            recurrenceSchedule.setSpecificDate(recurrenceDate);
            
            // Save the recurrence schedule
            recurrenceSchedule = classScheduleRepository.save(recurrenceSchedule);
            createdSchedules.add(recurrenceSchedule);
        }
        
        return createdSchedules;
    }

    private void copyScheduleProperties(ClassSchedule source, ClassSchedule target) {
        target.setSubjectId(source.getSubjectId());
        target.setClassId(source.getClassId());
        target.setLecturerId(source.getLecturerId());
        target.setStartTime(source.getStartTime());
        target.setEndTime(source.getEndTime());
        target.setRoom(source.getRoom());
        target.setStatus(source.getStatus());
        target.setBuilding(source.getBuilding());
        target.setTermId(source.getTermId());
        target.setIsActive(source.getIsActive());
        target.setSpecificDate(source.getSpecificDate());
        target.setIsRecurring(source.getIsRecurring());
        target.setRecurrenceCount(source.getRecurrenceCount());
    }

    public List<ClassSchedule> getClassSchedulesByDate(String classId, LocalDate date) {
        return classScheduleRepository.findByClassIdAndSpecificDate(classId, date);
    }

    public List<ClassSchedule> getClassSchedulesByDateRange(String classId, LocalDate startDate, LocalDate endDate) {
        return classScheduleRepository.findByClassIdAndSpecificDateBetween(classId, startDate, endDate);
    }
} 