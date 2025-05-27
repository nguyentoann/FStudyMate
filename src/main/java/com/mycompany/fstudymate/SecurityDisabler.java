package com.mycompany.fstudymate;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class SecurityDisabler {
    
    // Custom CORS filter with highest priority
    // DISABLED: Replaced with GlobalCorsConfig
    //@Bean
    public FilterRegistrationBean<CorsFilter> emergencyCorsFilter() {
        System.out.println("Registering emergency CORS filter");
        
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(false);
        
        // Allow all origins
        config.addAllowedOrigin("*");
        // Also specifically allow the phone IP
        config.addAllowedOrigin("http://10.10.10.14:3000");
        config.addAllowedOrigin("http://localhost:3000");
        
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
} 