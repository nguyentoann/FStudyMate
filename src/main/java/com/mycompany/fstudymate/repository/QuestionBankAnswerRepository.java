package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.QuestionBankAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankAnswerRepository extends JpaRepository<QuestionBankAnswer, Long> {
    
    List<QuestionBankAnswer> findByQuestionId(Long questionId);
    
    @Query("SELECT a FROM QuestionBankAnswer a WHERE a.answerText LIKE %:keyword%")
    List<QuestionBankAnswer> findByAnswerTextContaining(@Param("keyword") String keyword);
    
    void deleteByQuestionId(Long questionId);
} 