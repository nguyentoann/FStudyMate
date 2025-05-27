package model;

public class Question {

    public int Id;
    public String MaMon;
    public String MaDe;
    public String QuestionImg;
    public String QuestionText;
    public int SLDapAn;
    public String Correct;
    public String[] answers;
    public String Explanation;

    public Question(int Id, String MaMon, String MaDe, String QuestionImg, String QuestionText, int SLDapAn, String Correct, String Explanation) {
        this.Id = Id;
        this.MaMon = MaMon;
        this.MaDe = MaDe;
        this.QuestionImg = QuestionImg;
        this.QuestionText = QuestionText;
        this.SLDapAn = SLDapAn;
        this.Correct = Correct;
        this.Explanation = Explanation;
        this.answers = getAnswerOptions(SLDapAn);
    }

    public String[] getAnswers() {
        return answers;
    }

    public void setAnswers(String[] answers) {
        this.answers = answers;
    }

    public int getId() {
        return Id;
    }

    public void setId(int Id) {
        this.Id = Id;
    }

    public String getMaMon() {
        return MaMon;
    }

    public void setMaMon(String MaMon) {
        this.MaMon = MaMon;
    }

    public String getMaDe() {
        return MaDe;
    }

    public void setMaDe(String MaDe) {
        this.MaDe = MaDe;
    }

    public String getQuestionImg() {
        return QuestionImg;
    }

    public void setQuestionImg(String QuestionImg) {
        this.QuestionImg = QuestionImg;
    }

    public String getQuestionText() {
        return QuestionText;
    }

    public void setQuestionText(String QuestionText) {
        this.QuestionText = QuestionText;
    }

    public int getSLDapAn() {
        return SLDapAn;
    }

    public void setSLDapAn(int SLDapAn) {
        this.SLDapAn = SLDapAn;
    }

    public String getCorrect() {
        return Correct;
    }

    public void setCorrect(String Correct) {
        this.Correct = Correct;
    }

    public String getExplanation() {
        return Explanation;
    }

    public void setExplanation(String Explanation) {
        this.Explanation = Explanation;
    }

    public static String[] getAnswerOptions(int SLDapAn) {
        switch (SLDapAn) {
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
