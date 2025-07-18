package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.ClassSchedule;
import com.mycompany.fstudymate.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Integer> {

    List<ClassSchedule> findByClassIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(String classId);
    
    List<ClassSchedule> findByClassId(String classId);

    List<ClassSchedule> findByLecturerIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(Integer lecturerId);

    List<ClassSchedule> findBySubjectIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(Integer subjectId);

    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.classId = :classId AND cs.termId = :termId AND cs.isActive = true ORDER BY cs.dayOfWeek ASC, cs.startTime ASC")
    List<ClassSchedule> findByClassIdAndTermId(@Param("classId") String classId, 
                                              @Param("termId") Integer termId);

    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.lecturerId = :lecturerId AND cs.termId = :termId AND cs.isActive = true ORDER BY cs.dayOfWeek ASC, cs.startTime ASC")
    List<ClassSchedule> findByLecturerIdAndTermId(@Param("lecturerId") Integer lecturerId, 
                                                @Param("termId") Integer termId);

    @Query("SELECT DISTINCT cs.termId FROM ClassSchedule cs WHERE cs.isActive = true ORDER BY cs.termId DESC")
    List<Integer> findDistinctTermIds();

    List<ClassSchedule> findByRoom(Room room);
    List<ClassSchedule> findByStatus(ClassSchedule.Status status);
} 