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

@WebServlet(name = "RegisterServlet", urlPatterns = {"/emergency/auth"})
public class RegisterServlet extends HttpServlet {

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
        
        // Log received data for debugging
        System.out.println("Received registration data: " + data);
        
        // Parse JSON
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> userInput = mapper.readValue(data, Map.class);
        
        // Extract user data
        String username = (String) userInput.get("username");
        String email = (String) userInput.get("email");
        String passwordHash = (String) userInput.get("passwordHash"); // Will be hashed in DAO
        String role = (String) userInput.get("role");
        String fullName = (String) userInput.get("fullName");
        String phoneNumber = (String) userInput.get("phoneNumber");
        String profileImageUrl = (String) userInput.get("profileImageUrl");
        
        // Create user object
        User user = new User(username, email, passwordHash, role, fullName);
        user.setPhoneNumber(phoneNumber);
        user.setProfileImageUrl(profileImageUrl);
        
        // Add role-specific data
        Map<String, Object> roleData = new HashMap<>();
        
        switch (role) {
            case "student":
                roleData.put("dateOfBirth", userInput.get("dateOfBirth"));
                roleData.put("gender", userInput.get("gender"));
                roleData.put("academicMajor", userInput.get("academicMajor"));
                break;
            case "lecturer":
                roleData.put("department", userInput.get("department"));
                roleData.put("specializations", userInput.get("specializations"));
                break;
            case "guest":
                roleData.put("institutionName", userInput.get("institutionName"));
                roleData.put("accessReason", userInput.get("accessReason"));
                break;
            case "outsrc_student":
                roleData.put("dateOfBirth", userInput.get("dateOfBirth"));
                roleData.put("organization", userInput.get("organization"));
                break;
        }
        
        // Register user
        UserDAO userDAO = new UserDAO();
        boolean successful = userDAO.registerUser(user, roleData);
        
        PrintWriter out = response.getWriter();
        Map<String, Object> responseData = new HashMap<>();
        
        if (successful) {
            responseData.put("status", "OK");
            responseData.put("message", "User registered successfully");
            responseData.put("userId", user.getId());
            responseData.put("username", user.getUsername());
            responseData.put("email", user.getEmail());
            responseData.put("role", user.getRole());
            responseData.put("profileImageUrl", user.getProfileImageUrl());
        } else {
            responseData.put("status", "ERROR");
            responseData.put("message", "Failed to register user. Username or email may already exist.");
        }
        
        String jsonResponse = mapper.writeValueAsString(responseData);
        out.print(jsonResponse);
        out.flush();
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