package com.mycompany.vinmultiplechoice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

//@Configuration
public class CorsConfig {

    //@Bean
    public CorsFilter activityCorsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins for development
        // In production, you should restrict this to specific origins
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000"); // React dev server
        config.addAllowedOrigin("http://localhost:8080"); // Spring Boot dev server
        config.addAllowedOrigin("https://yourdomain.com"); // Production domain
        
        // Allow all headers and methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Allow custom headers required for activity tracking
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Disposition");
        
        // Apply CORS to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
} 