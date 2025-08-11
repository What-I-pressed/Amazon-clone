package com.finale.amazon.controller;

import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.OrderService;
import com.finale.amazon.service.UserService;
import com.finale.amazon.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (jwtUtil.isTokenExpired(token)) return null;
        return jwtUtil.extractSubject(token);
    }

    @GetMapping("/seller")
    public ResponseEntity<List<Order>> getOrdersBySeller(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> optionalSeller = userService.getUserByEmail(email);
        if (optionalSeller.isEmpty()) return ResponseEntity.status(401).build();

        User seller = optionalSeller.get();
        List<Order> orders = orderService.getOrdersBySeller(seller);

        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId,
                                              @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> optionalUser = userService.getUserByEmail(email);
        if (optionalUser.isEmpty()) return ResponseEntity.status(401).build();

        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId,
                                                   @RequestParam String status,
                                                   @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, status.toUpperCase());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        List<Order> activeOrders = orderService.getOrdersByStatusNames(List.of(
            "NEW", "PROCESSING", "SHIPPED"
        ));

        return activeOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(activeOrders);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<Order>> getCompletedOrders(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        List<Order> completedOrders = orderService.getOrdersByStatusNames(List.of(
            "DELIVERED", "CANCELLED"
        ));

        return completedOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(completedOrders);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest,
                                             @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> optionalUser = userService.getUserByEmail(email);
        if (optionalUser.isEmpty()) return ResponseEntity.status(401).build();

        User user = optionalUser.get();
        orderRequest.setUserId(user.getId());

        Order order = orderService.createOrder(orderRequest, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<Order> confirmOrder(@PathVariable Long orderId,
                                              @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        try {
            Order confirmedOrder = orderService.confirmOrder(orderId);
            return ResponseEntity.ok(confirmedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
