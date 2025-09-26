package com.finale.amazon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<List<Review>> findByProduct_seller_Username(String seller);
    
    // Find all reviews for a product
    List<Review> findByProductId(Long productId);
    
    // Find top-level reviews (where parent is null)
    List<Review> findByProductIdAndParentIsNull(Long productId);
    
    // Find all replies for a specific review
    List<Review> findByParentId(Long parentId);
}