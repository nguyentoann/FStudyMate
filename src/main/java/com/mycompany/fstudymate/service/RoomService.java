package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Room;

import java.util.List;
import java.util.Optional;

public interface RoomService {
    
    /**
     * Get all rooms
     */
    List<Room> getAllRooms();
    
    /**
     * Get room by ID
     */
    Optional<Room> getRoomById(Integer id);
    
    /**
     * Get room by name
     */
    Optional<Room> getRoomByName(String name);
    
    /**
     * Get rooms by location
     */
    List<Room> getRoomsByLocation(String location);
    
    /**
     * Get rooms with IR control capability
     */
    List<Room> getRoomsWithIrControl();
    
    /**
     * Get room by device ID
     */
    Optional<Room> getRoomByDeviceId(String deviceId);
    
    /**
     * Save a new room
     */
    Room saveRoom(Room room);
    
    /**
     * Update an existing room
     */
    Room updateRoom(Integer id, Room room);
    
    /**
     * Delete a room
     */
    void deleteRoom(Integer id);
    
    /**
     * Assign IR device to a room
     */
    Room assignIrDevice(Integer roomId, String deviceId);
    
    /**
     * Remove IR device from a room
     */
    Room removeIrDevice(Integer roomId);
} 