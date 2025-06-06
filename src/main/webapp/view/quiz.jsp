<%@page import="java.util.List"%>
<%@page import="model.Question"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%
    // Kiểm tra nếu currentIndex chưa có trong session thì gán giá trị mặc định là 0
    if (session.getAttribute("currentIndex") == null) {
        session.setAttribute("currentIndex", 0);  // Khởi tạo giá trị mặc định cho currentIndex
    }
    List<Question> questions = (List<Question>) session.getAttribute("listQuestion");
    int maxIndex = questions.size() - 1;
    String indexParam = request.getParameter("index");
    int index = (indexParam != null) ? Integer.parseInt(indexParam) : 0;  // Nếu không có tham số, mặc định là 0
    Question question = questions.get(index);
    
    // Handle multiple answers - split by comma or semicolon
    String[] correctAnswers = question.Correct.contains(";") ? 
                              question.Correct.split(";") : 
                              question.Correct.contains(",") ?
                              question.Correct.split(",") :
                              new String[] { question.Correct };
    
    // Check if it's a multiple-choice question
    boolean isMultipleChoice = correctAnswers.length > 1;
%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Quiz Application</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js"></script>
    </head>
    <body class="bg-white text-black">
        <div class="flex flex-col items-center p-4">
            <div class="w-full border border-gray-300">
                <!-- Progress Bar -->
                <div class="flex justify-between items-center bg-gray-100 p-2">
                    <span class="text-lg mr-2"><%=index + 1%>/<%=maxIndex + 1%></span>
                    <div class="w-full h-6 bg-gray-300 mr-4">
                        <div class="h-full bg-[#33CC00]" style="width: <%= ((index + 1) * 100) / (maxIndex + 1)%>%;"></div>
                    </div>
                    <div id="timer" class="border border-gray-400 rounded p-1 bg-white">00:00:00</div>
                </div>
                
                <!-- Content Section -->
                <div class="flex">
                    <!-- Left Panel - Answer Options -->
                    <div class="flex">
                        <div class="bg-gray-100 flex justify-center items-center">
                            <div class="border-r border-gray-300 p-4 w-full max-w-xs bg-white shadow-lg rounded-lg flex flex-col justify-between h-full">
                                <div class="h-72">
                                    <div class="text-lg font-bold mb-2 text-center text-blue-600">Answer</div>
                                    <div class="text-sm mb-4 text-center <%=isMultipleChoice ? "text-red-600" : "text-green-600"%>">
                                        <%= isMultipleChoice ? "Multiple Choice - Select " + correctAnswers.length + " answers" : "Single Choice" %>
                                    </div>
                                    <form class="flex flex-col space-y-4 flex-grow" method="POST">
                                        <div class="w-12 checkbox-container flex-1 overflow-y-auto max-h-72">
                                            <c:forEach var="answer" items="<%=question.answers%>">
                                                <label class="flex items-center mb-2">
                                                    <input type="checkbox"
                                                           name="selectedAnswers"
                                                           value="${answer}"
                                                           class="mr-2 accent-blue-600">
                                                    <span>${answer}</span>
                                                </label>
                                            </c:forEach>
                                        </div>
                                    </form>
                                </div>

                                <!-- Result Display and Buttons -->
                                <div class="mt-4">
                                    <div id="result" class="mb-4 text-sm font-bold text-center text-blue-600"></div>
                                    <div id="resultDisplay" class="mb-4 text-sm font-bold text-center text-blue-600"></div>
                                    <div class="flex justify-center mb-4">
                                        <button type="button" id="checkButton" class="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-transform transform hover:scale-105">Check</button>
                                    </div>
                                    <div class="flex justify-between">
                                        <a href="/FStudyMate/view/quiz.jsp?index=<%= index - 1 < 0 ? maxIndex : index - 1%>" 
                                           class="px-2 py-2 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 transition-transform transform hover:scale-105">
                                            <i class="fas fa-arrow-left"></i>
                                        </a>
                                        <a href="/FStudyMate/view/quiz.jsp?index=<%= index + 1 > maxIndex ? 0 : index + 1%>" 
                                           class="px-2 py-2 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 transition-transform transform hover:scale-105">
                                            <i class="fas fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                                <div class="flex justify-center mb-4">
                                    <button type="button" id="exitButton" class="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-transform transform hover:scale-105">Exit</button>
                                </div>
                            </div>
                        </div>

                        <!-- Main Content - Question Image -->
                        <div class="p-4 flex-grow">                            
                            <img src="${pageContext.request.contextPath}/api/images/direct?path=<%=question.MaMon%>/<%=question.MaDe%>/<%=question.QuestionImg%>" alt="<%=question.QuestionImg%>" class="w-full" 
                                 onerror="this.onerror=null; 
                                          const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                                          let attempted = this.getAttribute('data-attempted') || 0;
                                          if (attempted < extensions.length) {
                                            this.setAttribute('data-attempted', parseInt(attempted) + 1);
                                            this.src='/FStudyMate/SourceImg/<%=question.MaMon%>/<%=question.MaDe%>/<%=question.QuestionImg%>' + extensions[attempted];
                                          } else {
                                            this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2220%22%20fill%3D%22%23999%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
                                          }" />
                        </div>
                    </div>
                </div>
                
                <!-- Explanation Section -->
                <div class="flex items-center p-4">
                    <div class="w-full">
                        <div class="text-lg font-bold text-blue-600">Explanation</div>
                        <div class="border border-gray-300 p-2"><%=question.Explanation%></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script>
            // Timer functionality
            let timerInterval;

            // Get time from localStorage or use default 0
            let seconds = parseInt(localStorage.getItem("timerSeconds")) || 0;

            // Update timer display immediately when page loads
            function updateTimer() {
                let hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
                let mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
                let secs = (seconds % 60).toString().padStart(2, '0');
                document.getElementById("timer").textContent = hrs + ":" + mins + ":" + secs;
            }

            // Call updateTimer to display time immediately
            updateTimer();

            // Update time every second
            function incrementTimer() {
                seconds++;
                localStorage.setItem("timerSeconds", seconds);
                updateTimer();
            }

            // Start the timer
            timerInterval = setInterval(incrementTimer, 1000);

            // Exit Quiz function
            document.getElementById("exitButton").addEventListener("click", function() {
                // Stop the timer
                clearInterval(timerInterval);

                // Reset time to 0 in localStorage
                localStorage.setItem("timerSeconds", 0);

                // Reset display time to 00:00:00
                document.getElementById("timer").textContent = "00:00:00";

                // Navigate to home page
                window.location.href = '${pageContext.request.contextPath}/view/home.jsp';
            });

            // Answer checking functionality
            let isChecked = false; // Track if the user has checked the answer

            // Listen for click on "Check" button
            document.getElementById("checkButton").addEventListener("click", function() {
                // Get list of selected checkboxes
                let selectedAnswers = [];
                let checkboxes = document.querySelectorAll("input[name='selectedAnswers']:checked");

                checkboxes.forEach(function(checkbox) {
                    selectedAnswers.push(checkbox.value);
                });

                // Get correct answers (split by comma or semicolon)
                let correctAnswers = "<%= question.Correct %>".replace(/\s/g, '').split(/[,;]/);

                // Check if selected answers are correct
                let isCorrect = selectedAnswers.length === correctAnswers.length &&
                        selectedAnswers.every(answer => correctAnswers.includes(answer.trim()));

                // Get result display element
                let resultDisplay = document.getElementById("resultDisplay");

                // Color the backgrounds of all checkboxes
                checkboxes.forEach(function(checkbox) {
                    let label = checkbox.parentElement;
                    // Color green for correct selected answers
                    if (correctAnswers.includes(checkbox.value.trim())) {
                        label.style.backgroundColor = "#00FF00";
                        label.style.color = "black";
                    }
                });

                // Color all correct answers green, whether selected or not
                let allLabels = document.querySelectorAll(".checkbox-container label");
                allLabels.forEach(function(label) {
                    let answer = label.querySelector("input").value;
                    if (correctAnswers.includes(answer.trim())) {
                        label.style.backgroundColor = "#00FF00";
                        label.style.color = "black";
                    }
                });

                // Display result text
                if (isCorrect) {
                    resultDisplay.innerText = "Correct!";
                    resultDisplay.style.color = "green";
                } else {
                    resultDisplay.innerText = "Incorrect!";
                    resultDisplay.style.color = "red";
                }

                // Mark as checked
                isChecked = true;
            });

            // Keyboard shortcuts
            document.addEventListener("keydown", function(event) {
                let key = event.key.toUpperCase();
                let keyMap = {
                    "1": "A", "2": "B", "3": "C", "4": "D",
                    "5": "E", "6": "F", "7": "G"
                };

                if (key === "ENTER") {
                    if (isChecked) {
                        // If already checked, go to next question
                        document.querySelector("a[href*='index=<%= index + 1 > maxIndex ? 0 : index + 1%>']").click();
                    } else {
                        // If not checked, check answer
                        document.getElementById("checkButton").click();
                    }
                } else if (key === "ARROWLEFT") {
                    // Left arrow - previous question
                    document.querySelector("a[href*='index=<%= index - 1 < 0 ? maxIndex : index - 1%>']").click();
                } else if (key === "ARROWRIGHT") {
                    // Right arrow - next question
                    document.querySelector("a[href*='index=<%= index + 1 > maxIndex ? 0 : index + 1%>']").click();
                } else {
                    // Number or letter keys - toggle answers
                    let answerKey = keyMap[key] || key;
                    if (["A", "B", "C", "D", "E", "F", "G"].includes(answerKey)) {
                        let checkboxes = document.querySelectorAll("input[name='selectedAnswers']");
                        checkboxes.forEach(function(checkbox) {
                            if (checkbox.value.trim().toUpperCase() === answerKey) {
                                checkbox.checked = !checkbox.checked; // Toggle checked state
                            }
                        });
                    }
                }
            });
        </script>
    </body>
</html>