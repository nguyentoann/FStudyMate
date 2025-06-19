package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ExampleWebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Global configuration - explicitly include all required origins
        registry.addMapping("/**")
                .allowedOrigins("*", "http://10.10.10.14:3000", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
                
        // Special config for auth endpoints
        registry.addMapping("/api/auth/**")
                .allowedOrigins("*", "http://10.10.10.14:3000", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
                
        // Special config for public endpoints
        registry.addMapping("/public/**")
                .allowedOrigins("*", "http://10.10.10.14:3000", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
                
        // Special config for emergency endpoints
        registry.addMapping("/emergency/**")
                .allowedOrigins("*", "http://10.10.10.14:3000", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
                
        // Special config for open endpoints
        registry.addMapping("/open/**")
                .allowedOrigins("*", "http://10.10.10.14:3000", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
} 