package com.finale.amazon.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.UserRegistrationDto;
import com.finale.amazon.dto.SellerRegistrationDto;
import com.finale.amazon.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class ValidationService {

    @Autowired
    private UserRepository userRepository;

    public List<String> validateUserRegistration(UserRegistrationDto dto) {
        List<String> errors = new ArrayList<>();
        
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            errors.add("Passwords do not match");
        }
        
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            errors.add("Email already exists");
        }
        
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            errors.add("Username already exists");
        }
        
        return errors;
    }

    public List<String> validateSellerRegistration(SellerRegistrationDto dto) {
        List<String> errors = new ArrayList<>();
        
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            errors.add("Passwords do not match");
        }
        
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            errors.add("Email already exists");
        }
        
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            errors.add("Username already exists");
        }
        
        return errors;
    }
} 