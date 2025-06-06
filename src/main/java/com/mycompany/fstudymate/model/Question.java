package com.mycompany.fstudymate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;
    
    @Column(name = "MaMon")
    private String maMon;
    
    @Column(name = "MaDe")
    private String maDe;
    
    @Column(name = "QuestionImg")
    private String questionImg;
    
    @Column(name = "QuestionText")
    private String questionText;
    
    @Column(name = "SLDapAn")
    private Integer slDapAn;
    
    @Column(name = "Correct")
    private String correct;
    
    @Column(name = "Explanation")
    private String explanation;
    
    @Transient
    private String[] answers;
    
    @Transient
    private String fullImageUrl;
    
    /**
     * Check if this question is a multiple choice question
     * @return true if the question allows multiple answers, false if it's single choice
     */
    @Transient
    public boolean isMultipleChoice() {
        if (correct == null) return false;
        
        // If the correct answer contains multiple values separated by a delimiter
        // For compatibility with existing data, we support both comma and semicolon delimiters
        return correct.contains(",") || correct.contains(";");
    }
    
    /**
     * Get the correct answers as a set of strings
     * @return a Set containing all correct answers
     */
    @Transient
    public Set<String> getCorrectAnswers() {
        if (correct == null || correct.isEmpty()) {
            return new HashSet<>();
        }
        
        // Split by either comma or semicolon
        String[] answers = correct.split("[,;]\\s*");
        return new HashSet<>(Arrays.asList(answers));
    }
    
    /**
     * Get the number of correct answers
     * @return number of correct answers for this question
     */
    @Transient
    public int getCorrectAnswerCount() {
        return getCorrectAnswers().size();
    }
    
    // Manual getters and setters since Lombok isn't working on Windows
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getMaMon() {
        return maMon;
    }
    
    public void setMaMon(String maMon) {
        this.maMon = maMon;
    }
    
    public String getMaDe() {
        return maDe;
    }
    
    public void setMaDe(String maDe) {
        this.maDe = maDe;
    }
    
    public String getQuestionImg() {
        return questionImg;
    }
    
    public void setQuestionImg(String questionImg) {
        this.questionImg = questionImg;
    }
    
    public String getQuestionText() {
        return questionText;
    }
    
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
    
    public Integer getSlDapAn() {
        return slDapAn;
    }
    
    public void setSlDapAn(Integer slDapAn) {
        this.slDapAn = slDapAn;
    }
    
    public String getCorrect() {
        return correct;
    }
    
    public void setCorrect(String correct) {
        this.correct = correct;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
    
    public String[] getAnswers() {
        if (answers == null) {
            answers = getAnswerOptions(slDapAn);
        }
        return answers;
    }
    
    public void setAnswers(String[] answers) {
        this.answers = answers;
    }
    
    public String getFullImageUrl() {
        if (questionImg == null || questionImg.isEmpty()) {
            return null;
        }
        
        // If questionImg already starts with http:// or https://, return as is
        if (questionImg.startsWith("http://") || questionImg.startsWith("https://")) {
            return questionImg;
        }
        
        // If questionImg starts with a slash, remove it to prevent double slashes
        String imgPath = questionImg;
        if (imgPath.startsWith("/")) {
            imgPath = imgPath.substring(1);
        }
        
        // Return a path that goes through our resource handler
        return "/images/" + imgPath;
    }
    
    public void setFullImageUrl(String fullImageUrl) {
        this.fullImageUrl = fullImageUrl;
    }
    
    public static String[] getAnswerOptions(int slDapAn) {
        switch (slDapAn) {
            case 2:
                return new String[]{"A", "B"};
            case 3:
                return new String[]{"A", "B", "C"};
            case 4:
                return new String[]{"A", "B", "C", "D"};
            case 5:
                return new String[]{"A", "B", "C", "D", "E"};
            case 6:
                return new String[]{"A", "B", "C", "D", "E", "F"};
            case 7:
                return new String[]{"A", "B", "C", "D", "E", "F", "G"};
            default:
                return new String[]{"Invalid SLDapAn"};
        }
    }
} 