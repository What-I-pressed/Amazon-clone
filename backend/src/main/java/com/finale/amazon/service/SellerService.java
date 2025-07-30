package com.finale.amazon.service;

import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
        public SellerService(OrderRepository orderRepository) {
                this.orderRepository = orderRepository;
        }

        public List<ProductDto> getFilteredSellerProducts(String email, String name, Long categoryId, String sortBy, String direction) {
                User seller = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Seller not found"));

                Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);

                return productRepository.findFilteredProducts(seller.getId(), name, categoryId, sort)
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
                ).stream().mapToDouble(Order::getPrice).sum();

                return new SellerStatsDto(
                        totalOrders,
                        activeOrders,
                        completedOrders,
                        cancelledOrders,
                        totalRevenue
                );
        }
}
