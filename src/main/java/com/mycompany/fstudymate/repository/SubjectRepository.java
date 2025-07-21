package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    
    @Query("SELECT s.name FROM Subject s WHERE s.id = :id")
    String findNameById(@Param("id") Integer id);
    
    List<Subject> findAllByActiveTrue();
    
    List<Subject> findByTermNo(Integer termNo);
    
    List<Subject> findByTermNoAndActiveTrue(Integer termNo);
    
    Subject findByCode(String code);
} 