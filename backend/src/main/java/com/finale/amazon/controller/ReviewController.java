package com.finale.amazon.controller;

import com.finale.amazon.dto.ReviewCreationDto;
import com.finale.amazon.dto.ReviewReplyDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.Review;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.ReviewService;
import com.finale.amazon.service.UserService;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.ReviewRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Reviews Controller", description = "Контролер для роботи з відгуками та відповідями")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final JwtUtil jwtUtil;

//     @Operation(summary = "Створити відгук або відповідь", 
//            description = "Створює новий відгук для продукту або відповідь на існуючий відгук (якщо задано parentId)")
// @PostMapping("/create")
// public ResponseEntity<?> createReview(@RequestParam String token, @RequestBody ReviewDto reviewDto) {
//     try {
//         // Перевірка токена
//         if (jwtUtil.isTokenExpired(token)) {
//             return ResponseEntity.status(400).body("Token is expired");
//         }
//         // Отримуємо користувача з токена
//         Long userId = jwtUtil.extractUserId(token);
//         User user = userService.getUserById(userId);
//         if (user == null) {
//             return ResponseEntity.status(403).body("User not found");
//         }
//         // Перевірка продукту
//         var productOpt = productRepository.findById(reviewDto.getProductId());
//         if (productOpt.isEmpty()) {
//             return ResponseEntity.status(403).body("Product not found");
//         }
//         // Створюємо review
//         Review reviewEntity = new Review();
//         reviewEntity.setDescription(reviewDto.getDescription());
//         reviewEntity.setStars(reviewDto.getStars());
//         reviewEntity.setDate(reviewDto.getDate());
//         reviewEntity.setUser(user);
//         reviewEntity.setProduct(productOpt.get());
//         // Додаємо parent лише якщо це reply
//         if (reviewDto.getParentId() != null && reviewDto.getParentId() != 0) {
//             var parentOpt = reviewRepository.findById(reviewDto.getParentId());
//             if (parentOpt.isEmpty()) {
//                 return ResponseEntity.status(403).body("Parent review not found");
//             }
//             reviewEntity.setParent(parentOpt.get());
//         } else {
//             reviewEntity.setParent(null); // звичайний відгук
//         }
//         Review savedReview = reviewRepository.save(reviewEntity);
//         return ResponseEntity.ok(new ReviewDto(savedReview));
//     } catch (Exception e) {
//         e.printStackTrace();
//         return ResponseEntity.status(500).body("Internal server error");
//     }
// }


    @Operation(summary = "Створити відгук", description = "Створює новий відгук для продукту. Не можна створювати parentId, якщо це звичайний відгук")
    @PostMapping("/create")
    public ResponseEntity<?> createReview(@RequestParam String token,@RequestBody ReviewCreationDto dto) {
        if (jwtUtil.isTokenExpired(token)) 
            return ResponseEntity.status(400).body("Token is expired");

        User user = userService.getUserById(jwtUtil.extractUserId(token));
        Review review = reviewService.createReview(user, dto);
        return ResponseEntity.ok(new ReviewDto(review));
    }

    @Operation(summary = "Створити відповідь на відгук", description = "Створює відповідь на існуючий відгук. Потрібно вказати parentReviewId")
    @PostMapping("/reply")
    public ResponseEntity<?> replyReview(@RequestParam String token, @RequestBody ReviewReplyDto dto) {
        if (jwtUtil.isTokenExpired(token)) 
            return ResponseEntity.status(400).body("Token is expired");

        User user = userService.getUserById(jwtUtil.extractUserId(token));
        if (user == null) {
            return ResponseEntity.status(403).body("User not found");
        }

        try {
            Review reply = reviewService.replyReview(user, dto);
            return ResponseEntity.ok(new ReviewDto(reply));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }


    @Operation(summary = "Видалити відгук", description = "Видаляє відгук або відповідь на відгук. Доступно тільки автору, SELLER або ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(
            @RequestParam String token,
            @Parameter(description = "ID відгуку") @PathVariable Long id
    ) {
        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(400).body("Token expired");
        }

        String role = jwtUtil.extractRole(token);
        Long userId = jwtUtil.extractUserId(token);

        Optional<Review> reviewOpt = reviewService.getReviewById(id);
        if (reviewOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Review review = reviewOpt.get();
        if (!(review.getUser().getId() == userId) &&
            !"ADMIN".equals(role) && !"SELLER".equals(role)) {
            return ResponseEntity.status(403).body("You are not authorized to delete this review");
        }

        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Отримати відгук за ID", description = "Повертає відгук разом з інформацією про користувача та батьківський/дочірні відгуки")
    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(
            @RequestParam String token,
            @Parameter(description = "ID відгуку") @PathVariable Long id
    ) {
        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(400).body("Token expired");
        }

        Optional<Review> reviewOpt = reviewService.getReviewById(id);
        return reviewOpt.map(review -> ResponseEntity.ok(new ReviewDto(review)))
                        .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
