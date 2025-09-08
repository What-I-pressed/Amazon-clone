package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.SellerService;
import com.finale.amazon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
@Tag(name = "Seller Controller", description = "Контролер для роботи з продавцями")
public class SellerController {

    @Autowired
    private UserService userService;

    @Autowired
    private SellerService sellerService;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Отримати профіль продавця")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профіль успішно отримано"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено"),
            @ApiResponse(responseCode = "400", description = "Користувач не є продавцем")
    })
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

    @Operation(summary = "Отримати статистику продавця")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Статистика успішно отримана"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено")
    })
    @GetMapping("/profile/stats")
    public ResponseEntity<SellerStatsDto> getSellerStats(Authentication authentication) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        return ResponseEntity.ok(sellerService.getSellerStats(seller));
    }

    @Operation(summary = "Отримати продукти продавця з фільтрацією та сортуванням")
    @GetMapping("/profile/products")
    public ResponseEntity<List<ProductDto>> getSellerProducts(
            Authentication authentication,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction
    ) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        List<ProductDto> products = sellerService.getFilteredSellerProducts(
                seller.getId(), name, categoryId, sortBy, direction
        );

        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Отримати відгуки продавця")
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

    @Operation(summary = "Оновити профіль продавця")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профіль успішно оновлено"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено"),
            @ApiResponse(responseCode = "400", description = "Користувач не є продавцем")
    })
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
