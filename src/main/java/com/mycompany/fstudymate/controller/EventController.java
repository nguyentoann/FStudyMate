package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Event;
import com.mycompany.fstudymate.model.EventParticipant;
import com.mycompany.fstudymate.service.EventService;
import com.mycompany.fstudymate.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserActivityService userActivityService;

    // Event Endpoints
    @GetMapping("/public")
    public ResponseEntity<List<Event>> getAllPublicEvents() {
        try {
            List<Event> events = eventService.getAllPublicEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/public/upcoming")
    public ResponseEntity<List<Event>> getUpcomingPublicEvents() {
        try {
            List<Event> events = eventService.getUpcomingPublicEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Event>> getEventsByOrganizer(@PathVariable Integer organizerId) {
        try {
            List<Event> events = eventService.getEventsByOrganizer(organizerId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/public/range")
    public ResponseEntity<List<Event>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<Event> events = eventService.getEventsByDateRange(startDate, endDate);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/public/type/{eventType}")
    public ResponseEntity<List<Event>> getEventsByType(@PathVariable Event.EventType eventType) {
        try {
            List<Event> events = eventService.getEventsByType(eventType);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/public/registration-open")
    public ResponseEntity<List<Event>> getEventsWithOpenRegistration() {
        try {
            List<Event> events = eventService.getEventsWithOpenRegistration();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Integer id) {
        try {
            Optional<Event> event = eventService.getEventById(id);
            return event.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        try {
            Event createdEvent = eventService.createEvent(event);
            return ResponseEntity.ok(createdEvent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Integer id, @RequestBody Event eventDetails) {
        try {
            Event updatedEvent = eventService.updateEvent(id, eventDetails);
            if (updatedEvent != null) {
                return ResponseEntity.ok(updatedEvent);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        try {
            boolean deleted = eventService.deleteEvent(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Event Participant Endpoints
    @PostMapping("/{eventId}/register/{userId}")
    public ResponseEntity<Map<String, Object>> registerForEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        try {
            boolean registered = eventService.registerForEvent(eventId, userId);
            Map<String, Object> response = Map.of(
                "success", registered,
                "message", registered ? "Successfully registered for event" : "Failed to register for event"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{eventId}/cancel/{userId}")
    public ResponseEntity<Map<String, Object>> cancelEventRegistration(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        try {
            boolean cancelled = eventService.cancelEventRegistration(eventId, userId);
            Map<String, Object> response = Map.of(
                "success", cancelled,
                "message", cancelled ? "Successfully cancelled registration" : "Failed to cancel registration"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{eventId}/attend/{userId}")
    public ResponseEntity<Map<String, Object>> markAttendance(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        try {
            boolean marked = eventService.markAttendance(eventId, userId);
            Map<String, Object> response = Map.of(
                "success", marked,
                "message", marked ? "Successfully marked attendance" : "Failed to mark attendance"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{eventId}/participants")
    public ResponseEntity<List<EventParticipant>> getEventParticipants(@PathVariable Integer eventId) {
        try {
            List<EventParticipant> participants = eventService.getEventParticipants(eventId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{eventId}/participants/{status}")
    public ResponseEntity<List<EventParticipant>> getEventParticipantsByStatus(
            @PathVariable Integer eventId,
            @PathVariable EventParticipant.ParticipantStatus status) {
        try {
            List<EventParticipant> participants = eventService.getEventParticipantsByStatus(eventId, status);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}/registered")
    public ResponseEntity<List<Event>> getUserRegisteredEvents(@PathVariable Integer userId) {
        try {
            List<Event> events = eventService.getUserRegisteredEvents(userId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{eventId}/statistics")
    public ResponseEntity<Map<String, Object>> getEventStatistics(@PathVariable Integer eventId) {
        try {
            Map<String, Object> statistics = eventService.getEventStatistics(eventId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/check-registration/{eventId}/{userId}")
    public ResponseEntity<Map<String, Object>> checkEventRegistration(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        try {
            Optional<EventParticipant> participant = eventService.getEventParticipants(eventId).stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst();
            
            Map<String, Object> response = Map.of(
                "isRegistered", participant.isPresent(),
                "status", participant.map(EventParticipant::getStatus).orElse(null)
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 