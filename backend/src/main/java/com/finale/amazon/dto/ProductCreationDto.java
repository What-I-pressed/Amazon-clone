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
    
    // Category and subcategory by name (will be resolved in service)
    private String categoryName;
    private String subcategoryName;
    
    // Characteristic type by name (will be resolved in service)
    private String characteristicTypeName;
    
    // Vendor by ID (will be resolved in service)
    @NotNull(message = "Vendor ID is required")
    private Long vendorId;
    
    // List of image IDs that were previously uploaded
    private List<Long> imageIds;
    
    // List of product variations (optional)
    private List<ProductVariationDto> variations;
    
    // Validation method to ensure discount dates are logical
    public boolean isValidDiscountDates() {
        if (discountLaunchDate == null && discountExpirationDate == null) {
            return true; // No discount
        }
        
        if (discountLaunchDate != null && discountExpirationDate != null) {
            return discountLaunchDate.isBefore(discountExpirationDate);
        }
        
        return false; // One date is null but not the other
    }
    
    // Validation method to ensure price logic is correct
    public boolean isValidPricing() {
        if (price == null || priceWithoutDiscount == null) {
            return false;
        }
        
        // If there's a discount, price should be less than priceWithoutDiscount
        if (discountLaunchDate != null && discountExpirationDate != null) {
            LocalDateTime now = LocalDateTime.now();
            boolean discountActive = now.isAfter(discountLaunchDate) && now.isBefore(discountExpirationDate);
            
            if (discountActive && price >= priceWithoutDiscount) {
                return false;
            }
        }
        
        return true;
    }
}
