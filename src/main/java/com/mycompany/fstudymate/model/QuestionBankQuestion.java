package com.mycompany.fstudymate.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "question_bank_questions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuestionBankQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "bank_id", nullable = false)
    @JsonIgnoreProperties({"questions", "hibernateLazyInitializer", "handler"})
    private QuestionBank bank;
    
    @Column(name = "question_type", nullable = false)
    private String questionType;
    
    private String name;
    
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Column(name = "default_grade", precision = 10, scale = 7)
    private BigDecimal defaultGrade = new BigDecimal("1.0");
    
    @Column(precision = 10, scale = 7)
    private BigDecimal penalty = new BigDecimal("0.0");
    
    private Boolean hidden = false;
    
    @Column(name = "single_answer")
    private Boolean singleAnswer = true;
    
    @Column(name = "shuffle_answers")
    private Boolean shuffleAnswers = true;
    
    private String language = "en";
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"question", "hibernateLazyInitializer", "handler"})
    private List<QuestionBankAnswer> answers = new ArrayList<>();
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public QuestionBank getBank() {
        return bank;
    }
    
    public void setBank(QuestionBank bank) {
        this.bank = bank;
    }
    
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
    
    public Boolean getHidden() {
        return hidden;
    }
    
    public void setHidden(Boolean hidden) {
        this.hidden = hidden;
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
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
    
    public List<QuestionBankAnswer> getAnswers() {
        return answers;
    }
    
    public void setAnswers(List<QuestionBankAnswer> answers) {
        this.answers = answers;
    }
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
} 