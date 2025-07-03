package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TermRepository extends JpaRepository<Term, Integer> {
    
    Optional<Term> findByName(String name);
    
    boolean existsByName(String name);
} 