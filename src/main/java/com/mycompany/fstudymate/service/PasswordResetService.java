package com.mycompany.fstudymate.service;

/**
 * Service xử lý quên mật khẩu
 */
public interface PasswordResetService {
    
    /**
     * Xử lý yêu cầu quên mật khẩu
     * 
     * @param email Email của người dùng
     * @return true nếu xử lý thành công (email tồn tại), false nếu không tìm thấy email
     */
    boolean processForgotPasswordRequest(String email);
    
    /**
     * Xác thực token đặt lại mật khẩu
     * 
     * @param token Token đặt lại mật khẩu
     * @return true nếu token hợp lệ, false nếu token không hợp lệ
     */
    boolean validateResetToken(String token);
    
    /**
     * Đặt lại mật khẩu
     * 
     * @param token Token đặt lại mật khẩu
     * @param newPassword Mật khẩu mới
     * @return true nếu đặt lại mật khẩu thành công, false nếu thất bại
     */
    boolean resetPassword(String token, String newPassword);
    
    /**
     * Lấy email từ OTP
     * 
     * @param otp Mã OTP
     * @return Email liên kết với OTP, null nếu OTP không tồn tại
     */
    String getEmailFromOtp(String otp);
    
    /**
     * Khởi tạo lại hệ thống token (cho test)
     */
    void clearTokens();
} 