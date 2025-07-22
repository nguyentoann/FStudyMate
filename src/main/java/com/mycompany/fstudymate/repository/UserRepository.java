package com.mycompany.fstudymate.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mycompany.fstudymate.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Find by ID (using Optional as per Spring Data conventions)
    Optional<User> findById(int id);
    
    // Find by username
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(String role);
    
    List<User> findByClassId(String classId);
    
    int countByClassId(String classId);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);

    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);
} 