package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Event;
import com.mycompany.fstudymate.model.EventParticipant;
import com.mycompany.fstudymate.repository.EventRepository;
import com.mycompany.fstudymate.repository.EventParticipantRepository;
import com.mycompany.fstudymate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventParticipantRepository eventParticipantRepository;

    @Autowired
    private UserRepository userRepository;

    // Event Methods
    public List<Event> getAllPublicEvents() {
        return eventRepository.findByIsPublicTrueOrderByStartDateAsc();
    }

    public List<Event> getUpcomingPublicEvents() {
        return eventRepository.findUpcomingPublicEvents(LocalDateTime.now());
    }

    public List<Event> getEventsByOrganizer(Integer organizerId) {
        return eventRepository.findByOrganizerIdOrderByStartDateAsc(organizerId);
    }

    public List<Event> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findPublicEventsByDateRange(startDate, endDate);
    }

    public List<Event> getEventsByType(Event.EventType eventType) {
        return eventRepository.findPublicEventsByType(eventType);
    }

    public List<Event> getEventsWithOpenRegistration() {
        return eventRepository.findEventsWithOpenRegistration(LocalDateTime.now());
    }

    public Optional<Event> getEventById(Integer id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(Event event) {
        event.setOrganizerId(event.getOrganizerId());
        event.setCurrentParticipants(0);
        return eventRepository.save(event);
    }

    public Event updateEvent(Integer id, Event eventDetails) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setTitle(eventDetails.getTitle());
            event.setDescription(eventDetails.getDescription());
            event.setStartDate(eventDetails.getStartDate());
            event.setEndDate(eventDetails.getEndDate());
            event.setLocation(eventDetails.getLocation());
            event.setEventType(eventDetails.getEventType());
            event.setMaxParticipants(eventDetails.getMaxParticipants());
            event.setIsPublic(eventDetails.getIsPublic());
            event.setRegistrationDeadline(eventDetails.getRegistrationDeadline());
            event.setImageUrl(eventDetails.getImageUrl());
            return eventRepository.save(event);
        }
        return null;
    }

    public boolean deleteEvent(Integer id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Event Participant Methods
    public boolean registerForEvent(Integer eventId, Integer userId) {
        // Check if event exists and registration is still open
        Optional<Event> optionalEvent = eventRepository.findById(eventId);
        if (!optionalEvent.isPresent()) {
            return false;
        }

        Event event = optionalEvent.get();
        
        // Check if registration deadline has passed
        if (event.getRegistrationDeadline() != null && 
            LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            return false;
        }

        // Check if user is already registered
        if (eventParticipantRepository.existsByEventIdAndUserId(eventId, userId)) {
            return false;
        }

        // Check if event is full
        if (event.getMaxParticipants() != null && 
            event.getCurrentParticipants() >= event.getMaxParticipants()) {
            return false;
        }

        // Create participant record
        EventParticipant participant = new EventParticipant();
        participant.setEventId(eventId);
        participant.setUserId(userId);
        participant.setStatus(EventParticipant.ParticipantStatus.registered);
        
        eventParticipantRepository.save(participant);

        // Update event participant count
        event.setCurrentParticipants(event.getCurrentParticipants() + 1);
        eventRepository.save(event);

        return true;
    }

    public boolean cancelEventRegistration(Integer eventId, Integer userId) {
        Optional<EventParticipant> optionalParticipant = 
            eventParticipantRepository.findByEventIdAndUserId(eventId, userId);
        
        if (optionalParticipant.isPresent()) {
            EventParticipant participant = optionalParticipant.get();
            participant.setStatus(EventParticipant.ParticipantStatus.cancelled);
            eventParticipantRepository.save(participant);

            // Update event participant count
            Optional<Event> optionalEvent = eventRepository.findById(eventId);
            if (optionalEvent.isPresent()) {
                Event event = optionalEvent.get();
                event.setCurrentParticipants(Math.max(0, event.getCurrentParticipants() - 1));
                eventRepository.save(event);
            }

            return true;
        }
        return false;
    }

    public boolean markAttendance(Integer eventId, Integer userId) {
        Optional<EventParticipant> optionalParticipant = 
            eventParticipantRepository.findByEventIdAndUserId(eventId, userId);
        
        if (optionalParticipant.isPresent()) {
            EventParticipant participant = optionalParticipant.get();
            participant.setStatus(EventParticipant.ParticipantStatus.attended);
            eventParticipantRepository.save(participant);
            return true;
        }
        return false;
    }

    public List<EventParticipant> getEventParticipants(Integer eventId) {
        return eventParticipantRepository.findByEventId(eventId);
    }

    public List<EventParticipant> getEventParticipantsByStatus(Integer eventId, EventParticipant.ParticipantStatus status) {
        return eventParticipantRepository.findByEventIdAndStatus(eventId, status);
    }

    public List<Event> getUserRegisteredEvents(Integer userId) {
        List<EventParticipant> participants = eventParticipantRepository.findByUserId(userId);
        return participants.stream()
            .map(participant -> eventRepository.findById(participant.getEventId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Object> getEventStatistics(Integer eventId) {
        Map<String, Object> statistics = new HashMap<>();
        
        Long registeredCount = eventParticipantRepository.countRegisteredParticipantsByEventId(eventId);
        Long attendedCount = eventParticipantRepository.countAttendedParticipantsByEventId(eventId);
        
        statistics.put("registeredCount", registeredCount);
        statistics.put("attendedCount", attendedCount);
        
        Optional<Event> optionalEvent = eventRepository.findById(eventId);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            statistics.put("maxParticipants", event.getMaxParticipants());
            statistics.put("currentParticipants", event.getCurrentParticipants());
            
            if (event.getMaxParticipants() != null) {
                double registrationRate = (double) registeredCount / event.getMaxParticipants() * 100;
                statistics.put("registrationRate", Math.round(registrationRate * 100.0) / 100.0);
            }
        }
        
        return statistics;
    }
} 