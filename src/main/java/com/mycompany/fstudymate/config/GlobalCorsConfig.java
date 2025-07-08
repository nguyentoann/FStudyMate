package com.mycompany.fstudymate.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;
import java.util.logging.Logger;

/**
 * Global CORS configuration for all endpoints
 * This provides a fallback for CORS in case the Spring MVC configuration doesn't work
 */
@Configuration
public class GlobalCorsConfig {
    private static final Logger logger = Logger.getLogger(GlobalCorsConfig.class.getName());

    @Bean
    public FilterRegistrationBean<CorsFilter> globalCorsFilter() {
        logger.info("Registering Global CORS Filter with full access support");
        
        CorsConfiguration config = new CorsConfiguration();
        
        // IMPORTANT: When using setAllowCredentials(true), you cannot use '*' for allowedOrigins
        // Instead, we use allowedOriginPatterns
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        
        // Critical for cookies/auth to work
        config.setAllowCredentials(true);
        
        // Allow all common headers and custom application headers
        config.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "x-user-role",
            "x-user-id",
            "x-session-id",
            "x-device-info",
            "x-auth-token",
            "x-api-key",
            "x-timezone",
            "x-language",
            "x-app-version",
            "cache-control",
            "pragma"
        ));
        
        // Allow all common methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Expose response headers
        config.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Disposition",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        // Set max age for preflight requests
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        
        logger.info("Global CORS Filter configured with allowedOriginPatterns=[*], allowCredentials=true");
        return bean;
    }
} 