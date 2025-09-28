package com.finale.amazon.controller;

import com.finale.amazon.dto.OrderCreationDto;
import com.finale.amazon.dto.OrderDto;
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

        return ResponseEntity.ok(orders.stream().map(OrderDto::new).collect(Collectors.toList()));
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
        String role = jwtUtil.extractRole(token);
        if ("SELLER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Sellers are not allowed to place orders");
        }
        try{
            Order o = orderService.creatOrder(order, jwtUtil.extractUserId(token));
            return ResponseEntity.ok(new OrderDto(o));
        }
        catch(Exception ex){
            return ResponseEntity.status(409).body("This product is out of stock");
        }
        
    }

    @Operation(summary = "Обробити замовлення", description = "Змінює статус замовлення на PROCESSING (тільки для ADMIN)")
    @PutMapping("/status/process")
    public ResponseEntity<?> ProccesOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(403).body("Token is expired");
        if (!"ADMIN".equals(jwtUtil.extractRole(token))) return ResponseEntity.status(403).body("You are not authorized to change order status!");
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "PROCESSING")));
    }

    @Operation(summary = "Відправити замовлення", description = "Змінює статус замовлення на SHIPPED (тільки для ADMIN)")
    @PutMapping("/status/ship")
    public ResponseEntity<?> ShipOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        if(!"ADMIN".equalsIgnoreCase(jwtUtil.extractRole(token))) return ResponseEntity.status(403).body("You are not authorized to change order status!");
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "SHIPPED")));
    }

    @Operation(summary = "Доставити замовлення", description = "Змінює статус замовлення на DELIVERED (тільки для ADMIN)")
    @PutMapping("/status/deliver")
    public ResponseEntity<?> DeliverOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        if(!"ADMIN".equalsIgnoreCase(jwtUtil.extractRole(token))) return ResponseEntity.status(403).body("You are not authorized to change order status!");
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "DELIVERED")));
    }

    @Operation(summary = "Скасувати замовлення", description = "Скасовує замовлення користувачем або адміністратором")
    @PutMapping("/status/cancel")
    public ResponseEntity<?> CancelOrder(@RequestParam String token,@RequestParam Long orderId){
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        if("ADMIN".equalsIgnoreCase(jwtUtil.extractRole(token))) {
            return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "CANCELLED")));
        }
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, jwtUtil.extractUserId(token) , "CANCELLED")));
    }

    @Operation(summary = "Отримати активні замовлення", description = "Повертає замовлення зі статусом NEW, PROCESSING або SHIPPED")
    @GetMapping("/active")
    public ResponseEntity<?> getActiveOrders(@RequestParam String token) {
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        String role = jwtUtil.extractRole(token);

        List<Order> activeOrders;
        if ("ADMIN".equalsIgnoreCase(role)) {
            activeOrders = orderService.getOrdersByStatusNames(List.of("NEW", "PROCESSING", "SHIPPED"));
        } else {
            activeOrders = orderService.findByStatusNameInAndUserId(List.of(
                "NEW", "PROCESSING", "SHIPPED"
            ), jwtUtil.extractUserId(token));
        }

        if (activeOrders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(activeOrders.stream().map(OrderDto::new).collect(Collectors.toList()));
    }

    @Operation(summary = "Отримати завершені замовлення (DELIVERED, CANCELLED)")
    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedOrders(@RequestParam String token) {
        if(jwtUtil.isTokenExpired(token)) return ResponseEntity.status(400).body("Token is expired");
        String role = jwtUtil.extractRole(token);

        List<Order> completedOrders;
        if ("ADMIN".equalsIgnoreCase(role)) {
            completedOrders = orderService.getOrdersByStatusNames(List.of("DELIVERED", "CANCELLED"));
        } else {
            completedOrders = orderService.findByStatusNameInAndUserId(List.of(
                "DELIVERED", "CANCELLED"
            ), jwtUtil.extractUserId(token));
        }

        if (completedOrders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(completedOrders.stream().map(OrderDto::new).collect(Collectors.toList()));
    }

    @Operation(summary = "Підтвердити замовлення", description = "Змінює статус замовлення на CONFIRMED (для ADMIN або SELLER)")
    @PutMapping("/status/confirm")
    public ResponseEntity<?> confirmOrder(@RequestParam String token, @RequestParam Long orderId) {
        if (jwtUtil.isTokenExpired(token)) 
            return ResponseEntity.status(400).body("Token is expired");
        
        String role = jwtUtil.extractRole(token);
        if (!"SELLER".equals(role) && !"ADMIN".equals(role)) 
            return ResponseEntity.status(403).body("You are not authorized to change order status!");
        
        return ResponseEntity.ok(new OrderDto(orderService.updateOrderStatus(orderId, "CONFIRMED")));
    }

    @Operation(summary = "Редагувати замовлення", description = "Оновлює дані замовлення за його ID")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@RequestParam String token,@PathVariable Long id,@RequestBody OrderDto orderDto) {

        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(400).body("Token is expired");
        }

        String role = jwtUtil.extractRole(token);
        if (!"ADMIN".equals(role) && !"SELLER".equals(role)) {
            return ResponseEntity.status(403).body("You are not authorized to edit this order!");
        }

        Order updatedOrder = orderService.updateOrder(id, orderDto);
        return ResponseEntity.ok(new OrderDto(updatedOrder));
    }

   @Operation(
    summary = "Отримати всі незавершені замовлення (тільки для ADMIN)", description = "Повертає всі замовлення у статусах NEW, PROCESSING або SHIPPED")
    @GetMapping("/not-completed")
    public ResponseEntity<?> getNotCompletedOrders(@RequestParam String token) {
        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(400).body("Token is expired");
        }

        String role = jwtUtil.extractRole(token);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("You are not authorized to view this resource!");
        }

        List<Order> activeOrders = orderService.findAllNotCompletedOrders();

        return activeOrders.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(activeOrders.stream().map(OrderDto::new).collect(Collectors.toList()));
    }



}
