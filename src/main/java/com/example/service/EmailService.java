package com.example.service;

public interface EmailService {
    
    /**
     * Send a simple email
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param body email body content
     */
    void sendSimpleEmail(String to, String subject, String body);
    
    /**
     * Send HTML email
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param htmlBody email body content in HTML format
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);
    
    /**
     * Send OTP to user email
     * 
     * @param to recipient email address
     * @param otp the one-time password
     * @return true if email was sent successfully
     */
    boolean sendOtpEmail(String to, String otp);
    
    /**
     * Send notification email
     * 
     * @param to recipient email address
     * @param subject notification subject
     * @param message notification message
     * @return true if email was sent successfully
     */
    boolean sendNotificationEmail(String to, String subject, String message);
} 