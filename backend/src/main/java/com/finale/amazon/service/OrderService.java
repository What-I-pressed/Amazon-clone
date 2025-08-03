package com.finale.amazon.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.OrderStatus;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.OrderRepository;
import com.finale.amazon.repository.OrderStatusRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusRepository orderStatusRepository;  

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

}
