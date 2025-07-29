package com.mycompany.fstudymate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class LoginController {
    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Value("${app.oauth.redirectUri:http://localhost:3000/dashboard}")
    private String oauthRedirectUri;

    @GetMapping("/login")
    public String login(Model model) {
        logger.info("Accessing regular login page");
        model.addAttribute("serverPort", serverPort);
        return "login";
    }
    
    @GetMapping("/google-login")
    public String googleLogin(Model model) {
        logger.info("Accessing Google login page");
        model.addAttribute("serverPort", serverPort);
        return "google-login";
    }
    
    @GetMapping("/google")
    public RedirectView redirectToGoogleAuth() {
        logger.info("Direct redirect to Google auth");
        return new RedirectView("/oauth2/authorization/google");
    }
    
    @GetMapping("/login/oauth2/code/google")
    public RedirectView handleOAuthCallback(
            @AuthenticationPrincipal OAuth2User principal,
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient
    ) {
        if (principal == null) {
            logger.error("OAuth2 callback received but no authenticated principal found");
            return new RedirectView(frontendUrl + "/login?error=authentication_failed");
        }
        
        logger.info("OAuth2 callback processing for: {}", principal.getName());
        String token = authorizedClient.getAccessToken().getTokenValue();
        
        // Extract user details
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");
        
        // Build redirect URL with token and basic user info
        StringBuilder redirectUrl = new StringBuilder(oauthRedirectUri);
        if (!oauthRedirectUri.contains("?")) {
            redirectUrl.append("?");
        } else if (!oauthRedirectUri.endsWith("?") && !oauthRedirectUri.endsWith("&")) {
            redirectUrl.append("&");
        }
        
        // Add token and basic user info (safely URL encoded)
        redirectUrl.append("token=").append(token);
        redirectUrl.append("&email=").append(java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8));
        redirectUrl.append("&name=").append(java.net.URLEncoder.encode(name != null ? name : "", java.nio.charset.StandardCharsets.UTF_8));
        if (picture != null) {
            redirectUrl.append("&picture=").append(java.net.URLEncoder.encode(picture, java.nio.charset.StandardCharsets.UTF_8));
        }
        
        logger.info("Redirecting authenticated user to frontend with token");
        return new RedirectView(redirectUrl.toString());
    }
    
    @GetMapping("/")
    public String root(@AuthenticationPrincipal OAuth2User principal) {
        if (principal != null) {
            logger.info("Authenticated user accessing root: {}", principal.getName());
            return "redirect:/dashboard";
        }
        logger.info("Unauthenticated user accessing root, redirecting to login page");
        return "redirect:/login";
    }
    
    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal OAuth2User principal, Model model) {
        if (principal == null) {
            logger.info("Unauthenticated user trying to access dashboard, redirecting to login");
            return "redirect:/login";
        }
        
        String name = principal.getAttribute("name");
        String email = principal.getAttribute("email");
        
        model.addAttribute("name", name != null ? name : "User");
        model.addAttribute("email", email);
        
        logger.info("User {} accessing dashboard", email);
        return "redirect:" + frontendUrl + "/dashboard";
    }
} 