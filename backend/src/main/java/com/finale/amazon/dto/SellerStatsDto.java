package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SellerStatsDto {
    private long totalOrders;
    private long activeOrders;
    private long completedOrders;
    private long cancelledOrders;
    private double totalRevenue;
    private long buyersReviews;
    private double avgFeedback;
}
