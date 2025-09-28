package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SellerStatsDto {
    private Long totalOrders;
    private Long activeOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private Double totalRevenue;
    private Double avgFeedback;
    private Long reviewsCount;
}
