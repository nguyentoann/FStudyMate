package com.example.service;

public interface OtpService {
    
    /**
     * Generate a new OTP for the given email and send it
     * 
     * @param email The user's email
     * @return The generated OTP
     */
    String generateAndSendOtp(String email);
    
    /**
     * Validate the OTP for the given email
     * 
     * @param email The user's email
     * @param otp The OTP to validate
     * @return true if OTP is valid, false otherwise
     */
    boolean validateOtp(String email, String otp);
    
    /**
     * Mark user as verified after OTP validation
     * 
     * @param email The user's email
     * @return true if user was marked as verified, false otherwise
     */
    boolean markUserAsVerified(String email);
} 