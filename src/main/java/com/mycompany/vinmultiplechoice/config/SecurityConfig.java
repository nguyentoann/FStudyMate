package com.mycompany.vinmultiplechoice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    @Order(1)
    public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) throws Exception {
        // For development purposes, allow all access to admin endpoints
        return http
                .securityMatcher("/api/admin/**")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Allow any requests to admin endpoints
                .csrf().disable()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .build();
    }
    
    @Bean
    @Order(2)
    public SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/api/user-activity")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .csrf().disable()
                .build();
    }
    
    @Bean 
    @Order(3)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        // Allow all other endpoints to be accessed freely for development
        return http
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Changed from authenticated to permitAll
                .csrf().disable()
                .build();
    }
    
    @Bean
    public UserDetailsService userDetailsService() {
        // Create an admin user for accessing secure endpoints
        // In a real app, this would come from a database
        UserDetails adminUser = User.builder()
                .username("admin")
                .password(passwordEncoder().encode("adminPassword"))
                .roles("ADMIN")
                .build();
        
        return new InMemoryUserDetailsManager(adminUser);
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 