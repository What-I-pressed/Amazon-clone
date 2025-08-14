package com.finale.amazon.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.finale.amazon.dto.UserLoginRequestDto;
import com.finale.amazon.dto.UserRequestDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.dto.UserRegistrationDto;
import com.finale.amazon.dto.SellerRegistrationDto;
import com.finale.amazon.dto.ValidationErrorResponse;
import com.finale.amazon.entity.User;
import com.finale.amazon.entity.Role;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.UserService;
import com.finale.amazon.service.ValidationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ValidationService validationService;

    // @Autowired
    // private TokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/send-verification-email")
    public ResponseEntity<String> sendVerificationEmail(@RequestBody UserLoginRequestDto user) {
        try{

            User u = userService.getUserByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            

            String token = jwtUtil.generateToken(u);
            
            // VerificationToken verificationToken = new VerificationToken();
            // verificationToken.setToken(token);
            // verificationToken.setUser(u);
            // verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // 24 hours expiry
            // tokenRepository.save(verificationToken);
            
            String url = "http://localhost:8080/api/auth/verify?token=" + token;
            String subject = "Please verify your email";
            String body = "Click the link to verify your account: " + url;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            return ResponseEntity.ok("Verification email sent");
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error sending verification email: " + e.getMessage());
        }
    }


    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        
        try{
            // VerificationToken verificationToken = tokenRepository.findByToken(token)
            //     .orElseThrow(() -> new RuntimeException("Token not found"));
            if (jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(400).body("Token expired");
            }
            String email = jwtUtil.extractSubject(token);
            User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setEmailVerified(true);
            userService.updateUser(user.getId(), user);
            return ResponseEntity.ok("Email verified");
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error verifying email: " + e.getMessage());
        }
    }
    

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginRequestDto user, 
                                       @RequestParam(defaultValue = "normal") String tokenType) {
        try{
            User u = userService.authenticateUser(user.getEmail(), user.getPassword())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
            
            String token;
            switch (tokenType.toLowerCase()) {
                case "short":
                    token = jwtUtil.generateShortToken(u);
                    break;
                case "long":
                    token = jwtUtil.generateLongToken(u);
                    break;
                default:
                    token = jwtUtil.generateToken(u);
                    break;
            }
            
            return ResponseEntity.ok(token);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error logging in: " + e.getMessage());
        }
    }

    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto userDto) {
        try {
            // Custom validation
            List<String> validationErrors = validationService.validateUserRegistration(userDto);
            if (!validationErrors.isEmpty()) {
                ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                    "Registration validation failed", validationErrors);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create user with USER role
            UserRequestDto userRequest = new UserRequestDto();
            userRequest.setUsername(userDto.getUsername());
            userRequest.setDescription(userDto.getDescription());
            userRequest.setEmail(userDto.getEmail());
            userRequest.setPassword(userDto.getPassword());
            userRequest.setRoleName("CUSTOMER");

            User u = userService.createUser(userRequest);
            String token = jwtUtil.generateToken(u);
            return ResponseEntity.ok(token);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error registering user: " + e.getMessage());
        }
    }

    @PostMapping("/register/seller")
    public ResponseEntity<?> registerSeller(@Valid @RequestBody SellerRegistrationDto sellerDto) {
        try {
            // Custom validation
            List<String> validationErrors = validationService.validateSellerRegistration(sellerDto);
            if (!validationErrors.isEmpty()) {
                ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                    "Seller registration validation failed", validationErrors);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create user with SELLER role
            UserRequestDto userRequest = new UserRequestDto();
            userRequest.setUsername(sellerDto.getUsername());
            userRequest.setDescription(sellerDto.getDescription());
            userRequest.setEmail(sellerDto.getEmail());
            userRequest.setPassword(sellerDto.getPassword());
            userRequest.setRoleName("SELLER");

            User u = userService.createUser(userRequest);
            String token = jwtUtil.generateToken(u);
            return ResponseEntity.ok(token);
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error registering seller: " + e.getMessage());
        }
    }

    // Keep the old register endpoint for backward compatibility
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
        @RequestHeader(value = "Authorization", required = true) String authHeader, 
        HttpServletRequest request) {
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
            
            Optional<User> userOptional = userService.getUserByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(401).body(null);
            }
            
            User user = userOptional.get();
            return ResponseEntity.ok(new UserDto(user));
        } catch (Exception e) {
            System.out.println("Error in /me endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(null);
        }
    }

    
    
}
