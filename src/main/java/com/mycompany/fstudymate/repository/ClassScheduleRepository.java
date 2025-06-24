package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Integer> {

    List<ClassSchedule> findByClassIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(String classId);

    List<ClassSchedule> findByLecturerIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(Integer lecturerId);

    List<ClassSchedule> findBySubjectIdAndIsActiveTrueOrderByDayOfWeekAscStartTimeAsc(Integer subjectId);

    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.classId = :classId AND cs.semester = :semester AND cs.academicYear = :academicYear AND cs.isActive = true ORDER BY cs.dayOfWeek ASC, cs.startTime ASC")
    List<ClassSchedule> findByClassIdAndSemesterAndAcademicYear(@Param("classId") String classId, 
                                                               @Param("semester") String semester, 
                                                               @Param("academicYear") String academicYear);

    @Query("SELECT cs FROM ClassSchedule cs WHERE cs.lecturerId = :lecturerId AND cs.semester = :semester AND cs.academicYear = :academicYear AND cs.isActive = true ORDER BY cs.dayOfWeek ASC, cs.startTime ASC")
    List<ClassSchedule> findByLecturerIdAndSemesterAndAcademicYear(@Param("lecturerId") Integer lecturerId, 
                                                                  @Param("semester") String semester, 
                                                                  @Param("academicYear") String academicYear);

    @Query("SELECT DISTINCT cs.semester FROM ClassSchedule cs WHERE cs.isActive = true ORDER BY cs.semester DESC")
    List<String> findDistinctSemesters();

    @Query("SELECT DISTINCT cs.academicYear FROM ClassSchedule cs WHERE cs.isActive = true ORDER BY cs.academicYear DESC")
    List<String> findDistinctAcademicYears();
} 