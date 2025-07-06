package com.mycompany.fstudymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.mycompany.fstudymate", 
    "dao", 
    "service", 
    "connection", 
    "model"
})
public class FStudyMateApplication {

    public static void main(String[] args) {
        // Set profiles programmatically to ensure security is disabled
        System.setProperty("spring.profiles.active", "nosecurity");
        SpringApplication.run(FStudyMateApplication.class, args);
    }
    
    // CORS configuration is now managed in com.mycompany.fstudymate.config.WebConfig
    /*
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")  // Use patterns instead of origins for Spring Boot 2.4+
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false);
                
                // Explicit mapping for login endpoint
                registry.addMapping("/open/login")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }
    */
} 