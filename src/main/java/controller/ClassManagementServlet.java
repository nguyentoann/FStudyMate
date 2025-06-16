package controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.ClassDAO;
import model.ClassGroup;
import model.Student;
import model.User;
import util.JSONUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet(name = "ClassManagementServlet", urlPatterns = {"/api/classes/*"})
public class ClassManagementServlet extends HttpServlet {
    private static final Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd").create();
    private ClassDAO classDAO = ClassDAO.getInstance();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession(false);
        User currentUser = (User) (session != null ? session.getAttribute("user") : null);
        
        // Check if user is logged in and is an admin
        if (currentUser == null || !"admin".equalsIgnoreCase(currentUser.getRole())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print(gson.toJson(Map.of("error", "Access denied. Admin privileges required.")));
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all classes
                List<ClassGroup> classes = classDAO.getAllClasses();
                out.print(gson.toJson(classes));
            } else if (pathInfo.startsWith("/students")) {
                // Get students for all classes or a specific class
                String classId = request.getParameter("classId");
                List<Student> students;
                
                if (classId != null && !classId.isEmpty()) {
                    students = classDAO.getStudentsByClass(classId);
                } else {
                    students = classDAO.getAllStudents();
                }
                
                out.print(gson.toJson(students));
            } else if (pathInfo.equals("/statistics")) {
                // Get class statistics for charts
                Map<String, Integer> stats = classDAO.getClassStatistics();
                out.print(gson.toJson(stats));
            } else {
                // Extract class ID from path
                String classId = pathInfo.substring(1);
                List<Student> students = classDAO.getStudentsByClass(classId);
                out.print(gson.toJson(students));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", "Server error: " + e.getMessage())));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession(false);
        User currentUser = (User) (session != null ? session.getAttribute("user") : null);
        
        // Check if user is logged in and is an admin
        if (currentUser == null || !"admin".equalsIgnoreCase(currentUser.getRole())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print(gson.toJson(Map.of("error", "Access denied. Admin privileges required.")));
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        try {
            // Get request body
            String requestBody = request.getReader().lines().collect(Collectors.joining());
            Map<String, Object> requestData = JSONUtil.fromJson(requestBody);
            
            if (pathInfo == null || pathInfo.equals("/")) {
                // Create a new class - this would typically involve updating multiple students
                response.setStatus(HttpServletResponse.SC_NOT_IMPLEMENTED);
                out.print(gson.toJson(Map.of("error", "Creating new classes is not implemented yet.")));
            } else if (pathInfo.equals("/assign")) {
                // Assign students to a class
                String studentId = (String) requestData.get("studentId");
                String classId = (String) requestData.get("classId");
                
                boolean success = classDAO.updateStudentClass(studentId, classId);
                
                if (success) {
                    out.print(gson.toJson(Map.of("success", true, "message", "Student assigned to class successfully")));
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(Map.of("success", false, "error", "Failed to assign student to class")));
                }
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("error", "Invalid request path")));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", "Server error: " + e.getMessage())));
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession(false);
        User currentUser = (User) (session != null ? session.getAttribute("user") : null);
        
        // Check if user is logged in and is an admin
        if (currentUser == null || !"admin".equalsIgnoreCase(currentUser.getRole())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print(gson.toJson(Map.of("error", "Access denied. Admin privileges required.")));
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        try {
            // Get request body
            String requestBody = request.getReader().lines().collect(Collectors.joining());
            
            if (pathInfo == null || pathInfo.equals("/")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("error", "Invalid request path")));
            } else if (pathInfo.startsWith("/student/")) {
                // Update student information
                Student student = gson.fromJson(requestBody, Student.class);
                boolean success = classDAO.updateStudent(student);
                
                if (success) {
                    out.print(gson.toJson(Map.of("success", true, "message", "Student updated successfully")));
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(Map.of("success", false, "error", "Failed to update student")));
                }
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("error", "Invalid request path")));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", "Server error: " + e.getMessage())));
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "86400");
        response.setStatus(HttpServletResponse.SC_OK);
    }
} 