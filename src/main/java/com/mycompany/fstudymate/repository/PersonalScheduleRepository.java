package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.PersonalSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PersonalScheduleRepository extends JpaRepository<PersonalSchedule, Integer> {

    List<PersonalSchedule> findByUserIdOrderByStartTimeAsc(Integer userId);

    @Query("SELECT ps FROM PersonalSchedule ps WHERE ps.userId = :userId AND ps.startTime >= :startDate AND ps.startTime <= :endDate ORDER BY ps.startTime ASC")
    List<PersonalSchedule> findByUserIdAndDateRange(@Param("userId") Integer userId, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT ps FROM PersonalSchedule ps WHERE ps.userId = :userId AND ps.type = :type ORDER BY ps.startTime ASC")
    List<PersonalSchedule> findByUserIdAndType(@Param("userId") Integer userId, 
                                              @Param("type") PersonalSchedule.ScheduleType type);

    @Query("SELECT ps FROM PersonalSchedule ps WHERE ps.userId = :userId AND ps.isReminderSent = false AND ps.startTime > :now ORDER BY ps.startTime ASC")
    List<PersonalSchedule> findUpcomingSchedulesWithReminders(@Param("userId") Integer userId, 
                                                             @Param("now") LocalDateTime now);

    @Query("SELECT ps FROM PersonalSchedule ps WHERE ps.userId = :userId AND ps.startTime >= :today ORDER BY ps.startTime ASC LIMIT 5")
    List<PersonalSchedule> findNextFiveSchedules(@Param("userId") Integer userId, 
                                                @Param("today") LocalDateTime today);
} 