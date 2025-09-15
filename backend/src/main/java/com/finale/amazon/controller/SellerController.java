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

import io.swagger.v3.oas.annotations.Operation;
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
    private ProductService productService;


    @Operation(summary = "Отримати профіль продавця", description = "Повертає профіль поточного користувача, якщо він має роль SELLER")
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

    @Operation(summary = "Отримати публічний профіль продавця", description = "Повертає публічний профіль продавця за ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профіль успішно отримано"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено"),
            @ApiResponse(responseCode = "400", description = "Користувач не є продавцем")
    })
    @GetMapping("/public/{sellerId}")
    public ResponseEntity<UserDto> getPublicSellerProfile(
            @Parameter(description = "ID продавця") @PathVariable Long sellerId) {
        User seller = userService.getUserById(sellerId);

        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        return ResponseEntity.ok(new UserDto(seller));
    }

    @Operation(summary = "Отримати публічний профіль продавця за slug", description = "Повертає публічний профіль продавця за унікальним slug")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профіль успішно отримано"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено"),
            @ApiResponse(responseCode = "400", description = "Користувач не є продавцем")
    })
    @GetMapping("/{slug:[a-zA-Z0-9]{6,8}}")
    public ResponseEntity<UserDto> getPublicSellerProfileBySlug(
            @Parameter(description = "Slug продавця") @PathVariable String slug) {
        User seller = userService.getUserBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (seller.getRole() == null || !"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        return ResponseEntity.ok(new UserDto(seller));
    }

   @Operation(summary = "Отримати статистику продавця", description = "Повертає статистику продажів і продуктів поточного продавця")
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

        @Operation(summary = "Отримати продукти продавця", description = "Повертає список продуктів поточного продавця з можливістю фільтрації та сортування")
        @GetMapping("/profile/products/{page}")
        public ResponseEntity<Page<ProductDto>> getSellerProducts(
                @PathVariable int page,
                @RequestParam(defaultValue = "24") int size,
                @RequestParam(required = true) Long sellerId,
                @RequestParam(required = false) String name,
                @RequestParam(required = false) Long categoryId,
                @RequestParam(required = false) Double lowerPriceBound,
                @RequestParam(required = false) Double upperPriceBound,
                @Parameter(description = "Map of characteristics, e.g. ?color=red&size=XL")
                @RequestParam(required = false) Map<String, String> characteristics) {

                Map<String, String> chars = new HashMap<>(characteristics != null ? characteristics : Map.of());
                chars.remove("name");
                chars.remove("categoryId");
                chars.remove("lowerPriceBound");
                chars.remove("upperPriceBound");
                chars.remove("page");
                chars.remove("size");
                chars.remove("sort");
                chars.remove("sellerId");

                Page<ProductDto> productsPage = productService.getProductsPage(
                        PageRequest.of(page, size), name, categoryId, lowerPriceBound, upperPriceBound, chars);
                return ResponseEntity.ok(productsPage);
        }

        @Operation(summary = "Отримати публічні продукти продавця", description = "Повертає сторінку продуктів продавця за ID")
        @GetMapping("/public/{sellerId}/products/{page}")
        public ResponseEntity<Page<ProductDto>> getPublicSellerProducts(
                @Parameter(description = "ID продавця") @PathVariable Long sellerId,
                @Parameter(description = "Номер сторінки") @PathVariable int page,
                @Parameter(description = "Розмір сторінки") @RequestParam(defaultValue = "24") int size
        ) {
                Page<ProductDto> productsPage = productService.getProductsBySeller(
                        PageRequest.of(page, size), null, null, null, null, new HashMap<>(), sellerId
                );
                return ResponseEntity.ok(productsPage);
        }

    @Operation(summary = "Отримати відгуки продавця", description = "Повертає всі відгуки для поточного продавця")
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

    @Operation(summary = "Оновити профіль продавця", description = "Оновлює дані профілю продавця")
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
