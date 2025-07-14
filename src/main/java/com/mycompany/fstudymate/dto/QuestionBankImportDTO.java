package com.mycompany.fstudymate.dto;

import java.math.BigDecimal;
import java.util.List;

public class QuestionBankImportDTO {
    private String name;
    private String description;
    private Long subjectId;
    private List<QuestionImportDTO> questions;
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Long getSubjectId() {
        return subjectId;
    }
    
    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }
    
    public List<QuestionImportDTO> getQuestions() {
        return questions;
    }
    
    public void setQuestions(List<QuestionImportDTO> questions) {
        this.questions = questions;
    }
    
    // Inner class for question import
    public static class QuestionImportDTO {
        private String questionType;
        private String name;
        private String questionText;
        private BigDecimal defaultGrade;
        private BigDecimal penalty;
        private Boolean singleAnswer;
        private Boolean shuffleAnswers;
        private String language;
        private List<AnswerImportDTO> answers;
        
        // Getters and Setters
        public String getQuestionType() {
            return questionType;
        }
        
        public void setQuestionType(String questionType) {
            this.questionType = questionType;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getQuestionText() {
            return questionText;
        }
        
        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }
        
        public BigDecimal getDefaultGrade() {
            return defaultGrade;
        }
        
        public void setDefaultGrade(BigDecimal defaultGrade) {
            this.defaultGrade = defaultGrade;
        }
        
        public BigDecimal getPenalty() {
            return penalty;
        }
        
        public void setPenalty(BigDecimal penalty) {
            this.penalty = penalty;
        }
        
        public Boolean getSingleAnswer() {
            return singleAnswer;
        }
        
        public void setSingleAnswer(Boolean singleAnswer) {
            this.singleAnswer = singleAnswer;
        }
        
        public Boolean getShuffleAnswers() {
            return shuffleAnswers;
        }
        
        public void setShuffleAnswers(Boolean shuffleAnswers) {
            this.shuffleAnswers = shuffleAnswers;
        }
        
        public String getLanguage() {
            return language;
        }
        
        public void setLanguage(String language) {
            this.language = language;
        }
        
        public List<AnswerImportDTO> getAnswers() {
            return answers;
        }
        
        public void setAnswers(List<AnswerImportDTO> answers) {
            this.answers = answers;
        }
    }
    
    // Inner class for answer import
    public static class AnswerImportDTO {
        private String answerText;
        private BigDecimal fraction;
        private String feedback;
        
        // Getters and Setters
        public String getAnswerText() {
            return answerText;
        }
        
        public void setAnswerText(String answerText) {
            this.answerText = answerText;
        }
        
        public BigDecimal getFraction() {
            return fraction;
        }
        
        public void setFraction(BigDecimal fraction) {
            this.fraction = fraction;
        }
        
        public String getFeedback() {
            return feedback;
        }
        
        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }
    }
} 