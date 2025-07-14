package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "question_bank_answers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuestionBankAnswer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnoreProperties({"answers", "bank", "hibernateLazyInitializer", "handler"})
    private QuestionBankQuestion question;
    
    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT")
    private String answerText;
    
    @Column(precision = 10, scale = 7, nullable = false)
    private BigDecimal fraction;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public QuestionBankQuestion getQuestion() {
        return question;
    }
    
    public void setQuestion(QuestionBankQuestion question) {
        this.question = question;
    }
    
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