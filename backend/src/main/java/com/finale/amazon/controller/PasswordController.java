package com.finale.amazon.controller;

import com.finale.amazon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // React фронтенд
public class PasswordController {

    @Autowired
    private UserService userService;

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");
        String confirmPassword = payload.get("confirmPassword");

        if (email == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body("All fields are required");
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        if (userService.findByEmail(email) == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        userService.updatePassword(email, newPassword);
        return ResponseEntity.ok("Password successfully updated");
    }
}

