package controller;

import com.google.gson.Gson;
import dao.LessonDAO;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.Lesson;

@WebServlet(name = "LessonServlet", urlPatterns = {"/api/lessons", "/api/lessons/*"})
public class LessonServlet extends HttpServlet {

    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try {
            String pathInfo = request.getPathInfo();
            
            // If path info is null, it means the URL pattern was /api/lessons
            if (pathInfo == null || pathInfo.equals("/")) {
                // Check if a subject ID parameter was provided
                String subjectIdParam = request.getParameter("subjectId");
                
                System.out.println("[DEBUG] subjectIdParam received: " + subjectIdParam);
                
                if (subjectIdParam != null && !subjectIdParam.isEmpty()) {
                    // Ensure proper conversion to integer
                    int subjectId;
                    try {
                        subjectId = Integer.parseInt(subjectIdParam);
                    } catch (NumberFormatException e) {
                        System.out.println("[ERROR] Invalid subjectId format: " + subjectIdParam);
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        response.getWriter().write("{\"error\": \"Invalid subjectId format\"}");
                        return;
                    }
                    
                    System.out.println("[DEBUG] Fetching lessons for subjectId: " + subjectId);
                    
                    // Changed from getMockLessonsBySubject to getLessonsBySubject
                    List<Lesson> lessons = LessonDAO.getLessonsBySubject(subjectId);
                    System.out.println("[DEBUG] Retrieved " + lessons.size() + " lessons");
                    
                    PrintWriter out = response.getWriter();
                    String jsonResponse = gson.toJson(lessons);
                    System.out.println("[DEBUG] JSON response: " + jsonResponse);
                    out.print(jsonResponse);
                    out.flush();
                } else {
                    // Return all lessons if no subject ID is provided
                    List<Lesson> lessons = LessonDAO.getAllLessons();
                    System.out.println("[DEBUG] Retrieved all lessons: " + lessons.size());
                    PrintWriter out = response.getWriter();
                    out.print(gson.toJson(lessons));
                    out.flush();
                }
            } else {
                // URL pattern was /api/lessons/{id}
                int lessonId = Integer.parseInt(pathInfo.substring(1));
                Lesson lesson = LessonDAO.getLessonById(lessonId);
                
                if (lesson != null) {
                    PrintWriter out = response.getWriter();
                    out.print(gson.toJson(lesson));
                    out.flush();
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\": \"Lesson not found\"}");
                }
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid ID format\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
            e.printStackTrace(); // Add stack trace for better debugging
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try {
            // Parse the incoming JSON data
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            Lesson lesson = gson.fromJson(sb.toString(), Lesson.class);
            
            // Validate required fields for lesson creation
            if (lesson.getTitle() == null || lesson.getContent() == null || 
                lesson.getSubjectId() <= 0 || lesson.getLecturerId() <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Required fields missing: title, content, subjectId, lecturerId\"}");
                return;
            }
            
            // Create the lesson in the database
            int generatedId = LessonDAO.createLesson(lesson);
            
            if (generatedId > 0) {
                lesson.setId(generatedId);
                response.setStatus(HttpServletResponse.SC_CREATED);
                PrintWriter out = response.getWriter();
                out.print(gson.toJson(lesson));
                out.flush();
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Failed to create lesson\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
            e.printStackTrace(); // Add stack trace for better debugging
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try {
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Lesson ID is required\"}");
                return;
            }
            
            int lessonId = Integer.parseInt(pathInfo.substring(1));
            
            // Parse the incoming JSON data
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            Lesson lesson = gson.fromJson(sb.toString(), Lesson.class);
            lesson.setId(lessonId);
            
            boolean success = LessonDAO.updateLesson(lesson);
            
            if (success) {
                Lesson updatedLesson = LessonDAO.getLessonById(lessonId);
                PrintWriter out = response.getWriter();
                out.print(gson.toJson(updatedLesson));
                out.flush();
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Lesson not found or update failed\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid ID format\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try {
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Lesson ID is required\"}");
                return;
            }
            
            int lessonId = Integer.parseInt(pathInfo.substring(1));
            
            boolean success = LessonDAO.deleteLesson(lessonId);
            
            if (success) {
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Lesson not found\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid ID format\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
} 