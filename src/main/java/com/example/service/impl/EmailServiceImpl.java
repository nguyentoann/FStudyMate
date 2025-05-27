package com.example.service.impl;

import com.example.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);
    
    @Autowired
    private JavaMailSender emailSender;

    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            emailSender.send(message);
            logger.info("Simple email sent to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send simple email to {}: {}", to, e.getMessage());
            throw e;
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            emailSender.send(message);
            logger.info("HTML email sent to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public boolean sendOtpEmail(String to, String otp) {
        try {
            String subject = "Your One-Time Password (OTP)";
            String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>"
                    + "<h2 style='color: #3f51b5; text-align: center;'>Account Verification</h2>"
                    + "<p>Dear User,</p>"
                    + "<p>Thank you for registering with our service. Please use the following One-Time Password (OTP) to verify your account:</p>"
                    + "<div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>"
                    + otp
                    + "</div>"
                    + "<p>This OTP is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>"
                    + "<p>Best regards,<br>The Team</p>"
                    + "</div>";
            
            sendHtmlEmail(to, subject, htmlBody);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send OTP email: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean sendNotificationEmail(String to, String subject, String message) {
        try {
            String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>"
                    + "<h2 style='color: #3f51b5; text-align: center;'>Notification</h2>"
                    + "<p>Dear User,</p>"
                    + "<p>" + message + "</p>"
                    + "<p>Best regards,<br>The Team</p>"
                    + "</div>";
            
            sendHtmlEmail(to, subject, htmlBody);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send notification email: {}", e.getMessage());
            return false;
        }
    }
} 