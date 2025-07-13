package com.example.controller;

import com.example.dto.GoogleOAuthRequest;
import com.example.dto.GoogleOAuthResponse;
import com.example.service.GoogleOAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/google")
@CrossOrigin(origins = "*")
public class GoogleOAuthController {

    @Autowired
    private GoogleOAuthService googleOAuthService;

    /**
     * Xử lý đăng nhập bằng Google OAuth
     * 
     * @param request Thông tin từ Google OAuth
     * @return Response chứa thông tin user và token
     */
    @PostMapping("/login")
    public ResponseEntity<GoogleOAuthResponse> googleLogin(@RequestBody GoogleOAuthRequest request) {
        try {
            GoogleOAuthResponse response = googleOAuthService.handleGoogleLogin(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            GoogleOAuthResponse errorResponse = new GoogleOAuthResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Google login failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Kiểm tra xem email đã được đăng ký chưa
     * 
     * @param email Email cần kiểm tra
     * @return Thông tin về trạng thái email
     */
    @GetMapping("/check-email")
    public ResponseEntity<Object> checkEmail(@RequestParam String email) {
        try {
            var user = googleOAuthService.findUserByEmail(email);
            
            if (user != null) {
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "hasLocalAuth", user.getPasswordHash() != null && !user.getPasswordHash().isEmpty(),
                    "verified", user.isVerified()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "exists", false,
                    "hasLocalAuth", false,
                    "verified", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to check email: " + e.getMessage()
            ));
        }
    }
} 