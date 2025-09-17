package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewCreationDto {
    private String description;
    private Long stars;
    private LocalDateTime date;
    private Long productId; 
}
