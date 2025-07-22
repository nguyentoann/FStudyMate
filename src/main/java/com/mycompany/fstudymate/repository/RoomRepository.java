package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    
    /**
     * Find room by name
     */
    Optional<Room> findByName(String name);
    
    /**
     * Find rooms by location
     */
    List<Room> findByLocation(String location);
    
    /**
     * Find rooms with IR control
     */
    List<Room> findByHasIrControlTrue();
    
    /**
     * Find room by device ID
     */
    Optional<Room> findByDeviceId(String deviceId);
} 