package com.finale.amazon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
} 