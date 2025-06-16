package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.QuizTaken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizTakenRepository extends JpaRepository<QuizTaken, Integer> {
    
    // Find all quiz attempts by user ID
    List<QuizTaken> findByUserIdOrderByStartTimeDesc(Integer userId);
    
    // Find all quiz attempts for a specific quiz
    List<QuizTaken> findByQuizIdOrderByStartTimeDesc(Integer quizId);
    
    // Find all completed quiz attempts by user ID
    List<QuizTaken> findByUserIdAndStatusOrderByStartTimeDesc(Integer userId, QuizTaken.QuizStatus status);
    
    // Find latest attempt for a user on a specific quiz
    Optional<QuizTaken> findFirstByUserIdAndQuizIdOrderByStartTimeDesc(Integer userId, Integer quizId);
    
    // Find in-progress attempts for a user
    List<QuizTaken> findByUserIdAndStatus(Integer userId, QuizTaken.QuizStatus status);
    
    // Count number of attempts for a user on a specific quiz
    long countByUserIdAndQuizId(Integer userId, Integer quizId);
    
    // Get average score for a quiz across all users
    @Query("SELECT AVG(qt.percentage) FROM QuizTaken qt WHERE qt.quizId = ?1 AND qt.status = 'COMPLETED'")
    Double getAverageScoreForQuiz(Integer quizId);
    
    // Get highest scores for each user on a specific quiz
    @Query("SELECT qt FROM QuizTaken qt WHERE qt.quizId = ?1 AND qt.status = 'COMPLETED' " +
           "AND qt.id IN (SELECT MAX(qt2.id) FROM QuizTaken qt2 " +
           "WHERE qt2.quizId = ?1 AND qt2.status = 'COMPLETED' GROUP BY qt2.userId)")
    List<QuizTaken> getHighestScoresForQuiz(Integer quizId);
} 