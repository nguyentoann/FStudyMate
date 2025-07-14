package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.dto.QuestionBankImportDTO;
import com.mycompany.fstudymate.model.QuestionBank;
import com.mycompany.fstudymate.model.QuestionBankQuestion;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface QuestionBankService {
    
    /**
     * Create a new question bank
     */
    QuestionBank createQuestionBank(QuestionBank questionBank);
    
    /**
     * Get a question bank by ID
     */
    QuestionBank getQuestionBankById(Long id);
    
    /**
     * Get all question banks
     */
    List<QuestionBank> getAllQuestionBanks();
    
    /**
     * Get question banks by subject ID
     */
    List<QuestionBank> getQuestionBanksBySubjectId(Integer subjectId);
    
    /**
     * Update a question bank
     */
    QuestionBank updateQuestionBank(QuestionBank questionBank);
    
    /**
     * Delete a question bank
     */
    void deleteQuestionBank(Long id);
    
    /**
     * Import questions from XML file
     */
    QuestionBank importQuestionsFromXml(MultipartFile xmlFile, Integer subjectId, Integer userId) throws IOException;
    
    /**
     * Export questions to XML
     */
    String exportQuestionsToXml(Long questionBankId) throws IOException;
    
    /**
     * Search questions by keyword
     */
    List<QuestionBankQuestion> searchQuestions(String keyword);
    
    /**
     * Search questions by answer text
     */
    List<QuestionBankQuestion> searchQuestionsByAnswerText(String keyword);
    
    /**
     * Get random questions from a question bank
     */
    List<QuestionBankQuestion> getRandomQuestions(Long bankId, int count, String questionType);
} 