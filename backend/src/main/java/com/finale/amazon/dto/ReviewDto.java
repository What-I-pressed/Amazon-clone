package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private String description;
    private LocalDateTime date;
    private String username;
    private Long userId;
    private Long parentId;
    private Long productId;
    
    public ReviewDto(com.finale.amazon.entity.Review review) {
        this.id = review.getId();
        this.description = review.getDescription();
        this.date = review.getDate();
        
        if (review.getUser() != null) {
            this.username = review.getUser().getUsername();
            this.userId = review.getUser().getId();
        }
    }
} 