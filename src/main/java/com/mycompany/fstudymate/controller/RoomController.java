package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.Room;
import com.mycompany.fstudymate.service.RoomService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;
    
    /**
     * Get all rooms
     */
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }
    
    /**
     * Get a specific room by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Integer id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get a room by name
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getRoomByName(@PathVariable String name) {
        return roomService.getRoomByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get rooms by location
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Room>> getRoomsByLocation(@PathVariable String location) {
        return ResponseEntity.ok(roomService.getRoomsByLocation(location));
    }
    
    /**
     * Get rooms with IR control capability
     */
    @GetMapping("/ir-control")
    public ResponseEntity<List<Room>> getRoomsWithIrControl() {
        return ResponseEntity.ok(roomService.getRoomsWithIrControl());
    }
    
    /**
     * Create a new room
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> createRoom(@Valid @RequestBody Room room) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomService.saveRoom(room));
    }
    
    /**
     * Update an existing room
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRoom(@PathVariable Integer id, @Valid @RequestBody Room room) {
        try {
            return ResponseEntity.ok(roomService.updateRoom(id, room));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    /**
     * Delete a room
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRoom(@PathVariable Integer id) {
        try {
            roomService.deleteRoom(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Room deleted successfully");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    /**
     * Assign an IR device to a room
     */
    @PutMapping("/{id}/assign-device/{deviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignDevice(@PathVariable Integer id, @PathVariable String deviceId) {
        try {
            Room room = roomService.assignIrDevice(id, deviceId);
            return ResponseEntity.ok(room);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Remove an IR device from a room
     */
    @PutMapping("/{id}/remove-device")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeDevice(@PathVariable Integer id) {
        try {
            Room room = roomService.removeIrDevice(id);
            return ResponseEntity.ok(room);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
} 