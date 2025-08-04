package com.finale.amazon.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.OrderStatus;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.OrderRepository;

@Service
public class OrderService {

   @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderStatusRepository orderStatusRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getOrdersBySeller(User seller) {
        return orderRepository.findByProductSeller(seller);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByStatusNames(List<String> statusNames) {
        return orderRepository.findByOrderStatus_NameIn(statusNames);
    }

    public Order updateOrderStatus(Long orderId, String newStatusName) {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isEmpty()) {
            throw new RuntimeException("Order not found");
        }

        Order order = optionalOrder.get();
        String currentStatus = order.getOrderStatus().getName();

        if (currentStatus.equals("CANCELLED") || currentStatus.equals("DELIVERED")) {
            throw new RuntimeException("Cannot change status of a completed or cancelled order.");
        }

        Optional<OrderStatus> optionalStatus = orderStatusRepository.findByName(newStatusName);
        if (optionalStatus.isEmpty()) {
            throw new RuntimeException("Order status not found");
        }

        OrderStatus newStatus = optionalStatus.get();
        order.setOrderStatus(newStatus);
        return orderRepository.save(order);
    }

    public Order createOrder(OrderRequest orderRequest, User user) {
        Optional<OrderStatus> optionalStatus = orderStatusRepository.findById(orderRequest.getOrderStatusId());
        if (optionalStatus.isEmpty()) {
            throw new RuntimeException("Order status not found");
        }

        OrderStatus status = optionalStatus.get();

        if (orderRequest.getOrderItems() == null || orderRequest.getOrderItems().isEmpty()) {
            throw new RuntimeException("No products in the order");
        }

        OrderItemRequest firstItem = orderRequest.getOrderItems().get(0);

        Product product = productRepository.findById(firstItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        double totalPrice = product.getPrice() * firstItem.getQuantity();

        LocalDateTime now = LocalDateTime.now();

        Order order = new Order();
        order.setUser(user); 
        order.setProduct(product);
        order.setPrice(totalPrice);
        order.setOrderStatus(status);
        order.setOrderDate(now);
        order.setShipmentDate(now.plusDays(1));   
        order.setArrivalDate(now.plusDays(6));    

        return orderRepository.save(order);
    }


}
