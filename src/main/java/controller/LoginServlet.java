package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.UserDAO;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.User;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "LoginServlet", urlPatterns = {"/open/login"})
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Set response content type
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Handle CORS
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        // Get JSON from request body
        StringBuilder buffer = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            buffer.append(line);
        }
        String data = buffer.toString();
        
        // Parse JSON
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> credentials = mapper.readValue(data, Map.class);
        
        // Accept either "email" or "username" as the login field
        String login = credentials.get("email");
        if (login == null) {
            login = credentials.get("username");
        }
        String password = credentials.get("password");
        
        // Authenticate user
        UserDAO userDAO = new UserDAO();
        User user = userDAO.authenticate(login, password);
        
        PrintWriter out = response.getWriter();
        
        if (user != null) {
            // Create response with user info but without password
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("username", user.getUsername());
            userResponse.put("email", user.getEmail());
            userResponse.put("role", user.getRole());
            userResponse.put("fullName", user.getFullName());
            userResponse.put("phoneNumber", user.getPhoneNumber());
            userResponse.put("profileImageUrl", user.getProfileImageUrl());
            
            // Add role-specific properties
            if (user.getProperties() != null) {
                userResponse.putAll(user.getProperties());
            }
            
            // Send success response
            String jsonResponse = mapper.writeValueAsString(userResponse);
            out.print(jsonResponse);
            out.flush();
        } else {
            // Send error response
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username/email or password");
            
            String jsonResponse = mapper.writeValueAsString(errorResponse);
            out.print(jsonResponse);
            out.flush();
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Handle CORS preflight requests
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }
} 