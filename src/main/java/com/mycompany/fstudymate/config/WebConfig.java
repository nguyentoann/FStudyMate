package com.mycompany.fstudymate.config;

import java.util.logging.Logger;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private static final Logger logger = Logger.getLogger(WebConfig.class.getName());

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        logger.info("Configuring CORS mappings");
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Content-Disposition")
            .allowCredentials(true)
            .maxAge(3600); // Cache preflight requests for 1 hour
        
        logger.info("CORS configuration complete: allowedOrigins=[http://localhost:3000], allowCredentials=true");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map the URL path /images/** to look in the webapp SourceImg directory
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/META-INF/resources/SourceImg/", 
                                     "classpath:/resources/SourceImg/",
                                     "classpath:/static/SourceImg/", 
                                     "classpath:/public/SourceImg/", 
                                     "file:src/main/webapp/SourceImg/")
                .setCachePeriod(3600); // Cache for 1 hour
                
        // You can add more mappings if needed for different directories
        // For example, if images are in a specific location on your system:
        // registry.addResourceHandler("/question-images/**")
        //         .addResourceLocations("file:/path/to/your/images/");
    }
} 