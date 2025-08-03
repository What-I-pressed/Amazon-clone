package com.finale.amazon.service;

import com.finale.amazon.dto.ProductStatisticsDto;
import com.finale.amazon.entity.Product;
import com.finale.amazon.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProductStatisticsService {

    @Autowired
    private ProductRepository productRepository;

    public Optional<ProductStatisticsDto> getStatistics(Long productId) {
        return productRepository.findById(productId).map(product -> {
            int reviewCount = product.getReviews() != null ? product.getReviews().size() : 0;
            return new ProductStatisticsDto(
                product.getQuantitySold(),
                reviewCount,
                product.getQuantityInStock()
            );
        });
    }
}
