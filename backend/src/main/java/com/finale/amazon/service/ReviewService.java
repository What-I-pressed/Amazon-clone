package com.finale.amazon.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.repository.ReviewRepository;
import com.finale.amazon.repository.UserRepository;
import com.finale.amazon.repository.ProductRepository;

import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.entity.Review;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;

    public Review createReview(ReviewDto review) {
        Review reviewEntity = new Review();
        reviewEntity.setDescription(review.getDescription());
        reviewEntity.setDate(review.getDate());
        reviewEntity.setUser(userRepository.findById(review.getUserId()).orElseThrow(() -> new RuntimeException("User not found")));
        reviewEntity.setProduct(productRepository.findById(review.getProductId()).orElseThrow(() -> new RuntimeException("Product not found")));
        if (review.getParentId() != null) {
            reviewEntity.setParent(reviewRepository.findById(review.getParentId()).orElseThrow(() -> new RuntimeException("Parent review not found")));
        }
        return reviewRepository.save(reviewEntity);
    }
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

}
