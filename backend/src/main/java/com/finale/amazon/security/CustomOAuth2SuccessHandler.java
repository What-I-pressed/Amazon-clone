package com.finale.amazon.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.finale.amazon.entity.User;
import com.finale.amazon.service.UserService;

import java.io.IOException;
import java.util.Date;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String jwtSecret;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        System.out.println("Boba");
        User user = userService.getUserByEmail(email).orElse(userService.createByEmail(email));
        String token = jwtUtil.generateToken(user);
        String redirectUrl = frontendUrl + "/oauth2/success?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
