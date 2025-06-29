package com.finale.amazon.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finale.amazon.dto.UserDto;
import com.finale.amazon.dto.UserRequestDto;
import com.finale.amazon.entity.Role;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.roleRepository;
import com.finale.amazon.service.userService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class userController {

    @Autowired
    private userService userService;

    @Autowired
    private roleRepository roleRepository;

    @GetMapping("login")
    public ResponseEntity<UserDto> login(@RequestParam String gmail, @RequestParam String password) {
        try {
            User user = userService.authenticateUser(gmail, password).get();
            return ResponseEntity.ok(new UserDto(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(null);
        }
    }

    @PostMapping("register")
    public ResponseEntity<String> register(@RequestBody UserRequestDto userRequestDto) {
        try{
            User user = new User();
            user.setName(userRequestDto.getName());
            user.setEmail(userRequestDto.getEmail());
            user.setPassword(userRequestDto.getPassword());
            user.setDescription(userRequestDto.getDescription());

            Role role = roleRepository.findByName(userRequestDto.getRoleName()).orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
            userService.createUser(user);
            return ResponseEntity.ok("User registered successfully");
        }
        catch (Exception e) {
            return ResponseEntity.status(400).body("Error registering user: " + e.getMessage());
        }
    }

}
