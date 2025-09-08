package com.finale.amazon.controller;

import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.OrderService;
import com.finale.amazon.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@Tag(name = "Orders ", description = "Контролер для роботи з замовленнями")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Operation(summary = "Отримати всі замовлення продавця за його ID")
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Order>> getOrdersBySeller(
            @Parameter(description = "ID продавця") @PathVariable Long sellerId) {

        Optional<User> optionalSeller = userService.getUserById(sellerId);
        if (optionalSeller.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User seller = optionalSeller.get();
        List<Order> orders = orderService.getOrdersBySeller(seller);

        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Отримати замовлення за його ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @Parameter(description = "ID замовлення") @PathVariable Long orderId) {

        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        return orderOpt.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Оновити статус замовлення")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @Parameter(description = "ID замовлення") @PathVariable Long orderId,
            @Parameter(description = "Новий статус замовлення") @RequestParam String status) {

        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, status.toUpperCase());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @Operation(summary = "Отримати активні замовлення (NEW, PROCESSING, SHIPPED)")
    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        List<Order> activeOrders = orderService.getOrdersByStatusNames(List.of(
            "NEW", "PROCESSING", "SHIPPED"
        ));

        return activeOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(activeOrders);
    }

    @Operation(summary = "Отримати завершені замовлення (DELIVERED, CANCELLED)")
    @GetMapping("/completed")
    public ResponseEntity<List<Order>> getCompletedOrders() {
        List<Order> completedOrders = orderService.getOrdersByStatusNames(List.of(
            "DELIVERED", "CANCELLED"
        ));

        return completedOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(completedOrders);
    }
}
