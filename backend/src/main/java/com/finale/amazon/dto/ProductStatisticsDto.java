package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductStatisticsDto {
    private long quantitySold;
    private long totalRevenue;
    private long totalOrders;
    private long totalUsers;
    private long totalProducts;
    private long totalReviews;
    private long totalCategories;
}
