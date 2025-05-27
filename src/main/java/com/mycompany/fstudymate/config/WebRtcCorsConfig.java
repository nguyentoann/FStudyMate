package com.mycompany.fstudymate.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Specific CORS configuration for WebRTC call handling with credentials support
 * DISABLED - Replaced by GlobalCorsConfig to avoid conflicts
 */
//@Configuration
public class WebRtcCorsConfig {

    //@Bean
    public FilterRegistrationBean<CorsFilter> webRtcCorsFilter() {
        System.out.println("Registering WebRTC CORS filter with credentials support");
        
        CorsConfiguration config = new CorsConfiguration();
        
        // CRITICAL: When using credentials, we MUST specify exact origins (not wildcards)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://localhost:3000"
        ));
        
        // Allow credentials (cookies, auth headers)
        config.setAllowCredentials(true);
        
        // Allow all necessary headers and methods
        config.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Expose additional headers if needed
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        
        // Set max age for CORS preflight requests (in seconds)
        config.setMaxAge(3600L);
        
        // Only apply to video call endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/video-call/**", config);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        // Make sure this filter runs before other CORS filters
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
} 