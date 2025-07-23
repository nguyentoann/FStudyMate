package com.mycompany.fstudymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableScheduling
public class FStudyMateApplication {

    public static void main(String[] args) {
        // Set profiles programmatically to include oauth profile
        System.setProperty("spring.profiles.active", "nosecurity,oauth");
        SpringApplication.run(FStudyMateApplication.class, args);
    }
} 