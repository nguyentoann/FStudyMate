package com.mycompany.fstudymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.mycompany.fstudymate.api", "com.mycompany.fstudymate.config"})
public class WebRtcApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebRtcApplication.class, args);
    }

} 