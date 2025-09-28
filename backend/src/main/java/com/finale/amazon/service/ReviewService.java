package com.finale.amazon.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.dto.ReviewCreationDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.dto.ReviewReplyDto;
import com.finale.amazon.dto.ReviewUpdateDto;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.Review;
import com.finale.amazon.entity.User;

import java.util.stream.Collectors;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ProductService productService;
    @Autowired
    private ProductRepository productRepository;

    // public Review createReview(ReviewDto review) {
    // Review reviewEntity = new Review();
    // reviewEntity.setDescription(review.getDescription());
    // reviewEntity.setDate(review.getDate());
    // reviewEntity.setUser(userRepository.findById(review.getUserId()).orElseThrow(() -> new RuntimeException("User not found")));
    // reviewEntity.setProduct(productRepository.findById(review.getProductId()).orElseThrow(() -> new RuntimeException("Product not found")));
    // if (review.getParentId() != null) {
    //     reviewEntity.setParent(reviewRepository.findById(review.getParentId()).orElseThrow(() -> new RuntimeException("Parent review not found")));
    // }
    // return reviewRepository.save(reviewEntity);
    // }

    @Transactional
    public Review createReview(User user, ReviewCreationDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setDescription(dto.getDescription());
        review.setStars(dto.getStars());
        review.setDate(dto.getDate());
        review.setUser(user);
        review.setProduct(product);
        review.setParent(null);
        Review saved = reviewRepository.save(review);
        productService.updateAvgRating(product);
        return saved;
    }

    public Review replyReview(User user, ReviewReplyDto dto) {
        Review parent = reviewRepository.findById(dto.getParentId())
                .orElseThrow(() -> new RuntimeException("Parent review not found"));

        // Check if this is a reply to a reply (nested replies are not allowed)
        if (parent.getParent() != null) {
            throw new RuntimeException("Cannot reply to a reply. Please reply to the main review instead.");
        }

        if (user != null && user.getRole() != null && "SELLER".equalsIgnoreCase(user.getRole().getName())) {
            Product parentProduct = parent.getProduct();
            if (parentProduct == null || parentProduct.getSeller() == null || parentProduct.getSeller().getId() != user.getId()) {
                throw new RuntimeException("Sellers can only reply to reviews on their own products");
            }
        }

        Review reply = new Review();
        reply.setDescription(dto.getDescription());
        reply.setDate(LocalDateTime.now());
        reply.setStars(1); // Default rating for replies
        reply.setUser(user);
        reply.setProduct(parent.getProduct());
        reply.setParent(parent);

        // Save the reply
        Review savedReply = reviewRepository.save(reply);

        // Update the parent's replies list
        if (parent.getReplies() == null) {
            parent.setReplies(new ArrayList<>());
        }
        parent.getReplies().add(savedReply);
        reviewRepository.save(parent);

        return savedReply;
    }

    public void deleteReview(Long id) {
        Review review = reviewRepository.getById(id);
        reviewRepository.deleteById(id);
        productService.updateAvgRating(review.getProduct());
    }
    
    public Optional<Review> getReviewById(Long id) {
            return reviewRepository.findById(id);
    }

    public List<ReviewDto> getAllReviewsByProduct(Long productId) {
        // Fetch all reviews for the product (both top-level and replies)
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                     .map(ReviewDto::new)
                     .collect(Collectors.toList());
    }

    public List<ReviewDto> getRepliesForReview(Long reviewId) {
        // Fetch all replies for a specific review
        List<Review> replies = reviewRepository.findByParentId(reviewId);
        return replies.stream()
                     .map(ReviewDto::new)
                     .collect(Collectors.toList());
    }
    
    public Review updateReview(User user, Long reviewId, ReviewUpdateDto dto) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (review.getUser().getId() != user.getId()) {
            throw new RuntimeException("You are not authorized to edit this review");
        }
        if (dto.getDescription() != null) {
            review.setDescription(dto.getDescription());
        }

        if (dto.getStars() != null) {
            review.setStars(dto.getStars());
        }

        Review r = reviewRepository.save(review);
        productService.updateAvgRating(review.getProduct());
        return r;
    }

}