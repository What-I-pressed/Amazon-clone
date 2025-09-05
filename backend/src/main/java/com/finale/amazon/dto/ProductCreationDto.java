package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductCreationDto {
    
    @NotBlank(message = "Product name is required")
    @Size(min = 1, max = 512, message = "Product name must be between 1 and 512 characters")
    private String name;
    
    @Size(max = 8192, message = "Description cannot exceed 8192 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
    private Double price;
    
    @NotNull(message = "Price without discount is required")
    @Positive(message = "Price without discount must be positive")
    @DecimalMin(value = "0.01", message = "Price without discount must be at least 0.01")
    private Double priceWithoutDiscount;
    
    @Future(message = "Discount launch date must be in the future")
    private LocalDateTime discountLaunchDate;
    
    @Future(message = "Discount expiration date must be in the future")
    private LocalDateTime discountExpirationDate;
    
    @NotNull(message = "Quantity in stock is required")
    @Min(value = 0, message = "Quantity in stock cannot be negative")
    private Long quantityInStock;
    
    @NotBlank
    private String categoryName;
    private String subcategoryName;
    
    private String characteristicTypeName;
    
    @NotNull(message = "seller ID is required")
    private Long sellerId;

    private List<ProductVariationDto> variations;
    
    public boolean isValidDiscountDates() {
        if (discountLaunchDate == null && discountExpirationDate == null) {
            return true;
        }
        
        if (discountLaunchDate != null && discountExpirationDate != null) {
            return discountLaunchDate.isBefore(discountExpirationDate);
        }
        
        return false;
    }
}
