package com.example.service;

import com.example.model.User;
import com.example.repository.UserRepository;

public interface AuthService {
    User login(String email, String password);
    User register(User user);
    boolean verifyAccount(String email, String otp);
    UserRepository getUserRepository();
    String generateOtpForEmail(String email);
    
    /**
     * Generate a password reset OTP for the given email
     * 
     * @param email User email
     * @return true if OTP was generated and sent successfully
     */
    boolean generatePasswordResetOtp(String email);
    
    /**
     * Reset user password using OTP verification
     * 
     * @param email User email
     * @param otp One-time password
     * @param newPassword New password
     * @return true if password was reset successfully
     */
    boolean resetPassword(String email, String otp, String newPassword);
} 