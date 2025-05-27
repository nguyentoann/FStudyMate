package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    
    List<Question> findByMaMonAndMaDe(String maMon, String maDe);
    
    @Query(value = "SELECT q.* FROM Questions q " +
           "LEFT JOIN Quizzes qz ON q.quiz_id = qz.id " +
           "WHERE (q.MaMon = ?1 AND q.MaDe = ?2) " + 
           "OR (q.quiz_id IS NOT NULL AND qz.MaMon = ?1 AND qz.MaDe = ?2)", 
           nativeQuery = true)
    List<Question> findByMaMonAndMaDeIncludingQuizzes(String maMon, String maDe);
    
    @Query(value = "SELECT DISTINCT COALESCE(q.MaMon, q.mamon) FROM Quizzes q WHERE COALESCE(q.MaMon, q.mamon) IS NOT NULL " +
                  "UNION " +
                  "SELECT DISTINCT COALESCE(q.MaMon, q.mamon) FROM Questions q WHERE COALESCE(q.MaMon, q.mamon) IS NOT NULL", 
           nativeQuery = true)
    List<String> findDistinctMaMon();
    
    @Query(value = "SELECT DISTINCT COALESCE(q.MaDe, q.made) FROM Quizzes q WHERE (COALESCE(q.MaMon, q.mamon) = ?1 OR LOWER(COALESCE(q.MaMon, q.mamon)) = LOWER(?1)) " +
                  "UNION " +
                  "SELECT DISTINCT COALESCE(q.MaDe, q.made) FROM Questions q WHERE (COALESCE(q.MaMon, q.mamon) = ?1 OR LOWER(COALESCE(q.MaMon, q.mamon)) = LOWER(?1)) AND q.quiz_id IS NULL", 
           nativeQuery = true)
    List<String> findDistinctMaDeByMaMon(String maMon);
    
    @Query(value = "SELECT q.* FROM Questions q " +
          "LEFT JOIN QuizPermissions qp ON q.quiz_id = qp.quiz_id " +
          "WHERE q.MaMon = ?1 AND (qp.class_id = ?2 OR q.quiz_id IS NULL)",
          nativeQuery = true)
    List<Question> findByMaMonWithPermissions(String maMon, String classId);
    
    @Query(value = "SELECT DISTINCT q.MaDe FROM Quizzes q " +
          "LEFT JOIN QuizPermissions qp ON q.id = qp.quiz_id " +
          "WHERE q.MaMon = ?1 AND (qp.class_id = ?2 OR qp.class_id IS NULL OR q.id NOT IN (SELECT DISTINCT quiz_id FROM QuizPermissions)) " +
          "UNION " +
          "SELECT DISTINCT q.MaDe FROM Questions q WHERE q.MaMon = ?1 AND q.quiz_id IS NULL",
          nativeQuery = true)
    List<String> findDistinctMaDeByMaMonWithPermissions(String maMon, String classId);
    
    @Modifying
    @Query(value = "INSERT INTO Quizzes (title, MaMon, MaDe, description, user_id, is_ai_generated, security_level) " +
           "VALUES (:title, :maMon, :maDe, :description, :userId, 1, 0)", 
           nativeQuery = true)
    void createAIQuiz(@Param("title") String title, @Param("maMon") String maMon, @Param("maDe") String maDe, 
                      @Param("description") String description, @Param("userId") Integer userId);
    
    @Modifying
    @Query(value = "INSERT INTO QuizPermissions (quiz_id, class_id) " +
           "VALUES ((SELECT MAX(id) FROM Quizzes WHERE user_id = :userId), :classId)", 
           nativeQuery = true)
    void addDefaultQuizPermission(@Param("userId") Integer userId, @Param("classId") String classId);
    
    @Query(value = "SELECT q.* FROM Questions q " + 
           "JOIN Quizzes qz ON q.quiz_id = qz.id " +
           "WHERE qz.user_id = ?1 AND qz.is_ai_generated = 1 " +
           "ORDER BY q.ID DESC",
           nativeQuery = true)
    List<Question> findAIGeneratedQuestionsByUserId(Integer userId);
    
    @Query(value = "SELECT LAST_INSERT_ID()",
           nativeQuery = true)
    Integer getLastInsertedQuizId();
} 