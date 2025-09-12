package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.ProductService;
import com.finale.amazon.service.SellerService;
import com.finale.amazon.service.UserService;

import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
public class SellerController {

    @Autowired
    private UserService userService;

    @Autowired
    private SellerService sellerService;

    @Autowired
    private ProductService productService;


    @GetMapping("/profile")
    public ResponseEntity<UserDto> getSellerProfile(Authentication authentication) {
        String email = authentication.getName(); 
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        return ResponseEntity.ok(new UserDto(seller));
    }

    @GetMapping("/profile/stats")
    public ResponseEntity<SellerStatsDto> getSellerStats(Authentication authentication) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        return ResponseEntity.ok(sellerService.getSellerStats(seller));
    }

    @GetMapping("/profile/reviews")
    public ResponseEntity<List<ReviewDto>> getSellersReviews(Authentication authentication) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        return ResponseEntity.ok(
                sellerService.getSellersReviews(seller).stream()
                        .map(ReviewDto::new)
                        .toList()
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateSellerProfile(
            Authentication authentication,
            @RequestBody UserDto updateRequest
    ) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
    
        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }
    
        User updated = userService.updateSellerProfile(seller, updateRequest);
        return ResponseEntity.ok(new UserDto(updated));
    }
    
    
}
