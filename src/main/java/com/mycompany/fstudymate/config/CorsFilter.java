package com.mycompany.fstudymate.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.logging.Logger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {
    private static final Logger logger = Logger.getLogger(CorsFilter.class.getName());

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        // Enable logging for CORS requests
        logger.info("CorsFilter processing request: " + request.getMethod() + " " + request.getRequestURI());
        
        // Get the Origin header from the request
        String origin = request.getHeader("Origin");
        
        // Allow any origin with proper reflection
        if (origin != null) {
            logger.info("Request origin: " + origin + ", allowing access");
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            logger.info("No Origin header in request, setting Access-Control-Allow-Origin: *");
            response.setHeader("Access-Control-Allow-Origin", "*");
        }
        
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "x-requested-with, authorization, content-type, accept, origin");
        
        // CRITICAL: Set Allow-Credentials to true for all requests
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // For preflight requests
        if ("OPTIONS".equals(request.getMethod())) {
            logger.info("Handling OPTIONS preflight request for: " + request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        chain.doFilter(req, res);
    }
} 