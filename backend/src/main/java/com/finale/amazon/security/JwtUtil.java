package com.finale.amazon.controller;

import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractSubject(token);

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new UserDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserDto userDto) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractSubject(token);

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        try {
            userService.updateUserProfile(
                    user.getId(),
                    userDto.getUsername(),
                    userDto.getDescription(),
                    userDto.getEmail()
            );
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
