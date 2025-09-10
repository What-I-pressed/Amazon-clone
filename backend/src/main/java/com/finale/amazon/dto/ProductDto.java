package com.finale.amazon.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private double price;
    private double priceWithoutDiscount;
    private double discountPercentage;
    private boolean hasDiscount;
    private LocalDateTime discountLaunchDate;
    private LocalDateTime discountExpirationDate;
    private long quantityInStock;
    private long quantitySold;
    private int reviewCount;
    
    private String categoryName;
    private Long categoryId;
    private String subcategoryName;
    private Long subcategoryId;
    private String characteristicType;

    
    private String sellerName;
    private Long sellerId;
    
    private List<CharacteristicDto> characteristics;
    private List<PictureDto> pictures;
    private List<ReviewDto> reviews;
    private List<ProductVariationDto> variations;
    
    public ProductDto(com.finale.amazon.entity.Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.priceWithoutDiscount = product.getPriceWithoutDiscount();
        this.discountLaunchDate = product.getDiscountLaunchDate();
        this.discountExpirationDate = product.getDiscountExpirationDate();
        this.quantityInStock = product.getQuantityInStock();
        this.quantitySold = product.getQuantitySold();
        
        if (this.priceWithoutDiscount > 0) {
            this.discountPercentage = ((this.priceWithoutDiscount - this.price) / this.priceWithoutDiscount) * 100;
        } else {
            this.discountPercentage = 0;
        }
        
        LocalDateTime now = LocalDateTime.now();
        this.hasDiscount = this.discountLaunchDate != null && 
                          this.discountExpirationDate != null &&
                          now.isAfter(this.discountLaunchDate) && 
                          now.isBefore(this.discountExpirationDate) &&
                          this.price < this.priceWithoutDiscount;
        
        if (product.getCategory() != null) {
            this.categoryName = product.getCategory().getName();
            categoryId = product.getCategory().getId();
        }
        if (product.getSubcategory() != null) {
            this.subcategoryName = product.getSubcategory().getName();
            subcategoryId = product.getSubcategory().getId();
        }
        if (product.getCharacteristic() != null) {
            this.characteristicType = product.getCharacteristic().getName();
        }

        if(product.getCharacteristics() != null){
            characteristics = product.getCharacteristics().stream().map(CharacteristicDto::new).toList();
        }
        
        if (product.getSeller() != null) {
            this.sellerName = product.getSeller().getUsername();
            this.sellerId = product.getSeller().getId();
        }
        
        if (product.getReviews() != null) {
            this.reviewCount = product.getReviews().size();
        } else {
            this.reviewCount = 0;
        }
        
        if (product.getPictures() != null) {
            pictures = product.getPictures().stream().map(PictureDto::new).toList();
        }
        
        if (product.getReviews() != null) {
            this.reviews = product.getReviews().stream()
                    .map(ReviewDto::new)
                    .toList();
        }
        
        if (product.getVariations() != null) {
            this.variations = product.getVariations().stream()
                    .map(ProductVariationDto::new)
                    .toList();
        }
    }
}
