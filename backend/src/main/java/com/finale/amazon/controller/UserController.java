package com.finale.amazon.controller;

import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
@Tag(name = "User Controller", description = "Контролер для роботи з користувачами")
public class UserController {

    @Autowired
    private UserService userService;

    @Operation(summary = "Отримати профіль користувача")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успішно отримано профіль"),
            @ApiResponse(responseCode = "404", description = "Користувача не знайдено")
    })
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(
            @Parameter(description = "Email користувача", required = true)
            @RequestParam String email) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(new UserDto(user));
    }

    @Operation(summary = "Оновити профіль користувача")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профіль успішно оновлено"),
            @ApiResponse(responseCode = "404", description = "Користувача не знайдено"),
            @ApiResponse(responseCode = "400", description = "Некоректні дані")
    })
    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateUserProfile(
            @Parameter(description = "Email користувача", required = true)
            @RequestParam String email,
            @Parameter(description = "DTO з даними користувача", required = true)
            @Valid @RequestBody UserDto userDto) {
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
