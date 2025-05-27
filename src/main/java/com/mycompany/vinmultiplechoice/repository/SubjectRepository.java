package com.mycompany.vinmultiplechoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<com.mycompany.vinmultiplechoice.model.Subject, Integer> {
    
    @Query("SELECT s.name FROM Subject s WHERE s.id = :id")
    String findNameById(@Param("id") Integer id);
} 