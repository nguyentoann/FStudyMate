package com.mycompany.fstudymate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/oauth2")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, 
             allowedHeaders = "*", 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
             allowCredentials = "true")
public class OAuth2LoginController {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginController.class);
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${app.oauth.redirectUri:http://localhost:3000/dashboard}")
    private String oauthRedirectUri;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;
    
    @Value("${spring.security.oauth2.client.provider.google.token-uri:https://oauth2.googleapis.com/token}")
    private String tokenUri;
    
    @Value("${spring.security.oauth2.client.provider.google.user-info-uri:https://www.googleapis.com/oauth2/v3/userinfo}")
    private String userInfoUri;
    
    /**
     * Extract the name from an email address (text before @)
     */
    private String extractNameFromEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "User";
        }
        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }
    
    /**
     * Generate a random user ID if needed
     */
    private String generateUserId() {
        return UUID.randomUUID().toString();
    }
    
    /**
     * Handle OAuth2 authorization code and exchange it for user information
     * Supports both GET with query parameters and POST with JSON body
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserWithCode(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        return processOAuthCode(code, state, principal);
    }

    /**
     * POST endpoint for handling OAuth code exchange to avoid header size limitations
     */
    @PostMapping("/user")
    public ResponseEntity<?> getUserWithCodePost(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        String code = payload.get("code");
        String state = payload.get("state");
        return processOAuthCode(code, state, principal);
    }

    /**
     * Simple code exchange endpoint to avoid 431 errors
     * This endpoint accepts just the authorization code and handles the exchange
     */
    @PostMapping("/exchange")
    public ResponseEntity<?> exchangeCode(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String redirectUri = payload.get("redirectUri");
        
        if (code == null) {
            logger.warn("No authorization code provided");
            return ResponseEntity.badRequest().body(Map.of(
                "authenticated", false,
                "error", "No authorization code provided"
            ));
        }
        
        logger.info("Exchanging authorization code for token with simplified endpoint");
        
        try {
            // Use the client credentials to exchange the code for a token
            RestTemplate restTemplate = new RestTemplate();
            
            // Prepare the token request
            HttpHeaders headers = new HttpHeaders();
            headers.add("Accept", "application/json");
            headers.add("Content-Type", "application/x-www-form-urlencoded");
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "authorization_code");
            body.add("code", code);
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("redirect_uri", redirectUri != null ? redirectUri : "http://localhost:3000/login/oauth2/code/google");
            
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            
            // Exchange the code for a token
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                tokenUri,
                HttpMethod.POST,
                requestEntity,
                Map.class
            );
            
            if (!tokenResponse.getStatusCode().is2xxSuccessful() || !tokenResponse.hasBody()) {
                logger.error("Token exchange failed: {}", tokenResponse.getStatusCode());
                return ResponseEntity.status(tokenResponse.getStatusCode()).body(Map.of(
                    "authenticated", false,
                    "error", "Failed to exchange authorization code for token"
                ));
            }
            
            // Extract the access token
            Map<String, Object> tokenBody = tokenResponse.getBody();
            String accessToken = (String) tokenBody.get("access_token");
            
            if (accessToken == null) {
                logger.error("No access token in response");
                return ResponseEntity.badRequest().body(Map.of(
                    "authenticated", false,
                    "error", "No access token received"
                ));
            }
            
            // Use the access token to get user information
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.add("Authorization", "Bearer " + accessToken);
            HttpEntity<?> userInfoRequest = new HttpEntity<>(userInfoHeaders);
            
            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                userInfoUri,
                HttpMethod.GET,
                userInfoRequest,
                Map.class
            );
            
            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || !userInfoResponse.hasBody()) {
                logger.error("Failed to fetch user info: {}", userInfoResponse.getStatusCode());
                return ResponseEntity.status(userInfoResponse.getStatusCode()).body(Map.of(
                    "authenticated", false,
                    "error", "Failed to fetch user information"
                ));
            }
            
            // Extract and process user information
            Map<String, Object> userInfo = userInfoResponse.getBody();
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            if (name == null) {
                name = extractNameFromEmail(email);
            }
            
            // Generate or extract user ID
            String userId = (String) userInfo.get("sub");
            if (userId == null) {
                userId = generateUserId();
            }
            
            // Create response with user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", userId);
            userData.put("name", name);
            userData.put("email", email);
            userData.put("picture", userInfo.get("picture"));
            userData.put("authenticated", true);
            userData.put("role", "STUDENT"); // Default role
            userData.put("authType", "google");
            
            logger.info("Successful code exchange for user: {}", email);
            return ResponseEntity.ok(userData);
            
        } catch (Exception e) {
            logger.error("Error processing authorization code: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "authenticated", false,
                "error", "Error processing authentication: " + e.getMessage()
            ));
        }
    }

    /**
     * Common method to process OAuth authorization code
     */
    private ResponseEntity<?> processOAuthCode(String code, String state, OAuth2User principal) {
        // First check if user is already authenticated
        if (principal != null) {
            logger.info("User is already authenticated via OAuth2: {}", principal.getName());
            return getUser(principal);
        }
        
        // If no code provided but requested with code parameter, return error
        if (code == null) {
            logger.warn("No OAuth2 code provided in request");
            return ResponseEntity.badRequest().body(Map.of(
                "authenticated", false,
                "error", "No authorization code provided"
            ));
        }
        
        // If code is provided, exchange it for a token
        logger.info("Exchanging OAuth2 code for token");
        try {
            // Exchange code for token
            RestTemplate restTemplate = new RestTemplate();
            
            // Prepare token request
            HttpHeaders headers = new HttpHeaders();
            headers.add("Accept", "application/json");
            headers.add("Content-Type", "application/x-www-form-urlencoded");
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "authorization_code");
            body.add("code", code);
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("redirect_uri", "http://localhost:3000/login/oauth2/code/google");
            
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            
            // Exchange code for token
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                tokenUri,
                HttpMethod.POST,
                requestEntity,
                Map.class
            );
            
            if (!tokenResponse.getStatusCode().is2xxSuccessful() || !tokenResponse.hasBody()) {
                logger.error("Failed to exchange code for token: {}", tokenResponse.getStatusCode());
                return ResponseEntity.status(tokenResponse.getStatusCode()).body(Map.of(
                    "authenticated", false,
                    "error", "Failed to exchange authorization code for token"
                ));
            }
            
            // Extract access token
            Map<String, Object> tokenBody = tokenResponse.getBody();
            String accessToken = (String) tokenBody.get("access_token");
            
            if (accessToken == null) {
                logger.error("No access token found in response");
                return ResponseEntity.badRequest().body(Map.of(
                    "authenticated", false,
                    "error", "No access token received from authorization server"
                ));
            }
            
            // Use access token to fetch user info
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.add("Authorization", "Bearer " + accessToken);
            HttpEntity<?> userInfoRequest = new HttpEntity<>(userInfoHeaders);
            
            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                userInfoUri,
                HttpMethod.GET,
                userInfoRequest,
                Map.class
            );
            
            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || !userInfoResponse.hasBody()) {
                logger.error("Failed to fetch user info: {}", userInfoResponse.getStatusCode());
                return ResponseEntity.status(userInfoResponse.getStatusCode()).body(Map.of(
                    "authenticated", false,
                    "error", "Failed to fetch user information"
                ));
            }
            
            // Extract and transform user info
            Map<String, Object> userInfo = userInfoResponse.getBody();
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            if (name == null) {
                name = extractNameFromEmail(email);
            }
            
            // Generate or extract user ID
            String userId = (String) userInfo.get("sub");
            if (userId == null) {
                userId = generateUserId();
            }
            
            // Create user data response
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", userId);
            userData.put("name", name);
            userData.put("email", email);
            userData.put("picture", userInfo.get("picture"));
            userData.put("authenticated", true);
            userData.put("role", "STUDENT"); // Default role
            userData.put("authType", "google");
            userData.put("tokenData", tokenBody); // Include token data for frontend use
            
            logger.info("User authenticated via code: name={}, email={}, userId={}", name, email, userId);
            return ResponseEntity.ok(userData);
            
        } catch (Exception e) {
            logger.error("Error processing OAuth2 code: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "authenticated", false,
                "error", "Error processing authentication: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/user-old")
    public ResponseEntity<?> getUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            logger.warn("No OAuth2 user found in session");
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        
        logger.info("OAuth2 user logged in: {}", principal.getName());
        
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        if (name == null) {
            name = extractNameFromEmail(email);
        }
        
        // Generate a userId or fetch from database if user exists
        String userId = principal.getAttribute("sub");
        if (userId == null) {
            userId = generateUserId();
        }
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", userId);
        userData.put("name", name);
        userData.put("email", email);
        userData.put("picture", principal.getAttribute("picture"));
        userData.put("authenticated", true);
        userData.put("role", "STUDENT"); // Default role - could be replaced by a database lookup
        userData.put("authType", "google");
        
        logger.info("User data returned: name={}, email={}, userId={}", name, email, userId);
        return ResponseEntity.ok(userData);
    }
    
    @GetMapping("/login/success")
    public RedirectView loginSuccess(@AuthenticationPrincipal OAuth2User principal,
                                    @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient) {
        if (principal == null) {
            logger.warn("OAuth2 login success called but no principal found");
            return new RedirectView("/login?error=no_principal");
        }
        
        logger.info("OAuth2 login successful for user: {}", principal.getName());
        
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        if (name == null) {
            name = extractNameFromEmail(email);
        }
        
        // Add the token to the redirect URL
        String redirectUrl = oauthRedirectUri;
        if (!redirectUrl.contains("?")) {
            redirectUrl += "?";
        } else if (!redirectUrl.endsWith("?") && !redirectUrl.endsWith("&")) {
            redirectUrl += "&";
        }
        redirectUrl += "token=" + authorizedClient.getAccessToken().getTokenValue();
        
        logger.info("Redirecting authenticated user {} to frontend: {}", email, redirectUrl);
        return new RedirectView(redirectUrl);
    }
    
    @GetMapping("/debug")
    public ResponseEntity<?> debug(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        if (principal == null) {
            debugInfo.put("authenticated", false);
            debugInfo.put("error", "No OAuth2 principal found");
        } else {
            debugInfo.put("authenticated", true);
            debugInfo.put("principal", principal.getAttributes());
            debugInfo.put("serverPort", serverPort);
            debugInfo.put("oauthRedirectUri", oauthRedirectUri);
        }
        
        return ResponseEntity.ok(debugInfo);
    }
    
    @GetMapping("/debug/auth")
    public ResponseEntity<?> debugAuth(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        debugInfo.put("server_port", serverPort);
        debugInfo.put("timestamp", System.currentTimeMillis());
        debugInfo.put("oauth_redirect_uri", oauthRedirectUri);
        
        if (principal == null) {
            logger.warn("Debug: No OAuth2 user found in session");
            debugInfo.put("authenticated", false);
            debugInfo.put("error", "No OAuth2 principal found");
        } else {
            logger.info("Debug: OAuth2 user authenticated: {}", principal.getName());
            debugInfo.put("authenticated", true);
            debugInfo.put("name", principal.getAttribute("name"));
            debugInfo.put("email", principal.getAttribute("email"));
            debugInfo.put("picture", principal.getAttribute("picture"));
            debugInfo.put("sub", principal.getAttribute("sub"));
            
            // Add additional OAuth attributes but exclude sensitive data
            Map<String, Object> attributes = new HashMap<>(principal.getAttributes());
            attributes.remove("at_hash");
            debugInfo.put("attributes", attributes);
        }
        
        // Add OAuth configuration details
        debugInfo.put("redirect_uri_template", "/login/oauth2/code/{registrationId}");
        
        return ResponseEntity.ok(debugInfo);
    }
} 