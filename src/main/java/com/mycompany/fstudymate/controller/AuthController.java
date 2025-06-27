package com.mycompany.fstudymate.controller;

import com.mycompany.fstudymate.dto.ForgotPasswordRequest;
import com.mycompany.fstudymate.dto.ResetPasswordRequest;
import com.mycompany.fstudymate.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý các yêu cầu xác thực và quản lý tài khoản
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, 
             allowedHeaders = "*", 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
             allowCredentials = "true")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    /**
     * Debug endpoint để xóa tất cả OTP (chỉ dùng trong development)
     */
    @PostMapping("/debug/reset-tokens")
    public ResponseEntity<?> debugResetTokens() {
        passwordResetService.clearTokens();
        return ResponseEntity.ok(Map.of("message", "All OTPs cleared"));
    }
    
    /**
     * Xử lý yêu cầu quên mật khẩu
     * 
     * @param request Yêu cầu quên mật khẩu
     * @return Phản hồi thành công hoặc thất bại
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        logger.info("Nhận yêu cầu quên mật khẩu cho email: {}", request.getEmail());
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        boolean processed = passwordResetService.processForgotPasswordRequest(request.getEmail());
        
        Map<String, Object> response = new HashMap<>();
        
        if (processed) {
            logger.info("Đã gửi OTP đặt lại mật khẩu cho: {}", request.getEmail());
            response.put("message", "Password reset OTP sent! Check your email");
            response.put("success", true);
            response.put("email", request.getEmail());
            return ResponseEntity.ok(response);
        } else {
            // Trong môi trường thật, không nên tiết lộ lý do chính xác (bảo mật)
            // nhưng trong môi trường dev/test, ta có thể cho biết email không tồn tại
            logger.warn("Không tìm thấy email trong cơ sở dữ liệu: {}", request.getEmail());
            response.put("message", "If the email exists, a reset code will be sent");
            response.put("success", false);
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Xác thực OTP đặt lại mật khẩu
     * 
     * @param otp Mã OTP
     * @return Phản hồi xác thực thành công hoặc thất bại
     */
    @GetMapping("/validate-otp")
    public ResponseEntity<?> validateOtp(@RequestParam String otp) {
        logger.info("Xác thực OTP đặt lại mật khẩu: {}", otp);
        
        boolean valid = passwordResetService.validateResetToken(otp);
        String email = passwordResetService.getEmailFromOtp(otp);
        
        Map<String, Object> response = new HashMap<>();
        if (valid && email != null) {
            response.put("valid", true);
            response.put("email", email);
            response.put("message", "OTP is valid");
            return ResponseEntity.ok(response);
        } else {
            response.put("valid", false);
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.ok(response); // Vẫn trả về 200 OK nhưng với valid = false
        }
    }
    
    /**
     * Đặt lại mật khẩu
     * 
     * @param request Yêu cầu đặt lại mật khẩu
     * @return Phản hồi thành công hoặc thất bại
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        logger.info("Nhận yêu cầu đặt lại mật khẩu");
        
        // Kiểm tra dữ liệu đầu vào
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP is required"));
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }
        
        if (request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        }
        
        // Kiểm tra mật khẩu và xác nhận mật khẩu
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            logger.warn("Mật khẩu và xác nhận mật khẩu không khớp");
            return ResponseEntity.badRequest().body(Map.of("message", "Password and confirmation do not match"));
        }
        
        boolean reset = passwordResetService.resetPassword(request.getOtp(), request.getPassword());
        
        Map<String, Object> response = new HashMap<>();
        if (reset) {
            logger.info("Đặt lại mật khẩu thành công");
            response.put("success", true);
            response.put("message", "Password has been reset successfully");
            return ResponseEntity.ok(response);
        } else {
            logger.warn("Đặt lại mật khẩu thất bại");
            response.put("success", false);
            response.put("message", "Failed to reset password. OTP may be invalid or expired");
            return ResponseEntity.badRequest().body(response);
        }
    }
} 