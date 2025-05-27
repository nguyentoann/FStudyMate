package com.example.service;

import com.example.model.User;
import com.example.repository.UserRepository;

public interface AuthService {
    User login(String email, String password);
    User register(User user);
    boolean verifyAccount(String email, String otp);
    UserRepository getUserRepository();
    String generateOtpForEmail(String email);
} 