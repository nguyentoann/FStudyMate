package com.example.dto;

import lombok.Data;

@Data
public class GoogleOAuthResponse {
    private boolean success;
    private String message;
    private String token;
    private UserInfo user;
    
    @Data
    public static class UserInfo {
        private Long id;
        private String email;
        private String username;
        private String fullName;
        private String role;
        private String profileImageUrl;
        private boolean verified;
        private boolean isNewUser;
        private boolean linkedToGoogle;
    }
} 