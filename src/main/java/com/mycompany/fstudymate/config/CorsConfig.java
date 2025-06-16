package com.mycompany.fstudymate.config;

import java.util.logging.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * This configuration is now disabled in favor of the CorsFilter class
 * which has HIGHEST_PRECEDENCE and properly handles credentials
 */
//@Configuration
public class CorsConfig {
    private static final Logger logger = Logger.getLogger(CorsConfig.class.getName());

    //@Bean
    public CorsFilter activityCorsFilter() {
        logger.info("Initializing CORS filter");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow specific origins
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000"); // React dev server
        
        // Allow all headers and methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Allow custom headers needed for our application
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Disposition");
        
        // Cache preflight requests
        config.setMaxAge(3600L);
        
        // Apply CORS to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        logger.info("CORS filter initialized with allowedOrigins=[http://localhost:3000], allowCredentials=true");
        return new CorsFilter(source);
    }
} 