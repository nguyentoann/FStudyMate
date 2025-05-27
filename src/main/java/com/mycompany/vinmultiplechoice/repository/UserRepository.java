package com.mycompany.vinmultiplechoice.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mycompany.vinmultiplechoice.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Find by ID (using Optional as per Spring Data conventions)
    Optional<User> findById(int id);
    
    // Find by username
    Optional<User> findByUsername(String username);
} 