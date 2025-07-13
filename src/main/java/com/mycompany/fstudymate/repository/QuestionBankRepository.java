package com.mycompany.fstudymate.repository;

import com.mycompany.fstudymate.model.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    
    List<QuestionBank> findBySubjectId(Integer subjectId);
    
    List<QuestionBank> findByCreatedById(Integer userId);
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.subject.id = :subjectId AND qb.name LIKE %:keyword%")
    List<QuestionBank> searchBySubjectAndName(@Param("subjectId") Integer subjectId, @Param("keyword") String keyword);
    
    @Query("SELECT qb FROM QuestionBank qb JOIN qb.questions q WHERE q.questionText LIKE %:keyword%")
    List<QuestionBank> findByQuestionTextContaining(@Param("keyword") String keyword);
} 