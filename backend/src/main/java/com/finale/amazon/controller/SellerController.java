package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.entity.Product;
import com.finale.amazon.service.ProductService;
import com.finale.amazon.service.SellerService;
import com.finale.amazon.service.UserService;
import com.finale.amazon.security.JwtUtil;

import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

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
        private SellerService sellerService;

        @Autowired
        private UserService userService;

        @Autowired
        private ProductService productService;

        @Autowired
        private JwtUtil jwtUtil;

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
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Seller not found"));

                if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
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

        @Operation(summary = "Отримати відгуки продавця", description = "Повертає всі відгуки для поточного продавця")
        @GetMapping("/profile/reviews")
        public ResponseEntity<List<ReviewDto>> getSellersReviews(Authentication authentication) {
                String email = authentication.getName();
                User seller = userService.getUserByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Seller not found"));

                return ResponseEntity.ok(
                                sellerService.getSellersReviews(seller).stream()
                                                .map(ReviewDto::new)
                                                .toList());
        }

        @Operation(summary = "Отримати публічний профіль продавця за slug", description = "Повертає публічний профіль продавця за унікальним slug")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Профіль успішно отримано"),
                        @ApiResponse(responseCode = "404", description = "Продавця не знайдено"),
                        @ApiResponse(responseCode = "400", description = "Користувач не є продавцем")
        })
        @GetMapping("/slug/{slug}")
        public ResponseEntity<UserDto> getPublicSellerProfileBySlug(
                        @Parameter(description = "Slug продавця") @PathVariable String slug) {
                User seller = userService.findSellerBySlug(slug);
                return ResponseEntity.ok(new UserDto(seller));
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
                        @RequestBody UserDto updateRequest) {
                String email = authentication.getName();
                User seller = userService.getUserByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Seller not found"));

                if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
                }

                User updated = userService.updateSellerProfile(seller, updateRequest);
                return ResponseEntity.ok(new UserDto(updated));
        }

        @Operation(summary = "Отримати товари продавця", description = "Повертає список товарів поточного продавця з пагінацією")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Товари успішно отримано"),
                        @ApiResponse(responseCode = "404", description = "Продавця не знайдено"),
                        @ApiResponse(responseCode = "400", description = "Користувач не є продавцем")
        })
        @GetMapping("/profile/products/{page}")
        public ResponseEntity<Map<String, Object>> getSellerProducts(
                        Authentication authentication,
                        @Parameter(description = "Номер сторінки") @PathVariable int page,
                        @Parameter(description = "ID продавця (необов'язково, за замовчуванням з токена)") @RequestParam(required = false) Long sellerId,
                        @Parameter(description = "Розмір сторінки") @RequestParam(defaultValue = "24") int size) {

                System.out.println("[SellerController] getSellerProducts called");
                System.out.println("[SellerController] Authentication: " + authentication);
                System.out.println("[SellerController] Page: " + page + ", SellerId: " + sellerId + ", Size: " + size);

                if (authentication == null) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
                }

                // Extract JWT token from request header
                String authHeader = ((HttpServletRequest) ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest()).getHeader("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No valid token found");
                }

                String token = authHeader.substring(7);
                String role = jwtUtil.extractRole(token);
                Long tokenUserId = jwtUtil.extractUserId(token);

                System.out.println("[SellerController] Token role: " + role);
                System.out.println("[SellerController] Token userId: " + tokenUserId);
                System.out.println("[SellerController] Requested sellerId: " + sellerId);

                if (!"SELLER".equalsIgnoreCase(role)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
                }

                Long effectiveSellerId = (sellerId != null) ? sellerId : tokenUserId;
                if (!tokenUserId.equals(effectiveSellerId)) {
                        System.out.println("[SellerController] Access denied: tokenUserId=" + tokenUserId + " != sellerId=" + effectiveSellerId);
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
                }
                System.out.println("[SellerController] Authentication successful");

                PageRequest pageRequest = PageRequest.of(page, size);
                Page<Product> productsPage = productService.getProductsByVendor(effectiveSellerId, pageRequest);

                List<ProductDto> products = productsPage.getContent().stream()
                                .map(ProductDto::new)
                                .toList();

                Map<String, Object> response = new HashMap<>();
                response.put("content", products);
                response.put("totalElements", productsPage.getTotalElements());
                response.put("totalPages", productsPage.getTotalPages());
                response.put("currentPage", page);
                response.put("size", size);

                return ResponseEntity.ok(response);
        }

}
