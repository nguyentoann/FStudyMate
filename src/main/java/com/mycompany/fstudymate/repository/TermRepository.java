package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TermRepository extends JpaRepository<Term, Integer> {
    
    List<Term> findAllByOrderByIdAsc();
    
    Term findByName(String name);
} 