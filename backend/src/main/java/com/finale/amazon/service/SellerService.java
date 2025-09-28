package com.finale.amazon.service;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.entity.Review;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.OrderRepository;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.ReviewRepository;
import com.finale.amazon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.finale.amazon.dto.UserDto;


import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
public class SellerService {

        @Autowired
        private OrderRepository orderRepository;
        @Autowired
        private ProductRepository productRepository;
        @Autowired
        private static UserRepository userRepository; 
        @Autowired
        private ReviewRepository reviewRepository;

        @Autowired
        public SellerService(OrderRepository orderRepository) {
                this.orderRepository = orderRepository;
        }

        public List<ProductDto> getFilteredSellerProducts(Long sellerId, String name, Long categoryId, String sortBy, String direction) {
                Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);

                return productRepository.findFilteredProducts(sellerId, name, categoryId, sort)
                .stream()
                .map(ProductDto::new)
                .toList();
        }

        public static boolean isSeller(Long userId){
                return userRepository.findById(userId).get().getRole().getName() == "SELLER";
        }

        public List<UserDto> getBySubcategoryId(Long subcategoryId){
                return productRepository.findSellersBySubcategoryId(subcategoryId).stream().map(UserDto::new).collect(Collectors.toList());
        }

        public SellerStatsDto getSellerStats(User seller) {
                long totalOrders = orderRepository.countByProductSeller(seller);

                long activeOrders = orderRepository.countByProductSellerAndOrderStatusNameIn(
                        seller, List.of("NEW", "PROCESSING", "SHIPPED"));

                long completedOrders = orderRepository.countByProductSellerAndOrderStatusNameIn(
                        seller, List.of("DELIVERED"));

                long cancelledOrders = orderRepository.countByProductSellerAndOrderStatusNameIn(
                        seller, List.of("CANCELLED"));

                double totalRevenue = orderRepository.findByProductSellerAndOrderStatusName(
                        seller, "DELIVERED"
                ).stream().mapToDouble(order -> order.getPrice()).sum();
                var sellerReviewsOpt = reviewRepository.findByProduct_seller_Username(seller.getUsername());
                double customerFeedback = sellerReviewsOpt.map(list -> list.stream().mapToDouble(Review::getStars).average().orElse(0.0)).orElse(0.0);
                long reviewsCount = sellerReviewsOpt.map(List::size).orElse(0);
                double customerFeedback = reviewRepository.findByProduct_seller_Username(seller.getUsername()).get().stream().mapToDouble(review -> review.getStars()).average().orElse(1.0);
                List<ReviewDto> numOfReviews = reviewRepository.findByProduct_seller_Username(seller.getUsername()).get().stream().map(ReviewDto::new).collect(Collectors.toList());
                SellerStatsDto stats = new SellerStatsDto();
                numOfReviews = numOfReviews.stream().filter(e -> e.getUsername() != seller.getUsername()).collect(Collectors.toList());
                stats.setTotalOrders(totalOrders);
                stats.setActiveOrders(activeOrders);
                stats.setCompletedOrders(completedOrders);
                stats.setCancelledOrders(cancelledOrders);
                stats.setTotalRevenue(totalRevenue);
                stats.setAvgFeedback(customerFeedback);
                stats.setReviewsCount(reviewsCount);
                stats.setBuyersReviews(numOfReviews);
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
                if (updateRequest.getName() != null && !updateRequest.getName().isBlank()) {
                    if (updateRequest.getName().length() < 2 || updateRequest.getName().length() > 128) {
                        throw new IllegalArgumentException("Name should be from 2 to 128 characters long");
                    }
                    seller.setName(updateRequest.getName());
                }

                if (updateRequest.getPhone() != null && !updateRequest.getPhone().isBlank()) {
                    if (!updateRequest.getPhone().matches("\\+?[0-9]{7,20}")) {
                        throw new IllegalArgumentException("Phone number must be 7-20 digits, optional + at start");
                    }
                    seller.setPhone(updateRequest.getPhone());
                }
            
                return userRepository.save(seller);
            }
            
}
