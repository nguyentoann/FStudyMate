package com.mycompany.fstudymate.service.impl;

import com.mycompany.fstudymate.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Implementation của EmailService để gửi email thực
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);
    
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    
    @Value("${spring.mail.username:noreply@fstudymate.com}")
    private String fromEmail;
    
    @Autowired
    private JavaMailSender mailSender;

    @Override
    public boolean sendPasswordResetEmail(String to, String token) {
        try {
            // Tạo link reset
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            // Tạo nội dung email
            String subject = "FStudyMate - Đặt lại mật khẩu";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<h2 style='color: #3366cc;'>Đặt lại mật khẩu FStudyMate</h2>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản FStudyMate.</p>"
                    + "<p>Vui lòng click vào link bên dưới để đặt lại mật khẩu của bạn:</p>"
                    + "<p><a href='" + resetLink + "' style='background-color: #3366cc; color: white; padding: 10px 20px; "
                    + "text-decoration: none; border-radius: 4px; display: inline-block;'>Đặt lại mật khẩu</a></p>"
                    + "<p>Hoặc copy link sau vào trình duyệt của bạn:</p>"
                    + "<p><a href='" + resetLink + "'>" + resetLink + "</a></p>"
                    + "<p>Link này sẽ hết hạn sau 30 phút.</p>"
                    + "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>"
                    + "<p>Trân trọng,<br>Đội ngũ FStudyMate</p>"
                    + "</div>";
            
            // Gửi email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true = HTML content
            
            mailSender.send(message);
            logger.info("Đã gửi email đặt lại mật khẩu đến: {}", to);
            
            return true;
        } catch (MessagingException e) {
            logger.error("Lỗi gửi email: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public boolean sendPasswordResetOtp(String to, String otp) {
        try {
            // Tạo nội dung email
            String subject = "FStudyMate - Mã OTP đặt lại mật khẩu";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<h2 style='color: #3366cc;'>Đặt lại mật khẩu FStudyMate</h2>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản FStudyMate.</p>"
                    + "<p>Vui lòng sử dụng mã OTP bên dưới để xác thực và đặt lại mật khẩu của bạn:</p>"
                    + "<div style='background-color: #f5f5f5; padding: 15px; text-align: center; "
                    + "font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>"
                    + otp
                    + "</div>"
                    + "<p>Mã OTP này sẽ hết hạn sau 15 phút.</p>"
                    + "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>"
                    + "<p>Trân trọng,<br>Đội ngũ FStudyMate</p>"
                    + "</div>";
            
            // Gửi email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true = HTML content
            
            mailSender.send(message);
            logger.info("Đã gửi email chứa OTP đặt lại mật khẩu đến: {}", to);
            
            return true;
        } catch (MessagingException e) {
            logger.error("Lỗi gửi email OTP: {}", e.getMessage());
            return false;
        }
    }
} 