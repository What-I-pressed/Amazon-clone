package com.finale.amazon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finale.amazon.service.UserService;
import com.finale.amazon.service.ReviewService;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@Tag(name = "Admin Controller", description = "Адміністраторські операції: блокування користувачів, видалення оглядів і продуктів")
public class AdminController {
    
    @Autowired
    private UserService userService;
    @Autowired
    private ReviewService reviewService;
    @Autowired
    private ProductService productService;
    @Autowired
    private JwtUtil jwtUtil;

    private boolean validateAdminToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractSubject(token);
            if (email == null) {
                return false;
            }
            User user = userService.getUserByEmail(email).orElse(null);
            if (user == null || user.isBlocked()) {
                return false;
            }
            return userService.hasRole(user.getId(), "ADMIN");
        } catch (Exception e) {
            return false;
        }
    }

    @Operation(summary = "Заблокувати користувача за ID")
    @PostMapping("/users/block/{id}")
    public ResponseEntity<String> blockUser(
            @PathVariable Long id,
            @Parameter(description = "JWT токен адміністратора", required = true)
            @RequestHeader(value = "Authorization") String authHeader,
            HttpServletRequest request) {

        if(!validateAdminToken(authHeader)) {
            return ResponseEntity.status(401).body("Unauthorized: Admin access required");
        }
        try {
            User blockedUser = userService.blockUser(id);
            return ResponseEntity.ok("User " + blockedUser.getUsername() + " has been blocked");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error blocking user: " + e.getMessage());
        }
    }

    @Operation(summary = "Розблокувати користувача за ID")
    @PostMapping("/users/unblock/{id}")
    public ResponseEntity<String> unblockUser(
            @PathVariable Long id,
            @Parameter(description = "JWT токен адміністратора", required = true)
            @RequestHeader(value = "Authorization") String authHeader,
            HttpServletRequest request) {

        if(!validateAdminToken(authHeader)) {
            return ResponseEntity.status(401).body("Unauthorized: Admin access required");
        }
        try {
            User unblockedUser = userService.unblockUser(id);
            return ResponseEntity.ok("User " + unblockedUser.getUsername() + " has been unblocked");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error unblocking user: " + e.getMessage());
        }
    }

    @Operation(summary = "Видалити відгук за ID")
    @PostMapping("/reviews/delete/{id}")
    public ResponseEntity<String> deleteReview(
            @PathVariable long id,
            @Parameter(description = "JWT токен адміністратора", required = true)
            @RequestHeader(value = "Authorization") String authHeader,
            HttpServletRequest request) {

        if(!validateAdminToken(authHeader)) {
            return ResponseEntity.status(401).body("Unauthorized: Admin access required");
        }
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok("Review deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error deleting review: " + e.getMessage());
        }
    }

    @Operation(summary = "Видалити продукт за ID")
    @PostMapping("/products/delete/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable long id,
            @Parameter(description = "JWT токен адміністратора", required = true)
            @RequestHeader(value = "Authorization") String authHeader,
            HttpServletRequest request) {

        if(!validateAdminToken(authHeader)) {
            return ResponseEntity.status(401).body("Unauthorized: Admin access required");
        }
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error deleting product: " + e.getMessage());
        }
    }
}
