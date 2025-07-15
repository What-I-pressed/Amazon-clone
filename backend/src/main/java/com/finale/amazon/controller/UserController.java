package com.finale.amazon.controller;

import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestParam String email) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(new UserDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateUserProfile(@RequestParam String email, @Valid @RequestBody UserDto userDto) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        User updatedUser = userService.updateUserProfile(
                user.getId(),
                userDto.getUsername(),
                userDto.getDescription(),
                userDto.getEmail()
        );

        return ResponseEntity.ok(new UserDto(updatedUser));
    }
}
