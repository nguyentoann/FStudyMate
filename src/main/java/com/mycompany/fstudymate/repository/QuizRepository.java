package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    
    List<Quiz> findByUserId(Integer userId);
    
    List<Quiz> findByMaMon(String maMon);
    
    List<Quiz> findByMaMonAndMaDe(String maMon, String maDe);
    
    @Query("SELECT q FROM Quiz q WHERE q.maMon = ?1 AND q.isAiGenerated = true")
    List<Quiz> findAiGeneratedQuizzesByMaMon(String maMon);
} 