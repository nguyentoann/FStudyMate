package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Room findByName(String name);
} 