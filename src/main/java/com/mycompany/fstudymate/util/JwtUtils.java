package com.mycompany.fstudymate.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    
    @Value("${app.jwtSecret:defaultSecretKey}")
    private String jwtSecret;
    
    /**
     * Extract user ID from the JWT token in the request
     * 
     * @param request HTTP request containing the JWT token
     * @return User ID extracted from token, or null if not available/valid
     */
    public Integer extractUserIdFromRequest(HttpServletRequest request) {
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret)
                        .parseClaimsJws(jwt)
                        .getBody();
                
                // Assuming the user ID is stored as "id" in the JWT claims
                return claims.get("id", Integer.class);
            }
        } catch (Exception e) {
            logger.error("Could not extract user ID from token: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * Extract JWT from the Authorization header
     * 
     * @param request HTTP request
     * @return JWT token without "Bearer " prefix, or null if not found
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
} 