package com.finale.amazon.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SellerStatsDto {
    private Double totalRevenue;
    private Double avgFeedback;
    private Long reviewsCount;
    private long totalOrders;
    private long activeOrders;
    private long completedOrders;
    private long cancelledOrders;
    private List<ReviewDto> buyersReviews;
}
