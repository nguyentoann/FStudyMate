package com.mycompany.fstudymate.config;

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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.logging.Logger;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger logger = Logger.getLogger(SecurityConfig.class.getName());
    
    @Bean
    @Order(1)
    public SecurityFilterChain apiAuthSecurityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring API auth security filter chain");
        return http
                .securityMatcher("/api/auth/**")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .cors().configurationSource(corsConfigurationSource()).and()
                .csrf().disable()
                .build();
    }
    
    @Bean
    @Order(2)
    public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring admin security filter chain with CORS enabled");
        // For development purposes, allow all access to admin endpoints
        return http
                .securityMatcher("/api/admin/**")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Allow any requests to admin endpoints
                .cors().configurationSource(corsConfigurationSource()).and() // Enable CORS
                .csrf().disable()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .build();
    }
    
    @Bean
    @Order(3)
    public SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring public security filter chain with CORS enabled");
        return http
                .securityMatcher("/api/user-activity")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .cors().configurationSource(corsConfigurationSource()).and() // Enable CORS
                .csrf().disable()
                .build();
    }
    
    @Bean 
    @Order(4)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring default security filter chain with CORS enabled");
        // Allow all other endpoints to be accessed freely for development
        return http
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Changed from authenticated to permitAll
                .cors().configurationSource(corsConfigurationSource()).and() // Enable CORS
                .csrf().disable()
                .build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.info("Creating CORS configuration source for Spring Security");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        logger.info("CORS configuration source created with allowCredentials=true");
        return source;
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