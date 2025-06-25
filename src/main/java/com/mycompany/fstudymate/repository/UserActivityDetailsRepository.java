package com.mycompany.fstudymate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mycompany.fstudymate.model.UserActivityDetails;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityDetailsRepository extends JpaRepository<UserActivityDetails, Long> {
    
    // Find all by session ID
    List<UserActivityDetails> findAllBySessionId(Integer sessionId);
    
    // Find first by session ID ordered by creation date (most recent first)
    Optional<UserActivityDetails> findFirstBySessionIdOrderByCreatedAtDesc(Integer sessionId);
} 