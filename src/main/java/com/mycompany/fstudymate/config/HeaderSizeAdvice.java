package com.mycompany.fstudymate.config;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdvice;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Controller advice to handle large headers by supporting auth data in request body
 * Works with the frontend makeApiCall() utility that moves auth headers to body when they grow too large
 */
@ControllerAdvice
@Component
@Order(1)
public class HeaderSizeAdvice {
    private static final Logger logger = Logger.getLogger(HeaderSizeAdvice.class.getName());
    
    /**
     * Process any request with x-auth-in-body header
     * Extracts auth data from request body and adds it as request attributes
     */
    @ModelAttribute
    public void handleLargeHeaders() {
        // This method was causing an error with HttpServletRequest injection
        // We'll move the functionality to a filter instead
        logger.info("HeaderSizeAdvice is disabled - using RequestBodyCachingFilter instead");
    }
}