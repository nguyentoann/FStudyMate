package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.model.Room;
import com.mycompany.fstudymate.repository.RoomRepository;
import com.mycompany.fstudymate.service.RoomService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    public Optional<Room> getRoomById(Integer id) {
        return roomRepository.findById(id);
    }

    @Override
    public Optional<Room> getRoomByName(String name) {
        return roomRepository.findByName(name);
    }

    @Override
    public List<Room> getRoomsByLocation(String location) {
        return roomRepository.findByLocation(location);
    }

    @Override
    public List<Room> getRoomsWithIrControl() {
        return roomRepository.findByHasIrControlTrue();
    }

    @Override
    public Optional<Room> getRoomByDeviceId(String deviceId) {
        return roomRepository.findByDeviceId(deviceId);
    }

    @Override
    public Room saveRoom(Room room) {
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        return roomRepository.save(room);
    }

    @Override
    public Room updateRoom(Integer id, Room roomDetails) {
        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + id));
        
        existingRoom.setName(roomDetails.getName());
        existingRoom.setLocation(roomDetails.getLocation());
        existingRoom.setFloor(roomDetails.getFloor());
        existingRoom.setCapacity(roomDetails.getCapacity());
        
        // Only update IR control fields if they are provided
        if (roomDetails.getHasIrControl() != null) {
            existingRoom.setHasIrControl(roomDetails.getHasIrControl());
        }
        if (roomDetails.getDeviceId() != null) {
            existingRoom.setDeviceId(roomDetails.getDeviceId());
        }
        
        existingRoom.setUpdatedAt(LocalDateTime.now());
        return roomRepository.save(existingRoom);
    }

    @Override
    public void deleteRoom(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + id));
        
        roomRepository.delete(room);
    }

    @Override
    public Room assignIrDevice(Integer roomId, String deviceId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + roomId));
        
        // Check if device ID is already assigned to another room
        Optional<Room> existingRoomWithDevice = roomRepository.findByDeviceId(deviceId);
        if (existingRoomWithDevice.isPresent() && !existingRoomWithDevice.get().getId().equals(roomId)) {
            throw new IllegalStateException("Device ID is already assigned to another room: " + 
                    existingRoomWithDevice.get().getName());
        }
        
        room.setHasIrControl(true);
        room.setDeviceId(deviceId);
        room.setUpdatedAt(LocalDateTime.now());
        
        return roomRepository.save(room);
    }

    @Override
    public Room removeIrDevice(Integer roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + roomId));
        
        room.setHasIrControl(false);
        room.setDeviceId(null);
        room.setUpdatedAt(LocalDateTime.now());
        
        return roomRepository.save(room);
    }
} 