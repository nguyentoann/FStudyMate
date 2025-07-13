package com.example.service;

import com.example.dto.GoogleOAuthRequest;
import com.example.dto.GoogleOAuthResponse;
import com.example.model.User;

public interface GoogleOAuthService {
    
    /**
     * Xử lý đăng nhập bằng Google OAuth
     * 
     * @param request Thông tin từ Google OAuth
     * @return Response chứa thông tin user và token
     */
    GoogleOAuthResponse handleGoogleLogin(GoogleOAuthRequest request);
    
    /**
     * Xác thực Google ID token
     * 
     * @param idToken Google ID token
     * @return Thông tin user từ Google
     */
    GoogleUserInfo verifyGoogleToken(String idToken);
    
    /**
     * Tìm user theo email
     * 
     * @param email Email của user
     * @return User nếu tồn tại, null nếu không
     */
    User findUserByEmail(String email);
    
    /**
     * Tạo user mới từ thông tin Google
     * 
     * @param googleUserInfo Thông tin từ Google
     * @return User mới được tạo
     */
    User createUserFromGoogle(GoogleUserInfo googleUserInfo);
    
    /**
     * Liên kết tài khoản hiện tại với Google
     * 
     * @param user User hiện tại
     * @param googleUserInfo Thông tin từ Google
     * @return User đã được cập nhật
     */
    User linkUserToGoogle(User user, GoogleUserInfo googleUserInfo);
    
    /**
     * Tạo JWT token cho user
     * 
     * @param user User cần tạo token
     * @return JWT token
     */
    String generateJwtToken(User user);
    
    /**
     * Thông tin user từ Google
     */
    class GoogleUserInfo {
        private String id;
        private String email;
        private String name;
        private String picture;
        private boolean emailVerified;
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getPicture() { return picture; }
        public void setPicture(String picture) { this.picture = picture; }
        
        public boolean isEmailVerified() { return emailVerified; }
        public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    }
} 