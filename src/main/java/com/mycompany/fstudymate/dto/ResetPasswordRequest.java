package com.mycompany.fstudymate.dto;

/**
 * DTO cho yêu cầu đặt lại mật khẩu
 */
public class ResetPasswordRequest {
    
    private String otp;
    private String password;
    private String confirmPassword;

    // Getters and Setters
    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
} 