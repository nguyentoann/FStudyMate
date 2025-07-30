package com.mycompany.fstudymate.config;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.*;
import java.util.Map;
import java.util.logging.Logger;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Filter to cache the request body for HeaderSizeAdvice to use
 * Only activates on requests with x-auth-in-body header
 */
@Component
@Order(1)
public class RequestBodyCachingFilter implements Filter {
    private static final Logger logger = Logger.getLogger(RequestBodyCachingFilter.class.getName());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // Only process if we have the special header
        if ("true".equalsIgnoreCase(httpRequest.getHeader("x-auth-in-body"))) {
            logger.info("Caching request body for request with x-auth-in-body header");
            
            // Wrap the request to make the body rereadable
            CachedBodyHttpServletRequest wrappedRequest = new CachedBodyHttpServletRequest(httpRequest);
            
            // Read and parse the body
            String body = wrappedRequest.getReader().lines().reduce("", (accumulator, actual) -> accumulator + actual);
            
            if (!body.isEmpty()) {
                try {
                    // Parse JSON body and make it available as request attribute
                    Map<String, Object> bodyMap = objectMapper.readValue(body, Map.class);
                    wrappedRequest.setAttribute("requestBody", bodyMap);
                    logger.info("Request body cached successfully");
                    
                    // Process auth data if present
                    if (bodyMap.containsKey("_auth")) {
                        Map<String, String> authData = (Map<String, String>)bodyMap.get("_auth");
                        
                        // Process auth headers from body
                        if (authData != null) {
                            for (Map.Entry<String, String> entry : authData.entrySet()) {
                                // Add as request attribute (controllers can access via @RequestAttribute)
                                wrappedRequest.setAttribute(entry.getKey(), entry.getValue());
                                logger.info("Set attribute from auth data: " + entry.getKey());
                            }
                            logger.info("Processed auth data from request body");
                        }
                        
                        // Check if this was a method override (GET/DELETE converted to POST)
                        if (bodyMap.containsKey("_method")) {
                            String originalMethod = (String)bodyMap.get("_method");
                            wrappedRequest.setAttribute("originalMethod", originalMethod);
                            logger.info("Original method was: " + originalMethod);
                        }
                    }
                } catch (Exception e) {
                    logger.warning("Could not parse request body: " + e.getMessage());
                }
            }
            
            // Continue with our wrapped request
            chain.doFilter(wrappedRequest, response);
        } else {
            // Continue normally
            chain.doFilter(request, response);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
    
    /**
     * Custom request wrapper that allows body to be read multiple times
     */
    private static class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {
        private byte[] cachedBody;

        public CachedBodyHttpServletRequest(HttpServletRequest request) throws IOException {
            super(request);
            InputStream requestInputStream = request.getInputStream();
            this.cachedBody = requestInputStream.readAllBytes();
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            return new CachedBodyServletInputStream(this.cachedBody);
        }

        @Override
        public BufferedReader getReader() throws IOException {
            ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(this.cachedBody);
            return new BufferedReader(new InputStreamReader(byteArrayInputStream));
        }

        private static class CachedBodyServletInputStream extends ServletInputStream {
            private final ByteArrayInputStream inputStream;

            public CachedBodyServletInputStream(byte[] cachedBody) {
                this.inputStream = new ByteArrayInputStream(cachedBody);
            }

            @Override
            public int read() throws IOException {
                return inputStream.read();
            }

            @Override
            public boolean isFinished() {
                return inputStream.available() == 0;
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener) {
                throw new UnsupportedOperationException("Not implemented");
            }
        }
    }
}