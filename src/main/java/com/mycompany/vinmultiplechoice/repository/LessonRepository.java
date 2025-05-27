package com.mycompany.vinmultiplechoice.repository;

import com.mycompany.vinmultiplechoice.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    // Add custom queries if needed
} 