package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Integer> {

    List<EventParticipant> findByEventId(Integer eventId);

    List<EventParticipant> findByUserId(Integer userId);

    Optional<EventParticipant> findByEventIdAndUserId(Integer eventId, Integer userId);

    @Query("SELECT ep FROM EventParticipant ep WHERE ep.eventId = :eventId AND ep.status = :status")
    List<EventParticipant> findByEventIdAndStatus(@Param("eventId") Integer eventId, 
                                                 @Param("status") EventParticipant.ParticipantStatus status);

    @Query("SELECT COUNT(ep) FROM EventParticipant ep WHERE ep.eventId = :eventId AND ep.status = 'registered'")
    Long countRegisteredParticipantsByEventId(@Param("eventId") Integer eventId);

    @Query("SELECT COUNT(ep) FROM EventParticipant ep WHERE ep.eventId = :eventId AND ep.status = 'attended'")
    Long countAttendedParticipantsByEventId(@Param("eventId") Integer eventId);

    boolean existsByEventIdAndUserId(Integer eventId, Integer userId);
} 