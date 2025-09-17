package com.finale.amazon.service;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.Review;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.OrderRepository;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.ReviewRepository;
import com.finale.amazon.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SellerService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public List<ProductDto> getFilteredSellerProducts(Long sellerId, String name, Long categoryId, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return productRepository.findFilteredProducts(sellerId, name, categoryId, sort)
                .stream()
                .map(ProductDto::new)
                .toList();
    }

    public Page<ProductDto> getFilteredSellerProductsPage(
            Long sellerId,
            String name,
            Long categoryId,
            String sortBy,
            String direction,
            Pageable pageable
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        List<ProductDto> allProducts = productRepository.findFilteredProducts(sellerId, name, categoryId, sort)
                .stream()
                .map(ProductDto::new)
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allProducts.size());
        List<ProductDto> content = (start <= end) ? allProducts.subList(start, end) : List.of();

        return new PageImpl<>(content, pageable, allProducts.size());
    }

    public boolean isSeller(Long userId){
        return userRepository.findById(userId).get().getRole().getName().equalsIgnoreCase("SELLER");
    }

    public SellerStatsDto getSellerStats(User seller) {
        long totalOrders = orderRepository.countByProductSeller(seller);
        long activeOrders = orderRepository.countByProductSellerAndOrderStatusNameIn(
                seller, List.of("Pending", "Processing", "Shipped"));
        long completedOrders = orderRepository.countByProductSellerAndOrderStatusNameIn(
                seller, List.of("Delivered"));
        long cancelledOrders = orderRepository.countByProductSellerAndOrderStatusNameIn(
                seller, List.of("Cancelled"));
        double totalRevenue = orderRepository.findByProductSellerAndOrderStatusName(
                seller, "Delivered"
        ).stream().mapToDouble(order -> order.getPrice()).sum();
        double customerFeedback = reviewRepository.findByProduct_seller_Username(seller.getUsername()).get().stream().mapToDouble(Review::getStars).average().orElse(1.0);
        long numOfReviews = reviewRepository.findByProduct_seller_Username(seller.getUsername()).get().stream().count();

        SellerStatsDto stats = new SellerStatsDto();
        stats.setTotalOrders(totalOrders);
        stats.setActiveOrders(activeOrders);
        stats.setCompletedOrders(completedOrders);
        stats.setCancelledOrders(cancelledOrders);
        stats.setTotalRevenue(totalRevenue);
        stats.setAvgFeedback(customerFeedback);
        stats.setTotalOrders(numOfReviews);

        return stats;
    }

    public List<Review> getSellersReviews(User seller){
        return reviewRepository.findByProduct_seller_Username(seller.getUsername()).get();
    }

    public User updateSellerProfile(User seller, UserDto updateRequest) {
        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new IllegalArgumentException("User is not a seller");
        }

        if (updateRequest.getUsername() != null && !updateRequest.getUsername().isBlank()) {
            if (updateRequest.getUsername().length() < 3 || updateRequest.getUsername().length() > 50) {
                throw new IllegalArgumentException("Username must be 3-50 characters");
            }
            seller.setUsername(updateRequest.getUsername());
        }

        if (updateRequest.getDescription() != null) {
            if (updateRequest.getDescription().length() > 500) {
                throw new IllegalArgumentException("Description max 500 characters");
            }
            seller.setDescription(updateRequest.getDescription());
        }

        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isBlank()) {
            if (!updateRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new IllegalArgumentException("Invalid email format");
            }
            seller.setEmail(updateRequest.getEmail());
        }

        return userRepository.save(seller);
    }
}
