package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.dto.QuestionBankImportDTO;
import com.mycompany.fstudymate.model.*;
import com.mycompany.fstudymate.repository.*;
import com.mycompany.fstudymate.service.QuestionBankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionBankServiceImpl implements QuestionBankService {

    @Autowired
    private QuestionBankRepository questionBankRepository;
    
    @Autowired
    private QuestionBankQuestionRepository questionRepository;
    
    @Autowired
    private QuestionBankAnswerRepository answerRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;

    @Override
    public QuestionBank createQuestionBank(QuestionBank questionBank) {
        return questionBankRepository.save(questionBank);
    }

    @Override
    public QuestionBank getQuestionBankById(Long id) {
        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question bank not found with id: " + id));
        
        // Explicitly fetch questions for this bank
        List<QuestionBankQuestion> questions = questionRepository.findByBankId(id);
        questionBank.setQuestions(questions);
        
        return questionBank;
    }

    @Override
    public List<QuestionBank> getAllQuestionBanks() {
        return questionBankRepository.findAll();
    }

    @Override
    public List<QuestionBank> getQuestionBanksBySubjectId(Integer subjectId) {
        return questionBankRepository.findBySubjectId(subjectId);
    }

    @Override
    public QuestionBank updateQuestionBank(QuestionBank questionBank) {
        if (!questionBankRepository.existsById(questionBank.getId())) {
            throw new RuntimeException("Question bank not found with id: " + questionBank.getId());
        }
        return questionBankRepository.save(questionBank);
    }

    @Override
    @Transactional
    public void deleteQuestionBank(Long id) {
        questionBankRepository.deleteById(id);
    }

    @Override
    @Transactional
    public QuestionBank importQuestionsFromXml(MultipartFile xmlFile, Integer subjectId, Integer userId) throws IOException {
        try {
            // Get user and subject
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId + ". Please ensure you are logged in with a valid account."));
            
            Subject subject = null;
            if (subjectId != null) {
                subject = subjectRepository.findById(subjectId)
                        .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
            }
            
            // Create a new question bank
            QuestionBank questionBank = new QuestionBank();
            questionBank.setName("Imported Question Bank - " + LocalDateTime.now());
            questionBank.setDescription("Imported from XML file");
            questionBank.setSubject(subject);
            questionBank.setCreatedBy(user);
            questionBank = questionBankRepository.save(questionBank);
            
            // Parse XML
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(xmlFile.getInputStream());
            document.getDocumentElement().normalize();
            
            // Process questions
            NodeList questionNodes = document.getElementsByTagName("question");
            List<QuestionBankQuestion> questions = new ArrayList<>();
            // Keep track of question names to avoid duplicates
            Set<String> processedQuestionNames = new HashSet<>();
            
            for (int i = 0; i < questionNodes.getLength(); i++) {
                Node questionNode = questionNodes.item(i);
                
                if (questionNode.getNodeType() == Node.ELEMENT_NODE) {
                    Element questionElement = (Element) questionNode;
                    String questionType = questionElement.getAttribute("type");
                    
                    // Skip category questions
                    if ("category".equals(questionType)) {
                        continue;
                    }
                    
                    // Get question name first to check for duplicates
                    String questionName = null;
                    NodeList nameNodes = questionElement.getElementsByTagName("name");
                    if (nameNodes.getLength() > 0) {
                        Element nameElement = (Element) nameNodes.item(0);
                        NodeList textNodes = nameElement.getElementsByTagName("text");
                        if (textNodes.getLength() > 0) {
                            questionName = textNodes.item(0).getTextContent();
                        }
                    }
                    
                    // Skip duplicate questions
                    if (questionName != null && !processedQuestionNames.add(questionName)) {
                        System.out.println("Skipping duplicate question: " + questionName);
                        continue;
                    }
                    
                    // Create question
                    QuestionBankQuestion question = new QuestionBankQuestion();
                    question.setBank(questionBank);
                    question.setQuestionType(questionType);
                    question.setName(questionName);
                    
                    // Get question text
                    NodeList questionTextNodes = questionElement.getElementsByTagName("questiontext");
                    if (questionTextNodes.getLength() > 0) {
                        Element questionTextElement = (Element) questionTextNodes.item(0);
                        NodeList textNodes = questionTextElement.getElementsByTagName("text");
                        if (textNodes.getLength() > 0) {
                            question.setQuestionText(textNodes.item(0).getTextContent());
                        }
                    }
                    
                    // Get default grade
                    NodeList defaultGradeNodes = questionElement.getElementsByTagName("defaultgrade");
                    if (defaultGradeNodes.getLength() > 0) {
                        String defaultGradeStr = defaultGradeNodes.item(0).getTextContent();
                        try {
                            question.setDefaultGrade(new BigDecimal(defaultGradeStr));
                        } catch (NumberFormatException e) {
                            question.setDefaultGrade(new BigDecimal("1.0"));
                        }
                    }
                    
                    // Get penalty
                    NodeList penaltyNodes = questionElement.getElementsByTagName("penalty");
                    if (penaltyNodes.getLength() > 0) {
                        String penaltyStr = penaltyNodes.item(0).getTextContent();
                        try {
                            question.setPenalty(new BigDecimal(penaltyStr));
                        } catch (NumberFormatException e) {
                            question.setPenalty(new BigDecimal("0.0"));
                        }
                    }
                    
                    // Get single answer flag
                    NodeList singleNodes = questionElement.getElementsByTagName("single");
                    if (singleNodes.getLength() > 0) {
                        String singleStr = singleNodes.item(0).getTextContent();
                        question.setSingleAnswer("true".equalsIgnoreCase(singleStr));
                    }
                    
                    // Get shuffle answers flag
                    NodeList shuffleNodes = questionElement.getElementsByTagName("shuffleanswers");
                    if (shuffleNodes.getLength() > 0) {
                        String shuffleStr = shuffleNodes.item(0).getTextContent();
                        question.setShuffleAnswers("true".equalsIgnoreCase(shuffleStr));
                    }
                    
                    // Save question
                    question = questionRepository.save(question);
                    
                    // Process answers
                    NodeList answerNodes = questionElement.getElementsByTagName("answer");
                    List<QuestionBankAnswer> answers = new ArrayList<>();
                    
                    for (int j = 0; j < answerNodes.getLength(); j++) {
                        Element answerElement = (Element) answerNodes.item(j);
                        
                        QuestionBankAnswer answer = new QuestionBankAnswer();
                        answer.setQuestion(question);
                        
                        // Get answer text
                        NodeList answerTextNodes = answerElement.getElementsByTagName("text");
                        if (answerTextNodes.getLength() > 0) {
                            answer.setAnswerText(answerTextNodes.item(0).getTextContent());
                        }
                        
                        // Get fraction
                        String fractionStr = answerElement.getAttribute("fraction");
                        try {
                            answer.setFraction(new BigDecimal(fractionStr));
                        } catch (NumberFormatException e) {
                            answer.setFraction(new BigDecimal("0.0"));
                        }
                        
                        // Get feedback
                        NodeList feedbackNodes = answerElement.getElementsByTagName("feedback");
                        if (feedbackNodes.getLength() > 0) {
                            Element feedbackElement = (Element) feedbackNodes.item(0);
                            NodeList feedbackTextNodes = feedbackElement.getElementsByTagName("text");
                            if (feedbackTextNodes.getLength() > 0) {
                                answer.setFeedback(feedbackTextNodes.item(0).getTextContent());
                            }
                        }
                        
                        answers.add(answer);
                    }
                    
                    // Save answers
                    answerRepository.saveAll(answers);
                    questions.add(question);
                }
            }
            
            return questionBank;
        } catch (Exception e) {
            throw new RuntimeException("Error importing questions from XML: " + e.getMessage(), e);
        }
    }

    @Override
    public String exportQuestionsToXml(Long questionBankId) throws IOException {
        try {
            QuestionBank questionBank = getQuestionBankById(questionBankId);
            List<QuestionBankQuestion> questions = questionRepository.findByBankId(questionBankId);
            
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();
            
            // Create root element
            Element rootElement = document.createElement("quiz");
            document.appendChild(rootElement);
            
            // Process each question
            for (QuestionBankQuestion question : questions) {
                Element questionElement = document.createElement("question");
                questionElement.setAttribute("type", question.getQuestionType());
                rootElement.appendChild(questionElement);
                
                // Add name
                Element nameElement = document.createElement("name");
                questionElement.appendChild(nameElement);
                Element nameTextElement = document.createElement("text");
                nameTextElement.setTextContent(question.getName());
                nameElement.appendChild(nameTextElement);
                
                // Add question text
                Element questionTextElement = document.createElement("questiontext");
                questionTextElement.setAttribute("format", "html");
                questionElement.appendChild(questionTextElement);
                Element questionTextContentElement = document.createElement("text");
                questionTextContentElement.appendChild(document.createCDATASection(question.getQuestionText()));
                questionTextElement.appendChild(questionTextContentElement);
                
                // Add default grade
                Element defaultGradeElement = document.createElement("defaultgrade");
                defaultGradeElement.setTextContent(question.getDefaultGrade().toString());
                questionElement.appendChild(defaultGradeElement);
                
                // Add penalty
                Element penaltyElement = document.createElement("penalty");
                penaltyElement.setTextContent(question.getPenalty().toString());
                questionElement.appendChild(penaltyElement);
                
                // Add single answer flag
                Element singleElement = document.createElement("single");
                singleElement.setTextContent(question.getSingleAnswer() ? "true" : "false");
                questionElement.appendChild(singleElement);
                
                // Add shuffle answers flag
                Element shuffleElement = document.createElement("shuffleanswers");
                shuffleElement.setTextContent(question.getShuffleAnswers() ? "true" : "false");
                questionElement.appendChild(shuffleElement);
                
                // Add answers
                List<QuestionBankAnswer> answers = answerRepository.findByQuestionId(question.getId());
                for (QuestionBankAnswer answer : answers) {
                    Element answerElement = document.createElement("answer");
                    answerElement.setAttribute("fraction", answer.getFraction().toString());
                    answerElement.setAttribute("format", "html");
                    questionElement.appendChild(answerElement);
                    
                    // Add answer text
                    Element answerTextElement = document.createElement("text");
                    answerTextElement.appendChild(document.createCDATASection(answer.getAnswerText()));
                    answerElement.appendChild(answerTextElement);
                    
                    // Add feedback
                    if (answer.getFeedback() != null && !answer.getFeedback().isEmpty()) {
                        Element feedbackElement = document.createElement("feedback");
                        feedbackElement.setAttribute("format", "html");
                        answerElement.appendChild(feedbackElement);
                        
                        Element feedbackTextElement = document.createElement("text");
                        feedbackTextElement.setTextContent(answer.getFeedback());
                        feedbackElement.appendChild(feedbackTextElement);
                    }
                }
            }
            
            // Convert document to string
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(writer));
            
            return writer.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error exporting questions to XML: " + e.getMessage(), e);
        }
    }

    @Override
    public List<QuestionBankQuestion> searchQuestions(String keyword) {
        return questionRepository.searchByKeyword(keyword);
    }

    @Override
    public List<QuestionBankQuestion> searchQuestionsByAnswerText(String keyword) {
        return questionRepository.findByAnswerTextContaining(keyword);
    }

    @Override
    public List<QuestionBankQuestion> getRandomQuestions(Long bankId, int count, String questionType) {
        List<QuestionBankQuestion> questions;
        
        if (questionType != null && !questionType.isEmpty()) {
            questions = questionRepository.findByBankIdAndQuestionType(bankId, questionType);
        } else {
            questions = questionRepository.findByBankId(bankId);
        }
        
        // Shuffle and limit
        Collections.shuffle(questions);
        return questions.stream().limit(count).collect(Collectors.toList());
    }
} 