package model;

public class QuizPermission {
    private int id;
    private int quizId;
    private String classId;
    
    public QuizPermission(int id, int quizId, String classId) {
        this.id = id;
        this.quizId = quizId;
        this.classId = classId;
    }
    
    public QuizPermission(int quizId, String classId) {
        this.quizId = quizId;
        this.classId = classId;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getQuizId() {
        return quizId;
    }
    
    public void setQuizId(int quizId) {
        this.quizId = quizId;
    }
    
    public String getClassId() {
        return classId;
    }
    
    public void setClassId(String classId) {
        this.classId = classId;
    }
} 