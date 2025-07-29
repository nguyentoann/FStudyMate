package com.mycompany.fstudymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {
    "com.mycompany.fstudymate", 
    "dao", 
    "service", 
    "connection", 
    "model"
})
@EntityScan(basePackages = {
    "com.mycompany.fstudymate.model",
    "model"
})
@EnableJpaRepositories(basePackages = {
    "com.mycompany.fstudymate.repository"
})
public class FStudyMateApplication {

    public static void main(String[] args) {
        // Enable OAuth2 profile
        System.setProperty("spring.profiles.active", "oauth2");
        SpringApplication.run(FStudyMateApplication.class, args);
    }
    
    // CORS configuration is now managed in com.mycompany.fstudymate.config.WebConfig
} 