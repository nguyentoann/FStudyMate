<%@page import="java.util.List"%>
<%@page import="model.Question"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%
    // Initialize currentIndex if not present in session
    if (session.getAttribute("currentIndex") == null) {
        session.setAttribute("currentIndex", 0);
    }
    List<Question> questions = (List<Question>) session.getAttribute("listQuestion");
    int maxIndex = questions.size() - 1;
    String indexParam = request.getParameter("index");
    int index = (indexParam != null) ? Integer.parseInt(indexParam) : 0;
    Question question = questions.get(index);
    int totalQuestions = questions.size();
%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Quiz Application</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            
            body, html {
                height: 100%;
                width: 100%;
                overflow: hidden;
            }
            
            .container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                width: 100vw;
            }
            
            .header {
                background-color: #f0f0f0;
                padding: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #ddd;
            }
            
            .progress-container {
                flex-grow: 1;
                margin: 0 10px;
                height: 20px;
                background-color: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background-color: #4CAF50;
                width: <%= ((index + 1) * 100) / totalQuestions %>%;
            }
            
            .content {
                display: flex;
                flex-grow: 1;
                height: calc(100vh - 40px);
            }
            
            .sidebar {
                width: 250px;
                background-color: #f8f8f8;
                border-right: 2px solid #e0e0e0;
                display: flex;
                flex-direction: column;
                padding: 15px;
            }
            
            .answer-title {
                font-weight: bold;
                margin-bottom: 15px;
                padding-bottom: 5px;
                border-bottom: 1px solid #ddd;
            }
            
            .answer-options {
                flex-grow: 1;
                overflow-y: auto;
                margin-bottom: 15px;
            }
            
            .option {
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            }
            
            .option input[type="checkbox"] {
                margin-right: 10px;
            }
            
            .navigation {
                display: flex;
                justify-content: space-between;
                margin-top: auto;
                padding-top: 10px;
                border-top: 1px solid #ddd;
            }
            
            .btn {
                padding: 8px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                text-decoration: none;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn:hover {
                background-color: #45a049;
            }
            
            .btn-back, .btn-next {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #ddd;
            }
            
            .btn-back:hover, .btn-next:hover {
                background-color: #e0e0e0;
            }
            
            .btn-check {
                background-color: #2196F3;
                margin-bottom: 10px;
                width: 100%;
            }
            
            .btn-check:hover {
                background-color: #0b7dda;
            }
            
            .btn-exit {
                background-color: #f44336;
                margin-bottom: 10px;
                width: 100%;
            }
            
            .btn-exit:hover {
                background-color: #d32f2f;
            }
            
            .main-content {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                overflow: auto;
            }
            
            .question-container {
                flex-grow: 1;
                padding: 20px;
                border-bottom: 2px solid #e74c3c;
                overflow: auto;
            }
            
            .question-header {
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }
            
            .question-type {
                font-size: 0.9em;
                color: #666;
                margin-bottom: 20px;
            }
            
            .answer-content {
                padding: 20px;
                flex-grow: 1;
                overflow: auto;
            }
            
            .answer-content h4 {
                margin-bottom: 15px;
                color: #333;
            }
            
            .answer-item {
                margin-bottom: 10px;
            }
            
            #result {
                text-align: center;
                font-weight: bold;
                margin-bottom: 10px;
                min-height: 20px;
            }
            
            .correct {
                color: #4CAF50;
            }
            
            .incorrect {
                color: #f44336;
            }
            
            .option.correct-answer {
                background-color: #d4edda;
                border-radius: 4px;
                padding: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header with progress bar -->
            <div class="header">
                <span>There are <%= totalQuestions %> questions, and your progress of answering is</span>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
            </div>
            
            <!-- Main content area -->
            <div class="content">
                <!-- Left sidebar with answer options -->
                <div class="sidebar">
                    <div class="answer-title">Answer</div>
                    <div class="answer-options">
                        <c:forEach var="option" items="A,B,C,D,E,F,G" varStatus="status">
                            <c:if test="${status.index < question.answers.size()}">
                                <div class="option" id="option-${option}">
                                    <input type="checkbox" id="answer-${option}" name="selectedAnswers" value="${option}">
                                    <label for="answer-${option}">${option}</label>
                                </div>
                            </c:if>
                        </c:forEach>
                    </div>
                    
                    <!-- Result display area -->
                    <div id="result"></div>
                    
                    <!-- Action buttons -->
                    <button id="checkButton" class="btn btn-check">Check</button>
                    <button id="exitButton" class="btn btn-exit">Exit</button>
                    
                    <!-- Navigation buttons -->
                    <div class="navigation">
                        <a href="?index=<%= index - 1 < 0 ? maxIndex : index - 1 %>" class="btn btn-back">Back</a>
                        <a href="?index=<%= index + 1 > maxIndex ? 0 : index + 1 %>" class="btn btn-next">Next</a>
                    </div>
                </div>
                
                <!-- Main content area with question and answers -->
                <div class="main-content">
                    <!-- Question section -->
                    <div class="question-container">
                        <div class="question-header">Question <%= index + 1 %></div>
                        <div class="question-type">(Choose <%= question.Correct.split(";").length %> answer<%= question.Correct.split(";").length > 1 ? "s" : "" %>)</div>
                        <p>Cau Hoi</p>
                    </div>
                    
                    <!-- Answer section -->
                    <div class="answer-content">
                        <h4><%= "One piece of code runs after the other. This is an example of what type of cohesion?" %></h4>
                        <c:forEach var="option" items="A,B,C,D,E,F,G" varStatus="status">
                            <c:if test="${status.index < question.answerTexts.size()}">
                                <div class="answer-item">
                                    <p>${option}. ${question.answerTexts[status.index]}</p>
                                </div>
                            </c:if>
                        </c:forEach>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            // Track if the user has checked their answer
            let isChecked = false;
            
            // Initialize timer functionality
            let timerInterval;
            let seconds = parseInt(localStorage.getItem("timerSeconds")) || 0;
            
            // Check button functionality
            document.getElementById("checkButton").addEventListener("click", function() {
                // Get selected answers
                let selectedAnswers = [];
                let checkboxes = document.querySelectorAll("input[name='selectedAnswers']:checked");
                
                checkboxes.forEach(function(checkbox) {
                    selectedAnswers.push(checkbox.value);
                });
                
                // Get correct answers
                let correctAnswers = "<%= question.Correct %>".split(";");
                
                // Check if answers are correct
                let isCorrect = selectedAnswers.length === correctAnswers.length &&
                        selectedAnswers.every(answer => correctAnswers.includes(answer));
                
                // Get result display element
                let resultElement = document.getElementById("result");
                
                // Highlight correct answers
                correctAnswers.forEach(function(answer) {
                    let optionElement = document.getElementById("option-" + answer);
                    if (optionElement) {
                        optionElement.classList.add("correct-answer");
                    }
                });
                
                // Display result
                if (isCorrect) {
                    resultElement.innerText = "Correct!";
                    resultElement.className = "correct";
                } else {
                    resultElement.innerText = "Incorrect!";
                    resultElement.className = "incorrect";
                }
                
                isChecked = true;
            });
            
            // Exit button functionality
            document.getElementById("exitButton").addEventListener("click", function() {
                // Reset timer
                localStorage.setItem("timerSeconds", 0);
                
                // Navigate to home page
                window.location.href = '/FStudyMate/view/home.jsp';
            });
            
            // Keyboard shortcuts
            document.addEventListener("keydown", function(event) {
                let key = event.key.toUpperCase();
                
                if (key === "ENTER") {
                    if (isChecked) {
                        // Go to next question if already checked
                        window.location.href = "?index=<%= index + 1 > maxIndex ? 0 : index + 1 %>";
                    } else {
                        // Check answer if not checked
                        document.getElementById("checkButton").click();
                    }
                } else if (key === "ARROWLEFT") {
                    // Previous question
                    window.location.href = "?index=<%= index - 1 < 0 ? maxIndex : index - 1 %>";
                } else if (key === "ARROWRIGHT") {
                    // Next question
                    window.location.href = "?index=<%= index + 1 > maxIndex ? 0 : index + 1 %>";
                } else if (["A", "B", "C", "D", "E", "F", "G"].includes(key)) {
                    // Toggle answer selection
                    let checkbox = document.getElementById("answer-" + key);
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                } else if (["1", "2", "3", "4", "5", "6", "7"].includes(key)) {
                    // Map number keys to letter options
                    let letterMap = {
                        "1": "A", "2": "B", "3": "C", "4": "D",
                        "5": "E", "6": "F", "7": "G"
                    };
                    let checkbox = document.getElementById("answer-" + letterMap[key]);
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                }
            });
        </script>
    </body>
</html>