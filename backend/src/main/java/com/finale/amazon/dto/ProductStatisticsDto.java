package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductStatisticsDto {
    private long quantitySold;
    private int reviewCount;
    private long quantityInStock;

    public ProductStatisticsDto(long quantitySold, int reviewCount, long quantityInStock) {
        this.quantitySold = quantitySold;
        this.reviewCount = reviewCount;
        this.quantityInStock = quantityInStock;
    }
}
