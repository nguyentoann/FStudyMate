package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

    List<Event> findByOrganizerIdOrderByStartDateAsc(Integer organizerId);

    List<Event> findByIsPublicTrueOrderByStartDateAsc();

    @Query("SELECT e FROM Event e WHERE e.startDate >= :startDate AND e.startDate <= :endDate AND e.isPublic = true ORDER BY e.startDate ASC")
    List<Event> findPublicEventsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Event e WHERE e.eventType = :eventType AND e.isPublic = true ORDER BY e.startDate ASC")
    List<Event> findPublicEventsByType(@Param("eventType") Event.EventType eventType);

    @Query("SELECT e FROM Event e WHERE e.startDate >= :now AND e.isPublic = true ORDER BY e.startDate ASC LIMIT 10")
    List<Event> findUpcomingPublicEvents(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.organizerId = :organizerId AND e.startDate >= :startDate AND e.startDate <= :endDate ORDER BY e.startDate ASC")
    List<Event> findByOrganizerIdAndDateRange(@Param("organizerId") Integer organizerId, 
                                             @Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Event e WHERE e.registrationDeadline >= :now AND e.isPublic = true ORDER BY e.registrationDeadline ASC")
    List<Event> findEventsWithOpenRegistration(@Param("now") LocalDateTime now);
} 