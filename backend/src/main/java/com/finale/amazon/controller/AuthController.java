package com.finale.amazon.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import com.finale.amazon.dto.UserLoginRequestDto;
import com.finale.amazon.dto.UserRequestDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserLoginRequestDto user) {
        try{
            User u = userService.authenticateUser(user.getEmail(), user.getPassword()).orElseThrow(() -> new RuntimeException("User not found"));
            String token = jwtUtil.generateToken(u);
            return ResponseEntity.ok(token);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error logging in: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserRequestDto user) {
        try{
            User u = userService.createUser(user);
            String token = jwtUtil.generateToken(u);
            return ResponseEntity.ok(token);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error registering user: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserDto> getCurrentUser(
        @Parameter(description = "JWT Bearer token", in = ParameterIn.HEADER, name = "Authorization", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader(value = "Authorization", required = false) String authHeader, 
        HttpServletRequest request) {
        // Debug logging
        System.out.println("=== DEBUG INFO ===");
        System.out.println("Authorization header: " + authHeader);
        System.out.println("All headers:");
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            System.out.println(headerName + ": " + headerValue);
        }
        System.out.println("==================");
        
        if (authHeader == null || authHeader.isEmpty()) {
            return ResponseEntity.status(401).body(null);
        }
        
        try {
            if (!authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            System.out.println("=== TOKEN DEBUG ===");
            System.out.println("Token: " + token);
            System.out.println("Subject (email): " + jwtUtil.extractSubject(token));
            System.out.println("Username claim: " + jwtUtil.extractUsername(token));
            System.out.println("User ID: " + jwtUtil.extractUserId(token));
            System.out.println("==================");
            
            String email = jwtUtil.extractSubject(token);
            
            User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(new UserDto(user));
        } catch (Exception e) {
            System.out.println("Error in /me endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(null);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth controller is working!");
    }
}
