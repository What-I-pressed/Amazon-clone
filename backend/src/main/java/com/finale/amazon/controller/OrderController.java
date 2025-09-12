package com.finale.amazon.controller;

import com.finale.amazon.dto.OrderCreationDto;
import com.finale.amazon.dto.OrderDto;
import com.finale.amazon.dto.OrderStatusRequestDto;
import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.User;
import com.finale.amazon.security.JwtUtil;
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
import java.util.stream.Collector;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@Tag(name = "Orders ", description = "Контролер для роботи з замовленнями")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Отримати замовлення продавця", description = "Повертає список всіх замовлень для поточного продавця")
    @GetMapping("/seller/orders")
    public ResponseEntity<?> getOrdersBySeller(@RequestParam String token) {
        if (jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(400).body("Token expired");
            }
        User seller  = userService.getUserById(jwtUtil.extractUserId(token));
        List<Order> orders = orderService.getOrdersBySeller(seller);

        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Отримати замовлення користувача", description = "Повертає всі замовлення поточного користувача")
    @GetMapping("/all")
    public ResponseEntity<?> getOrdersByUser(@RequestParam String token) {
        if (jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(400).body("Token expired");
            }
        User seller = userService.getUserById(jwtUtil.extractUserId(token));
        //System.out.println(optionalSeller.get().getEmail());
        List<Order> orders = orderService.getOrdersByUser(seller);

        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders.stream().map(OrderDto::new).collect(Collectors.toList()));
    }

    @Operation(summary = "Отримати замовлення за ID", description = "Повертає замовлення за його унікальним ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @Parameter(description = "ID замовлення") @PathVariable Long orderId) {

        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        return orderOpt.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Створити замовлення", description = "Створює нове замовлення для користувача")
    @PutMapping("/create")
    public ResponseEntity<?> CreateOrder(@RequestParam String token, @RequestBody OrderCreationDto order){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        return ResponseEntity.ok(new OrderDto(orderService.creatOrder(order, jwtUtil.extractUserId(token))));
    }

    @Operation(summary = "Обробити замовлення", description = "Змінює статус замовлення на PROCESSING (тільки для ADMIN)")
    @PutMapping("/status/process")
    public ResponseEntity<?> ProccesOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(403).body("Token is expired");
        if(jwtUtil.extractRole(token) != "ADMIN") return ResponseEntity.status(403).body("You are not authorized to change order status!");
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "PROCESSING")));
    }

    @Operation(summary = "Відправити замовлення", description = "Змінює статус замовлення на SHIPPED (тільки для ADMIN)")
    @PutMapping("/status/ship")
    public ResponseEntity<?> ShipOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        if(jwtUtil.extractRole(token) != "ADMIN") return ResponseEntity.status(403).body("You are not authorized to change order status!");
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "SHIPPED")));
    }

    @Operation(summary = "Доставити замовлення", description = "Змінює статус замовлення на DELIVERED (тільки для ADMIN)")
    @PutMapping("/status/deliver")
    public ResponseEntity<?> DeliverOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        if(jwtUtil.extractRole(token) != "ADMIN") return ResponseEntity.status(403).body("You are not authorized to change order status!");
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "DELIVERED")));
    }

    @Operation(summary = "Скасувати замовлення", description = "Скасовує замовлення користувачем або адміністратором")
    @PutMapping("/status/cancel")
    public ResponseEntity<?> CancelOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        if(jwtUtil.extractRole(token) == "ADMIN") ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "CANCELLED")));
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, jwtUtil.extractUserId(token) , "CANCELLED")));
    }

    @Operation(summary = "Отримати активні замовлення", description = "Повертає замовлення зі статусом NEW, PROCESSING або SHIPPED")
    @GetMapping("/active")
    public ResponseEntity<?> getActiveOrders(@RequestParam String token) {
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        List<Order> completedOrders = orderService.findByStatusNameInAndUserId(List.of(
            "NEW", "PROCESSING", "SHIPPED"
        ), jwtUtil.extractUserId(token));

        return completedOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(completedOrders);
    }

    @Operation(summary = "Отримати завершені замовлення (DELIVERED, CANCELLED)")
    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedOrders(@RequestParam String token) {
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        List<Order> completedOrders = orderService.findByStatusNameInAndUserId(List.of(
            "DELIVERED", "CANCELLED"
        ), jwtUtil.extractUserId(token));

        return completedOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(completedOrders);
    }
}
