package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    // Add custom queries if needed
} 