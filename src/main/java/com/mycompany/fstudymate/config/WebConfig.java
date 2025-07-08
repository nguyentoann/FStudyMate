package com.mycompany.fstudymate.config;

import java.util.Collections;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private static final Logger logger = Logger.getLogger(WebConfig.class.getName());

    @Value("${student.images.path:/app/student-images}")
    private String studentImagesPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        logger.info("Configuring CORS mappings");
        
        // Global CORS configuration for all API endpoints
        registry.addMapping("/**")
            .allowedOriginPatterns("*") // Allow any origin
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Content-Disposition")
            .allowCredentials(true)
            .maxAge(3600); // Cache preflight requests for 1 hour
        
        // Enhanced specific configuration for video call API with explicit OPTIONS handling
        registry.addMapping("/api/video-call/**")
            .allowedOriginPatterns("*") // Allow any origin
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Content-Disposition")
            .allowCredentials(true)
            .maxAge(3600);
            
        // Enhanced specific configuration for chat API with explicit OPTIONS handling
        registry.addMapping("/api/chat/**")
            .allowedOriginPatterns("*") // Allow any origin
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Content-Disposition")
            .allowCredentials(true)
            .maxAge(3600);
        
        logger.info("CORS configuration complete: allowedOriginPatterns=[*], allowCredentials=true");
    }
    
    /**
     * Create a CorsFilter bean that will handle all CORS requests including preflight OPTIONS requests
     * This provides a more robust solution than relying solely on Spring MVC's CORS handling
     */
    @Bean
    public CorsFilter corsFilter() {
        logger.info("Creating CORS filter bean");
        
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        
        // When using setAllowCredentials(true), you cannot use '*' for allowedOrigins
        // Instead, use specific origins or allowedOriginPatterns
        config.addAllowedOrigin("http://localhost:3000");
        // config.addAllowedOrigin("*"); // This is invalid with allowCredentials=true
        config.setAllowedOriginPatterns(Collections.singletonList("*")); // Use this instead
        
        // Allow all headers including custom application headers
        config.addAllowedHeader("*");
        
        // Explicitly add common headers
        config.addAllowedHeader("Authorization");
        config.addAllowedHeader("Content-Type");
        config.addAllowedHeader("Accept");
        
        // Add custom application headers
        config.addAllowedHeader("x-user-role");
        config.addAllowedHeader("x-user-id");
        config.addAllowedHeader("x-session-id");
        config.addAllowedHeader("x-device-info");
        config.addAllowedHeader("x-auth-token");
        config.addAllowedHeader("x-api-key");
        config.addAllowedHeader("x-timezone");
        config.addAllowedHeader("x-language");
        config.addAllowedHeader("x-app-version");
        
        // Expose headers
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Disposition");
        
        // Allow all methods
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        source.registerCorsConfiguration("/api/video-call/**", config);
        source.registerCorsConfiguration("/api/chat/**", config);
        source.registerCorsConfiguration("/public/**", config);
        
        logger.info("CORS filter bean created with allowCredentials=true");
        return new CorsFilter(source);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        logger.info("Configuring resource handlers");
        
        // Map the URL path /images/** to look in the webapp SourceImg directory
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/META-INF/resources/SourceImg/", 
                                     "classpath:/resources/SourceImg/",
                                     "classpath:/static/SourceImg/", 
                                     "classpath:/public/SourceImg/", 
                                     "file:src/main/webapp/SourceImg/")
                .setCachePeriod(3600); // Cache for 1 hour
                
        // Add mapping for student files (images, 3D models, etc.)
        // This is a fallback for direct file access, but the controller should handle most requests
        logger.info("Configuring student files resource handler");
        registry.addResourceHandler("/public/StudentImages/**")
                .addResourceLocations("classpath:/META-INF/resources/StudentImages/",
                                     "classpath:/resources/StudentImages/",
                                     "classpath:/static/StudentImages/", 
                                     "classpath:/public/StudentImages/",
                                     "file:src/main/webapp/StudentImages/",
                                     "file:/app/student-images/")
                .setCachePeriod(3600); // Cache for 1 hour
                
        // Add mapping for student files in other locations
        logger.info("Configuring additional student files resource handler");
        registry.addResourceHandler("/public/StudentFiles/**")
                .addResourceLocations("classpath:/META-INF/resources/StudentFiles/",
                                     "classpath:/resources/StudentFiles/",
                                     "classpath:/static/StudentFiles/", 
                                     "classpath:/public/StudentFiles/",
                                     "file:src/main/webapp/StudentFiles/",
                                     "file:/app/student-files/")
                .setCachePeriod(3600); // Cache for 1 hour
        
        logger.info("Resource handlers configured successfully");
    }
} 