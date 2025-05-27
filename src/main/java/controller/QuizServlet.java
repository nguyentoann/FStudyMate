package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import dao.QuestionDAO;
import dao.QuizDAO;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import model.Quiz;
import model.QuizPermission;
import model.User;

@WebServlet(name = "QuizServlet", urlPatterns = {"/api/quizzes", "/api/quizzes/*"})
public class QuizServlet extends HttpServlet {

    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get the user session
            HttpSession session = request.getSession(false);
            User currentUser = (User) session.getAttribute("user");
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson("Unauthorized"));
                return;
            }
            
            String pathInfo = request.getPathInfo();
            
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all quizzes for current user
                List<Quiz> quizzes = QuizDAO.getQuizzesByUserId(currentUser.getId());
                out.print(gson.toJson(quizzes));
            } else {
                // Parse the quiz ID
                try {
                    // Check if it's a request for quiz permissions
                    if (pathInfo.endsWith("/permissions")) {
                        // Extract quiz ID from the path before the /permissions part
                        final int quizId = Integer.parseInt(pathInfo.substring(1, pathInfo.lastIndexOf("/")));
                        List<QuizPermission> permissions = QuizDAO.getQuizPermissions(quizId);
                        out.print(gson.toJson(permissions));
                    } else {
                        // Get quiz details
                        final int quizId = Integer.parseInt(pathInfo.substring(1));
                        Quiz quiz = QuizDAO.getQuizById(quizId);
                        
                        if (quiz == null) {
                            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                            out.print(gson.toJson("Quiz not found"));
                            return;
                        }
                        
                        // Check if user has permission to view this quiz
                        if (quiz.getUserId() != currentUser.getId() && 
                            !currentUser.getRole().equals("Admin") && 
                            !currentUser.getRole().equals("Lecturer")) {
                            // Check if student has access through class permissions
                            if (currentUser.getRole().equals("Student")) {
                                String classId = null; // Get student's class ID
                                List<Quiz> accessibleQuizzes = QuizDAO.getQuizzesByClassId(classId);
                                boolean hasAccess = accessibleQuizzes.stream()
                                    .anyMatch(accessQuiz -> accessQuiz.getId() == quizId);
                                
                                if (!hasAccess) {
                                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                    out.print(gson.toJson("Access denied"));
                                    return;
                                }
                            } else {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                out.print(gson.toJson("Access denied"));
                                return;
                            }
                        }
                        
                        out.print(gson.toJson(quiz));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson("Invalid quiz ID"));
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson("Internal server error: " + e.getMessage()));
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get the user session
            HttpSession session = request.getSession(false);
            User currentUser = (User) session.getAttribute("user");
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson("Unauthorized"));
                return;
            }
            
            // Check permission - only lecturers and admins can create quizzes
            if (!currentUser.getRole().equals("Admin") && !currentUser.getRole().equals("Lecturer")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.print(gson.toJson("Only lecturers and admins can create quizzes"));
                return;
            }
            
            String pathInfo = request.getPathInfo();
            
            // Process permission requests
            if (pathInfo != null && pathInfo.endsWith("/permissions")) {
                int quizId = Integer.parseInt(pathInfo.substring(1, pathInfo.lastIndexOf("/")));
                
                // Read request body
                BufferedReader reader = request.getReader();
                JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);
                String classId = jsonRequest.get("classId").getAsString();
                
                QuizPermission permission = new QuizPermission(quizId, classId);
                boolean success = QuizDAO.addQuizPermission(permission);
                
                if (success) {
                    response.setStatus(HttpServletResponse.SC_CREATED);
                    out.print(gson.toJson("Permission added"));
                } else {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.print(gson.toJson("Failed to add permission"));
                }
                return;
            }
            
            // Create a new quiz
            BufferedReader reader = request.getReader();
            Quiz newQuiz = gson.fromJson(reader, Quiz.class);
            
            // Set the user ID from the session
            newQuiz.setUserId(currentUser.getId());
            
            int quizId = QuizDAO.createQuiz(newQuiz);
            
            if (quizId > 0) {
                // Update existing questions to associate with this quiz
                int updatedQuestions = QuestionDAO.updateQuestionsForQuiz(
                    newQuiz.getMaMon(), newQuiz.getMaDe(), quizId);
                
                response.setStatus(HttpServletResponse.SC_CREATED);
                JsonObject result = new JsonObject();
                result.addProperty("quizId", quizId);
                result.addProperty("updatedQuestions", updatedQuestions);
                out.print(gson.toJson(result));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson("Failed to create quiz"));
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson("Internal server error: " + e.getMessage()));
            e.printStackTrace();
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get the user session
            HttpSession session = request.getSession(false);
            User currentUser = (User) session.getAttribute("user");
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson("Unauthorized"));
                return;
            }
            
            String pathInfo = request.getPathInfo();
            
            if (pathInfo == null || pathInfo.equals("/")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson("Quiz ID is required"));
                return;
            }
            
            int quizId = Integer.parseInt(pathInfo.substring(1));
            
            // Check if user has permission to update this quiz
            Quiz existingQuiz = QuizDAO.getQuizById(quizId);
            if (existingQuiz == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson("Quiz not found"));
                return;
            }
            
            if (existingQuiz.getUserId() != currentUser.getId() && !currentUser.getRole().equals("Admin")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.print(gson.toJson("Access denied"));
                return;
            }
            
            // Update quiz
            BufferedReader reader = request.getReader();
            Quiz updatedQuiz = gson.fromJson(reader, Quiz.class);
            updatedQuiz.setId(quizId);
            
            boolean success = QuizDAO.updateQuiz(updatedQuiz);
            
            if (success) {
                out.print(gson.toJson("Quiz updated successfully"));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson("Failed to update quiz"));
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson("Invalid quiz ID"));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson("Internal server error: " + e.getMessage()));
            e.printStackTrace();
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get the user session
            HttpSession session = request.getSession(false);
            User currentUser = (User) session.getAttribute("user");
            
            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson("Unauthorized"));
                return;
            }
            
            String pathInfo = request.getPathInfo();
            
            if (pathInfo == null || pathInfo.equals("/")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson("Quiz ID is required"));
                return;
            }
            
            // Check if it's a permission deletion request
            if (pathInfo.contains("/permissions/")) {
                String[] parts = pathInfo.split("/");
                if (parts.length == 4) {
                    int quizId = Integer.parseInt(parts[1]);
                    int permissionId = Integer.parseInt(parts[3]);
                    
                    // Check if user has permission to delete
                    Quiz quiz = QuizDAO.getQuizById(quizId);
                    if (quiz == null || (quiz.getUserId() != currentUser.getId() && !currentUser.getRole().equals("Admin"))) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.print(gson.toJson("Access denied"));
                        return;
                    }
                    
                    boolean success = QuizDAO.removeQuizPermission(permissionId);
                    
                    if (success) {
                        out.print(gson.toJson("Permission removed successfully"));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        out.print(gson.toJson("Failed to remove permission"));
                    }
                    return;
                }
            }
            
            int quizId = Integer.parseInt(pathInfo.substring(1));
            
            // Check if user has permission to delete this quiz
            Quiz quiz = QuizDAO.getQuizById(quizId);
            if (quiz == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson("Quiz not found"));
                return;
            }
            
            if (quiz.getUserId() != currentUser.getId() && !currentUser.getRole().equals("Admin")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.print(gson.toJson("Access denied"));
                return;
            }
            
            boolean success = QuizDAO.deleteQuiz(quizId);
            
            if (success) {
                out.print(gson.toJson("Quiz deleted successfully"));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson("Failed to delete quiz"));
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson("Invalid quiz ID"));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson("Internal server error: " + e.getMessage()));
            e.printStackTrace();
        }
    }
} 