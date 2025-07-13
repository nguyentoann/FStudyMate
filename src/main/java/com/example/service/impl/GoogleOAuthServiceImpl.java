package com.example.service.impl;

import com.example.dto.GoogleOAuthRequest;
import com.example.dto.GoogleOAuthResponse;
import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.GoogleOAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleOAuthServiceImpl implements GoogleOAuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Value("${google.oauth.client.id}")
    private String googleClientId;
    
    @Value("${google.oauth.client.secret}")
    private String googleClientSecret;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Key jwtSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    @Override
    @Transactional
    public GoogleOAuthResponse handleGoogleLogin(GoogleOAuthRequest request) {
        try {
            // Xác thực Google ID token
            GoogleUserInfo googleUserInfo = verifyGoogleToken(request.getIdToken());
            
            if (googleUserInfo == null) {
                return createErrorResponse("Invalid Google token");
            }
            
            // Tìm user theo email
            User existingUser = findUserByEmail(googleUserInfo.getEmail());
            
            GoogleOAuthResponse response = new GoogleOAuthResponse();
            
            if (existingUser != null) {
                // User đã tồn tại
                if (existingUser.getPasswordHash() != null && !existingUser.getPasswordHash().isEmpty()) {
                    // User đã đăng ký với local auth - liên kết với Google
                    User linkedUser = linkUserToGoogle(existingUser, googleUserInfo);
                    String token = generateJwtToken(linkedUser);
                    
                    response.setSuccess(true);
                    response.setMessage("Account linked to Google successfully");
                    response.setToken(token);
                    response.setUser(createUserInfo(linkedUser, false, true));
                } else {
                    // User đã đăng ký với Google auth
                    String token = generateJwtToken(existingUser);
                    
                    response.setSuccess(true);
                    response.setMessage("Login successful");
                    response.setToken(token);
                    response.setUser(createUserInfo(existingUser, false, true));
                }
            } else {
                // Tạo user mới
                User newUser = createUserFromGoogle(googleUserInfo);
                String token = generateJwtToken(newUser);
                
                response.setSuccess(true);
                response.setMessage("Account created successfully");
                response.setToken(token);
                response.setUser(createUserInfo(newUser, true, true));
            }
            
            return response;
            
        } catch (Exception e) {
            return createErrorResponse("Google login failed: " + e.getMessage());
        }
    }

    @Override
    public GoogleUserInfo verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new JacksonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            
            if (googleIdToken != null) {
                Payload payload = googleIdToken.getPayload();
                
                GoogleUserInfo userInfo = new GoogleUserInfo();
                userInfo.setId(payload.getSubject());
                userInfo.setEmail(payload.getEmail());
                userInfo.setName((String) payload.get("name"));
                userInfo.setPicture((String) payload.get("picture"));
                userInfo.setEmailVerified(payload.getEmailVerified());
                
                return userInfo;
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("Error verifying Google token: " + e.getMessage());
            return null;
        }
    }

    @Override
    public User findUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.orElse(null);
    }

    @Override
    @Transactional
    public User createUserFromGoogle(GoogleUserInfo googleUserInfo) {
        User user = new User();
        user.setEmail(googleUserInfo.getEmail());
        user.setFullName(googleUserInfo.getName());
        user.setUsername(generateUsername(googleUserInfo.getEmail()));
        user.setRole("student"); // Default role
        user.setVerified(true); // Google accounts are pre-verified
        user.setPasswordHash(""); // Empty for Google auth users
        user.setGoogleId(googleUserInfo.getId());
        user.setProfileImageUrl(googleUserInfo.getPicture());
        
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User linkUserToGoogle(User user, GoogleUserInfo googleUserInfo) {
        // Cập nhật thông tin user với Google info
        if (user.getFullName() == null || user.getFullName().isEmpty()) {
            user.setFullName(googleUserInfo.getName());
        }
        
        // Lưu Google ID và profile image
        user.setGoogleId(googleUserInfo.getId());
        user.setProfileImageUrl(googleUserInfo.getPicture());
        
        return userRepository.save(user);
    }

    @Override
    public String generateJwtToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)) // 24 hours
                .signWith(jwtSecretKey)
                .compact();
    }
    
    private GoogleOAuthResponse createErrorResponse(String message) {
        GoogleOAuthResponse response = new GoogleOAuthResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
    
    private GoogleOAuthResponse.UserInfo createUserInfo(User user, boolean isNewUser, boolean linkedToGoogle) {
        GoogleOAuthResponse.UserInfo userInfo = new GoogleOAuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setEmail(user.getEmail());
        userInfo.setUsername(user.getUsername());
        userInfo.setFullName(user.getFullName());
        userInfo.setRole(user.getRole());
        userInfo.setVerified(user.isVerified());
        userInfo.setNewUser(isNewUser);
        userInfo.setLinkedToGoogle(linkedToGoogle);
        return userInfo;
    }
    
    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
} 