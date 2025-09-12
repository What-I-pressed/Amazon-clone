package com.finale.amazon.service;

import com.finale.amazon.dto.ProductStatisticsDto;
import com.finale.amazon.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StatisticsService {

    @Autowired
    private ProductRepository productRepository;

    public Optional<ProductStatisticsDto> getStatistics(Long productId) {
        return productRepository.findById(productId).map(product -> {
            ProductStatisticsDto dto = new ProductStatisticsDto();
            dto.setQuantitySold(product.getQuantitySold());
            dto.setTotalReviews(product.getReviews() != null ? product.getReviews().size() : 0);
            dto.setTotalProducts(1); // This is for a specific product
            dto.setTotalRevenue(0); // Would need to calculate from orders
            dto.setTotalOrders(0); // Would need to calculate from orders
            dto.setTotalUsers(0); // Would need to calculate from users
            dto.setTotalCategories(0); // Would need to calculate from categories
            return dto;
        });
    }
} 