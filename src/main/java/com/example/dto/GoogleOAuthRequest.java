package com.example.dto;

import lombok.Data;

@Data
public class GoogleOAuthRequest {
    private String idToken;
    private String accessToken;
    private String email;
    private String name;
    private String picture;
} 