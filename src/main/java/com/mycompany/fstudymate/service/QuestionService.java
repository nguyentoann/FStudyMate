package com.mycompany.fstudymate.service;

import com.mycompany.fstudymate.model.Question;
import com.mycompany.fstudymate.model.Lesson;

import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface QuestionService {
    
    List<Question> getQuestionsByMaMonAndMaDe(String maMon, String maDe);
    
    List<String> getAllMaMon();
    
    List<String> getMaDeByMaMon(String maMon);
    
    List<String> getMaDeByMaMonWithPermissions(String maMon, String classId);
    
    Optional<Question> getQuestionById(Integer id);
    
    List<Question> getAllQuestions();
    
    Optional<Lesson> getLessonById(Integer id);
    
    String getSubjectNameById(Integer subjectId);
    
    List<Question> createQuestionsFromAIResponse(String aiResponse, String maMon, String maDe);
    
    // New methods for AI quiz generation
    Map<String, Object> createAIQuiz(String title, String maMon, String maDe, 
                                    String description, Integer userId, String classId);
                                    
    List<Question> getAIGeneratedQuizzesByUserId(Integer userId);
    
    void setQuizIdForQuestions(List<Integer> questionIds, Integer quizId);
    
    Map<String, Object> getQuizMetadata(String maMon, String maDe);
    
    Map<String, Map<String, Object>> getQuizMetadataForSubject(String maMon);
} 