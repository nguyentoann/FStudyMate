package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.model.QuestionBank;
import com.mycompany.fstudymate.model.QuestionBankQuestion;
import com.mycompany.fstudymate.model.User;
import com.mycompany.fstudymate.service.QuestionBankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/question-banks")
@CrossOrigin(origins = "*") // Allow requests from any origin
public class QuestionBankController {

    private static final Logger logger = LoggerFactory.getLogger(QuestionBankController.class);

    @Autowired
    private QuestionBankService questionBankService;

    @GetMapping
    public ResponseEntity<List<QuestionBank>> getAllQuestionBanks() {
        return ResponseEntity.ok(questionBankService.getAllQuestionBanks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionBank> getQuestionBankById(@PathVariable Long id) {
        logger.info("Getting question bank by id: {}", id);
        try {
            QuestionBank bank = questionBankService.getQuestionBankById(id);
            
            // Ensure questions are loaded
            if (bank.getQuestions() != null) {
                logger.info("Found {} questions in bank", bank.getQuestions().size());
            } else {
                logger.warn("No questions found in bank with id: {}", id);
            }
            
            return ResponseEntity.ok(bank);
        } catch (Exception e) {
            logger.error("Error getting question bank by id: {}", id, e);
            throw e;
        }
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<QuestionBank>> getQuestionBanksBySubjectId(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(questionBankService.getQuestionBanksBySubjectId(subjectId));
    }

    @PostMapping
    public ResponseEntity<QuestionBank> createQuestionBank(@RequestBody QuestionBank questionBank) {
        return new ResponseEntity<>(questionBankService.createQuestionBank(questionBank), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionBank> updateQuestionBank(@PathVariable Long id, @RequestBody QuestionBank questionBank) {
        questionBank.setId(id);
        return ResponseEntity.ok(questionBankService.updateQuestionBank(questionBank));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestionBank(@PathVariable Long id) {
        questionBankService.deleteQuestionBank(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<QuestionBank> importQuestionsFromXml(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subjectId", required = false) Integer subjectId,
            @RequestParam(value = "userId", required = false) String userIdStr) throws IOException {
        
        // Log the received parameters
        System.out.println("Received import request - File: " + file.getOriginalFilename() 
                + ", SubjectId: " + subjectId + ", UserId: " + userIdStr);
        
        // Convert userId to Integer
        Integer userId = null;
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                userId = Integer.parseInt(userIdStr);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid user ID format: " + userIdStr);
            }
        }
        
        if (userId == null) {
            throw new RuntimeException("User ID is required for importing questions");
        }
        
        QuestionBank questionBank = questionBankService.importQuestionsFromXml(file, subjectId, userId);
        return new ResponseEntity<>(questionBank, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<String> exportQuestionsToXml(@PathVariable Long id) throws IOException {
        String xmlContent = questionBankService.exportQuestionsToXml(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);
        headers.setContentDispositionFormData("attachment", "question_bank_" + id + ".xml");
        
        return new ResponseEntity<>(xmlContent, headers, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<QuestionBankQuestion>> searchQuestions(@RequestParam String keyword) {
        return ResponseEntity.ok(questionBankService.searchQuestions(keyword));
    }

    @GetMapping("/search/answers")
    public ResponseEntity<List<QuestionBankQuestion>> searchQuestionsByAnswerText(@RequestParam String keyword) {
        return ResponseEntity.ok(questionBankService.searchQuestionsByAnswerText(keyword));
    }

    @GetMapping("/{bankId}/random")
    public ResponseEntity<List<QuestionBankQuestion>> getRandomQuestions(
            @PathVariable Long bankId,
            @RequestParam int count,
            @RequestParam(required = false) String questionType) {
        
        return ResponseEntity.ok(questionBankService.getRandomQuestions(bankId, count, questionType));
    }
} 