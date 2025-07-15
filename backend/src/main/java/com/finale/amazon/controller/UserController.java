package com.finale.amazon.controller;

import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") 
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserDto userDto
    ) {
        String email = extractEmailFromToken(authHeader);
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userService.updateUserProfile(
                user.getId(),
                userDto.getUsername(),
                userDto.getDescription(),
                userDto.getEmail()
        );

        return ResponseEntity.ok().build();
    }

    private String extractEmailFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing Authorization header");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractSubject(token); 
    }
}
