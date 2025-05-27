package com.mycompany.fstudymate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mycompany.fstudymate.model.UserActivityDetails;

import java.util.Optional;

@Repository
public interface UserActivityDetailsRepository extends JpaRepository<UserActivityDetails, Long> {
    
    // Find by session ID
    Optional<UserActivityDetails> findBySessionId(Integer sessionId);
} 