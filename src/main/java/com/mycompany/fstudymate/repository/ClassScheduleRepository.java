package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.ClassSchedule;
import com.mycompany.fstudymate.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Integer> {

    List<ClassSchedule> findByClassIdAndIsActiveTrueOrderByStartTimeAsc(String classId);
    
    List<ClassSchedule> findByClassId(String classId);

    List<ClassSchedule> findByLecturerIdAndIsActiveTrueOrderByStartTimeAsc(Integer lecturerId);

    List<ClassSchedule> findBySubjectIdAndIsActiveTrueOrderByStartTimeAsc(Integer subjectId);

    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.classId = :classId AND cs.termId = :termId AND cs.isActive = true ORDER BY cs.startTime ASC")
    List<ClassSchedule> findByClassIdAndTermId(@Param("classId") String classId, 
                                              @Param("termId") Integer termId);

    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.lecturerId = :lecturerId AND cs.termId = :termId AND cs.isActive = true ORDER BY cs.startTime ASC")
    List<ClassSchedule> findByLecturerIdAndTermId(@Param("lecturerId") Integer lecturerId, 
                                                @Param("termId") Integer termId);

    @Query("SELECT DISTINCT cs.termId FROM ClassSchedule cs WHERE cs.isActive = true ORDER BY cs.termId DESC")
    List<Integer> findDistinctTermIds();

    List<ClassSchedule> findByRoom(Room room);
    List<ClassSchedule> findByStatus(ClassSchedule.Status status);
    
    // Methods for specific date schedules
    List<ClassSchedule> findByClassIdAndSpecificDate(String classId, LocalDate specificDate);
    
    List<ClassSchedule> findByClassIdAndSpecificDateIsNull(String classId);
    
    List<ClassSchedule> findByClassIdAndSpecificDateBetween(String classId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.classId = :classId AND cs.specificDate IS NOT NULL ORDER BY cs.specificDate ASC, cs.startTime ASC")
    List<ClassSchedule> findByClassIdAndSpecificDateIsNotNull(@Param("classId") String classId);
} 