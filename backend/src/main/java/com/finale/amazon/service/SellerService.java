package com.finale.amazon.service;

import com.finale.amazon.dto.ProductDto;
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

import java.util.List;

@Service
public class SellerService {

        private final OrderRepository orderRepository;
        @Autowired
        private ProductRepository productRepository;
        @Autowired
        private UserRepository userRepository; 
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
                double customerFeedback = reviewRepository.findByProduct_Vendor_Username(seller.getUsername()).get().stream().mapToDouble(review -> review.getStars()).average().orElse(1.0);
                long numOfReviews = reviewRepository.findByProduct_Vendor_Username(seller.getUsername()).get().stream().count();
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
                return reviewRepository.findByProduct_Vendor_Username(seller.getUsername()).get();
        }
}
