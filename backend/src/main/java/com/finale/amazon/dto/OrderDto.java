package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.finale.amazon.entity.Order;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {
    private Long id;
    private LocalDateTime orderDate;
    private LocalDateTime arrivalDate;
    private LocalDateTime shipmentDate;
    private double totalPrice;
    private String orderStatus;
    private String userName;
    private Long userId;
    private List<OrderItemDto> orderItems;
    
    public OrderDto(Order order) {
        this.id = order.getId();
        this.orderDate = order.getOrderDate();
        this.arrivalDate = order.getArrivalDate();
        this.shipmentDate = order.getShipmentDate();
        this.totalPrice = order.getPrice();
        
        if (order.getOrderStatus() != null) {
            this.orderStatus = order.getOrderStatus().getName();
        }
        
        if (order.getUser() != null) {
            this.userName = order.getUser().getUsername();
            this.userId = order.getUser().getId();
        }
        
        if (order.getOrderItems() != null) {
            this.orderItems = order.getOrderItems().stream()
                    .map(OrderItemDto::new)
                    .collect(Collectors.toList());
        }
    }
} 