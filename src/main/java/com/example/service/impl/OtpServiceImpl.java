package com.example.service.impl;

import com.example.model.OtpEntity;
import com.example.model.User;
import com.example.repository.OtpRepository;
import com.example.repository.UserRepository;
import com.example.service.EmailService;
import com.example.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpServiceImpl.class);
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    
    @Autowired
    private OtpRepository otpRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Generate a random numeric OTP of specified length
     */
    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10)); // 0-9
        }
        
        return otp.toString();
    }
    
    @Override
    @Transactional
    public String generateAndSendOtp(String email) {
        // First invalidate any existing OTPs for this email
        Optional<OtpEntity> existingOtp = otpRepository.findFirstByEmailAndUsedOrderByExpiryTimeDesc(email, false);
        existingOtp.ifPresent(otpEntity -> {
            otpEntity.setUsed(true);
            otpRepository.save(otpEntity);
        });
        
        // Generate a new OTP
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        
        // Save the OTP to the database
        OtpEntity otpEntity = new OtpEntity(email, otp, expiryTime);
        otpRepository.save(otpEntity);
        
        // Send the OTP to the user's email
        boolean emailSent = emailService.sendOtpEmail(email, otp);
        
        if (emailSent) {
            logger.info("OTP sent successfully to email: {}", email);
            return otp;
        } else {
            logger.error("Failed to send OTP email to: {}", email);
            throw new RuntimeException("Failed to send OTP email");
        }
    }
    
    @Override
    @Transactional
    public boolean validateOtp(String email, String otp) {
        // Find the most recent OTP for this email that hasn't been used
        Optional<OtpEntity> otpOptional = otpRepository.findByOtpAndEmail(otp, email);
        
        if (otpOptional.isPresent()) {
            OtpEntity otpEntity = otpOptional.get();
            
            // Check if OTP has expired or already been used
            if (otpEntity.isExpired()) {
                logger.info("OTP has expired for email: {}", email);
                return false;
            }
            
            if (otpEntity.getUsed()) {
                logger.info("OTP has already been used for email: {}", email);
                return false;
            }
            
            // Mark OTP as used
            otpEntity.setUsed(true);
            otpRepository.save(otpEntity);
            
            logger.info("OTP validated successfully for email: {}", email);
            return true;
        }
        
        logger.info("Invalid OTP provided for email: {}", email);
        return false;
    }
    
    @Override
    @Transactional
    public boolean markUserAsVerified(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setVerified(true);
            userRepository.save(user);
            
            logger.info("User with email {} marked as verified", email);
            
            // Send a welcome email to the user
            emailService.sendNotificationEmail(
                email,
                "Welcome to Our Platform",
                "Your account has been successfully verified. You can now login and start using our services."
            );
            
            return true;
        }
        
        logger.error("User with email {} not found for verification", email);
        return false;
    }
} 