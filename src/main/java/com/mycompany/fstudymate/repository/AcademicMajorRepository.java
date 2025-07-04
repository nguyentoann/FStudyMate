package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.AcademicMajor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicMajorRepository extends JpaRepository<AcademicMajor, Integer> {
    
    Optional<AcademicMajor> findByName(String name);
    
    boolean existsByName(String name);
} 