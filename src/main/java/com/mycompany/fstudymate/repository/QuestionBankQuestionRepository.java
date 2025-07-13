package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.QuestionBankQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankQuestionRepository extends JpaRepository<QuestionBankQuestion, Long> {
    
    List<QuestionBankQuestion> findByBankId(Long bankId);
    
    @Query("SELECT q FROM QuestionBankQuestion q WHERE q.bank.id = :bankId AND q.questionType = :questionType")
    List<QuestionBankQuestion> findByBankIdAndQuestionType(
            @Param("bankId") Long bankId, 
            @Param("questionType") String questionType);
    
    @Query("SELECT q FROM QuestionBankQuestion q WHERE q.questionText LIKE %:keyword% OR q.name LIKE %:keyword%")
    List<QuestionBankQuestion> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT q FROM QuestionBankQuestion q JOIN q.answers a WHERE a.answerText LIKE %:keyword%")
    List<QuestionBankQuestion> findByAnswerTextContaining(@Param("keyword") String keyword);
    
    @Query("SELECT q FROM QuestionBankQuestion q WHERE q.bank.subject.id = :subjectId")
    List<QuestionBankQuestion> findBySubjectId(@Param("subjectId") Long subjectId);
} 