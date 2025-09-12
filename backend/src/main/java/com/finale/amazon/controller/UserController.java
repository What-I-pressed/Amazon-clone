package com.finale.amazon.controller;

import com.finale.amazon.dto.UserDto;
import com.finale.amazon.dto.UserEditRequestDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.UserService;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private final String dirPath = "uploads/pictures/";

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestParam String token) {
        User user = userService.getUserById(jwtUtil.extractUserId(token));
        return ResponseEntity.ok(new UserDto(user));
    }

    @PutMapping(value = "/profile")
    public ResponseEntity<UserDto> updateUserProfile(@RequestParam String token,@Valid @RequestBody UserEditRequestDto userDto) throws IOException {
        User updatedUser = userService.updateUserProfile(
                jwtUtil.extractUserId(token),
                userDto.getUsername(),
                userDto.getDescription()
        );

        return ResponseEntity.ok(new UserDto(updatedUser));
    }

    @PutMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> updateUserProfile(@RequestParam String token,@RequestPart("file") MultipartFile file) throws IOException {
        User updatedUser = userService.updateUserProfile(
                jwtUtil.extractUserId(token),
                file
        );

        return ResponseEntity.ok(new UserDto(updatedUser));
    }
}

