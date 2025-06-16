package com.mycompany.fstudymate.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Enumeration;

// Comment out the Component annotation to disable this filter
// @Component
@Order(Ordered.HIGHEST_PRECEDENCE - 1)
public class CorsDebugFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        
        // Debug logging is disabled
        // Uncomment below if you need to debug CORS issues
        /*
        System.out.println("==== CORS DEBUG ====");
        System.out.println("Request method: " + request.getMethod());
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request origin: " + request.getHeader("Origin"));
        
        // Print all request headers
        System.out.println("Request headers:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            System.out.println("  " + headerName + ": " + request.getHeader(headerName));
        }
        */
        
        // Continue filter chain
        chain.doFilter(req, res);
        
        // Debug response logging is disabled
        /*
        System.out.println("Response status: " + response.getStatus());
        System.out.println("Response CORS headers:");
        response.getHeaderNames().forEach(headerName -> {
            if (headerName.startsWith("Access-Control-")) {
                System.out.println("  " + headerName + ": " + response.getHeader(headerName));
            }
        });
        System.out.println("==== END CORS DEBUG ====");
        */
    }
} 