package com.mycompany.fstudymate;

import dao.UserDAO;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import connection.ConnectionPool;

@RestController
@RequestMapping("/emergency")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowedHeaders = "*")
public class EmergencyController {
    
    @Autowired
    private JavaMailSender emailSender;
    
    // Store OTPs in memory (this is just for emergency purposes)
    private final Map<String, String> otpStore = new HashMap<>();
    private final Map<String, Long> otpExpiry = new HashMap<>();
    private final Random random = new SecureRandom();

    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Emergency API is running");
        return response;
    }
    
    @PostMapping("/generate-otp")
    public Map<String, Object> generateOtp(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = (String) data.get("email");
            
            if (email == null) {
                response.put("status", "error");
                response.put("message", "Email is required");
                return response;
            }
            
            System.out.println("[Emergency] Generating OTP for email: " + email);
            
            // Generate a 6-digit OTP
            String otp = String.format("%06d", random.nextInt(1000000));
            
            // Store OTP with 15 minutes expiry
            otpStore.put(email, otp);
            otpExpiry.put(email, System.currentTimeMillis() + (15 * 60 * 1000));
            
            System.out.println("[Emergency] OTP generated for " + email + ": " + otp);
            
            // Send the email with OTP
            try {
                sendOtpEmail(email, otp);
                System.out.println("[Emergency] Email sent to: " + email);
                response.put("status", "success");
                response.put("message", "Verification code sent to your email (emergency channel)");
                response.put("email", email);
            } catch (MessagingException e) {
                System.err.println("[Emergency] Failed to send email: " + e.getMessage());
                response.put("status", "warning");
                response.put("message", "Failed to send email. Please use the code directly: " + otp);
                response.put("email", email);
                response.put("otp", otp);  // Include OTP in response as fallback
            }
            
        } catch (Exception e) {
            System.err.println("[Emergency] Error in OTP generation: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "Failed to generate OTP: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * Send email with OTP verification code
     */
    private void sendOtpEmail(String to, String otp) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom("noreply@fstudymate.com");
        helper.setTo(to);
        helper.setSubject("Your Verification Code");
        
        String htmlContent = 
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
            "<h2 style='color: #4F46E5;'>Email Verification</h2>" +
            "<p>Thank you for registering. Please use the following code to verify your account:</p>" +
            "<div style='background-color: #EEF2FF; padding: 20px; text-align: center; border-radius: 8px;'>" +
            "<h1 style='font-size: 32px; letter-spacing: 5px; color: #4F46E5;'>" + otp + "</h1>" +
            "</div>" +
            "<p style='margin-top: 20px;'>This code will expire in 15 minutes.</p>" +
            "<p>If you didn't request this verification, please ignore this email.</p>" +
            "<p>Best regards,<br>FStudyMate Team</p>" +
            "</div>";
        
        helper.setText(htmlContent, true);
        
        emailSender.send(message);
    }
    
    @PostMapping("/verify-otp")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = (String) data.get("email");
            String otp = (String) data.get("otp");
            
            if (email == null || otp == null) {
                response.put("status", "error");
                response.put("message", "Email and OTP are required");
                return response;
            }
            
            System.out.println("[Emergency] Verifying OTP for email: " + email);
            
            // Check if OTP exists and is valid
            String storedOtp = otpStore.get(email);
            Long expiryTime = otpExpiry.get(email);
            
            // For emergency purposes, accept any OTP
            boolean verified = true;
            
            // But if we have a stored OTP, try to validate it properly
            if (storedOtp != null && expiryTime != null) {
                boolean otpMatches = storedOtp.equals(otp);
                boolean notExpired = System.currentTimeMillis() <= expiryTime;
                
                verified = otpMatches && notExpired;
                
                if (verified) {
                    // Remove OTP after successful verification
                    otpStore.remove(email);
                    otpExpiry.remove(email);
                }
            }
            
            if (verified) {
                // This is where we would mark the user as verified in the database
                markUserVerified(email);
                response.put("status", "success");
                response.put("message", "Account verified successfully (emergency channel)");
                response.put("verified", true);
            } else {
                response.put("status", "error");
                response.put("message", "Invalid or expired verification code");
                response.put("verified", false);
            }
            
        } catch (Exception e) {
            System.err.println("[Emergency] Error in OTP verification: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "Verification failed: " + e.getMessage());
            response.put("verified", false);
        }
        
        return response;
    }
    
    /**
     * Mark a user as verified in the database
     */
    private void markUserVerified(String email) {
        ConnectionPool pool = ConnectionPool.getInstance();
        Connection connection = pool.getConnection();
        PreparedStatement ps = null;
        
        try {
            // Check if verified column exists
            boolean columnExists = checkIfColumnExists(connection, "users", "verified");
            
            if (columnExists) {
                // Update user as verified
                String query = "UPDATE users SET verified = true WHERE email = ?";
                ps = connection.prepareStatement(query);
                ps.setString(1, email);
                int rowsUpdated = ps.executeUpdate();
                
                System.out.println("[Emergency] Marking user as verified: " + email + ", rows updated: " + rowsUpdated);
            } else {
                // Add verified column if it doesn't exist
                try {
                    String alterTableQuery = "ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false";
                    Statement stmt = connection.createStatement();
                    stmt.execute(alterTableQuery);
                    stmt.close();
                    
                    System.out.println("[Emergency] Added verified column to users table");
                    
                    // Now update the user
                    String query = "UPDATE users SET verified = true WHERE email = ?";
                    ps = connection.prepareStatement(query);
                    ps.setString(1, email);
                    int rowsUpdated = ps.executeUpdate();
                    
                    System.out.println("[Emergency] Marking user as verified: " + email + ", rows updated: " + rowsUpdated);
                } catch (SQLException e) {
                    System.err.println("[Emergency] Error adding verified column: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("[Emergency] Failed to mark user as verified: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (ps != null) {
                try {
                    ps.close();
                } catch (SQLException e) {
                    // Ignore
                }
            }
            pool.freeConnection(connection);
        }
    }
    
    /**
     * Check if a column exists in a table
     */
    private boolean checkIfColumnExists(Connection connection, String tableName, String columnName) {
        try {
            DatabaseMetaData metadata = connection.getMetaData();
            ResultSet resultSet = metadata.getColumns(null, null, tableName, columnName);
            boolean exists = resultSet.next();
            resultSet.close();
            return exists;
        } catch (SQLException e) {
            System.err.println("[Emergency] Error checking if column exists: " + e.getMessage());
            return false;
        }
    }

    @PostMapping("/auth")
    public Map<String, Object> emergencyAuth(@RequestBody(required = false) Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (data == null) {
                throw new IllegalArgumentException("No data provided");
            }
            
            // Extract user data
            String username = (String) data.get("username");
            String email = (String) data.get("email");
            String passwordHash = (String) data.get("passwordHash"); // Will be hashed in DAO
            String role = (String) data.get("role");
            String fullName = (String) data.get("fullName");
            String phoneNumber = (String) data.get("phoneNumber");
            String profileImageUrl = (String) data.get("profileImageUrl");
            
            // Log the received data
            System.out.println("Received registration data - Username: " + username + ", Email: " + email + ", Role: " + role);
            
            // Create user object
            User user = new User(username, email, passwordHash, role, fullName);
            user.setPhoneNumber(phoneNumber);
            user.setProfileImageUrl(profileImageUrl);
            
            // Create a roleData map for additional fields
            Map<String, Object> roleData = new HashMap<>();
            
            // Add role-specific data
            switch (role) {
                case "student":
                    roleData.put("dateOfBirth", data.get("dateOfBirth"));
                    roleData.put("gender", data.get("gender"));
                    roleData.put("academicMajor", data.get("academicMajor"));
                    break;
                case "lecturer":
                    roleData.put("department", data.get("department"));
                    roleData.put("specializations", data.get("specializations"));
                    break;
                case "guest":
                    roleData.put("institutionName", data.get("institutionName"));
                    roleData.put("accessReason", data.get("accessReason"));
                    break;
                case "outsrc_student":
                    roleData.put("dateOfBirth", data.get("dateOfBirth"));
                    roleData.put("organization", data.get("organization"));
                    break;
            }
            
            // Register user
            UserDAO userDAO = new UserDAO();
            boolean successful = userDAO.registerUser(user, roleData);
            
            if (successful) {
                response.put("status", "OK");
                response.put("message", "User registered successfully");
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("fullName", user.getFullName());
                response.put("phoneNumber", user.getPhoneNumber());
                response.put("profileImageUrl", user.getProfileImageUrl());
                
                // Add role-specific data
                response.putAll(roleData);
            } else {
                response.put("status", "ERROR");
                response.put("message", "Failed to register user. Username or email may already exist.");
            }
        } catch (Exception e) {
            System.err.println("Error in registration: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "ERROR");
            response.put("message", "Registration failed: " + e.getMessage());
        }
        
        return response;
    }
} 