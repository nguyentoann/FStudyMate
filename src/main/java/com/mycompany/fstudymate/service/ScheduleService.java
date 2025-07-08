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
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
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
        return classScheduleRepository.findByClassIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(classId);
    }

    public List<ClassSchedule> getLecturerSchedules(Integer lecturerId) {
        return classScheduleRepository.findByLecturerIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(lecturerId);
    }

    public List<ClassSchedule> getSubjectSchedules(Integer subjectId) {
        return classScheduleRepository.findBySubjectIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(subjectId);
    }

    public List<ClassSchedule> getClassSchedulesBySemester(String classId, String semester, String academicYear) {
        // Since semester and academicYear columns are removed, we now use termId instead
        // This method needs to be updated based on how you want to handle this change
        return classScheduleRepository.findByClassId(classId);
    }
    
    public List<ClassSchedule> getClassSchedulesByTerm(String classId, Integer termId) {
        return classScheduleRepository.findByClassIdAndTermId(classId, termId);
    }

    public ClassSchedule createClassSchedule(ClassSchedule schedule) {
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
            schedule.setDayOfWeek(scheduleDetails.getDayOfWeek());
            schedule.setStartTime(scheduleDetails.getStartTime());
            schedule.setEndTime(scheduleDetails.getEndTime());
            schedule.setRoom(scheduleDetails.getRoom());
            schedule.setBuilding(scheduleDetails.getBuilding());
            schedule.setTermId(scheduleDetails.getTermId());
            schedule.setIsActive(scheduleDetails.getIsActive());
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
        
        Map<DayOfWeek, List<ClassSchedule>> classByDay = classSchedules.stream()
            .collect(Collectors.groupingBy(schedule -> DayOfWeek.of(schedule.getDayOfWeek())));
        
        weeklySchedule.put("personalSchedules", personalByDay);
        weeklySchedule.put("classSchedules", classByDay);
        
        return weeklySchedule;
    }

    public Map<String, Object> getTodaySchedule(Integer userId, String classId) {
        LocalDate today = LocalDate.now();
        return getWeeklySchedule(userId, classId, today);
    }
} 