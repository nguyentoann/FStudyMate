package com.mycompany.vinmultiplechoice.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        // Log the request for debugging
        System.out.println("CorsFilter processing request: " + request.getMethod() + " " + request.getRequestURI());
        
        // Get the Origin header from the request
        String origin = request.getHeader("Origin");
        
        // Allow any origin, but specifically handle known origins
        if (origin != null) {
            System.out.println("Request origin: " + origin);
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            response.setHeader("Access-Control-Allow-Origin", "*");
        }
        
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "x-requested-with, authorization, content-type, accept");
        response.setHeader("Access-Control-Allow-Credentials", "false");
        
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println("Handling OPTIONS preflight request");
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            System.out.println("Continuing filter chain for non-OPTIONS request");
            chain.doFilter(req, res);
        }
    }
} 