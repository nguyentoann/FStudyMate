package com.mycompany.fstudymate.service;

/**
 * Service xử lý gửi email
 */
public interface EmailService {
    
    /**
     * Gửi email đặt lại mật khẩu
     * 
     * @param to Địa chỉ email người nhận
     * @param token Token đặt lại mật khẩu
     * @return true nếu gửi thành công, ngược lại false
     */
    boolean sendPasswordResetEmail(String to, String token);
    
    /**
     * Gửi email chứa OTP đặt lại mật khẩu
     * 
     * @param to Địa chỉ email người nhận
     * @param otp Mã OTP dùng để đặt lại mật khẩu
     * @return true nếu gửi thành công, ngược lại false
     */
    boolean sendPasswordResetOtp(String to, String otp);
} 