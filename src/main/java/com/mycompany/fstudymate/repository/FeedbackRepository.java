package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Feedback;
import com.mycompany.fstudymate.model.Feedback.FeedbackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Tìm các feedback theo type và targetId
    List<Feedback> findByTypeAndTargetIdOrderByCreatedAtDesc(FeedbackType type, String targetId);
    
    // Tìm các feedback theo type và targetId với eager loading của user
    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.user WHERE f.type = :type AND f.targetId = :targetId ORDER BY f.createdAt DESC")
    List<Feedback> findByTypeAndTargetIdWithUser(@Param("type") FeedbackType type, @Param("targetId") String targetId);
    
    // Tìm các feedback do người dùng tạo ra
    List<Feedback> findByCreatedByOrderByCreatedAtDesc(Integer createdBy);
    
    // Tìm các feedback theo type
    List<Feedback> findByTypeOrderByCreatedAtDesc(FeedbackType type);
    
    // Tìm các feedback theo type với eager loading của user
    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.user WHERE f.type = :type ORDER BY f.createdAt DESC")
    List<Feedback> findByTypeWithUser(@Param("type") FeedbackType type);
    
    // Tìm các feedback theo lessonId với eager loading của user và lesson
    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.user LEFT JOIN FETCH f.lesson WHERE f.lessonId = :lessonId ORDER BY f.createdAt DESC")
    List<Feedback> findByLessonIdWithUser(@Param("lessonId") Integer lessonId);
} 