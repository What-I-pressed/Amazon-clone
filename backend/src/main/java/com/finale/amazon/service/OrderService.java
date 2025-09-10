package com.finale.amazon.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.OrderCreationDto;
import com.finale.amazon.dto.OrderItemCreationDto;
import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.OrderItem;
import com.finale.amazon.entity.OrderStatus;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.OrderRepository;
import com.finale.amazon.repository.OrderStatusRepository;
import com.finale.amazon.repository.ProductRepository;

import jakarta.transaction.Transactional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusRepository orderStatusRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductRepository productRepository;

    public List<Order> getOrdersBySeller(User seller) {
        return orderRepository.findByProductSeller(seller);
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByStatusNames(List<String> statusNames) {
        return orderRepository.findByOrderStatus_NameIn(statusNames);
    }

    public List<Order> findByStatusNameInAndUserId(List<String> statusNames, Long userId) {
        return orderRepository.findByOrderStatus_NameInAndUserId(statusNames, userId);
    }

    private OrderItem fillOrderItem(OrderItemCreationDto dto, Order oreder) {
        OrderItem oi = new OrderItem();
        oi.setProduct(productService.getProductById(dto.getProductId()).get());
        oi.setQuantity(dto.getQuantity());
        oi.setUnitPrice(oi.getProduct().getPrice());
        oi.setTotalPrice(oi.getQuantity() * oi.getProduct().getPrice());
        oi.setOrder(oreder);
        return oi;
    }

    public Order shipOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).get();
        order.setShipmentDate(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order FinishDelivery(Long orderId) {
        Order order = orderRepository.findById(orderId).get();
        order.setArrivalDate(LocalDateTime.now());
        return orderRepository.save(order);
    }

    // private Order fillOrder(OrderDto dto){
    // Order order = new Order();
    // order.setOrderDate(dto.getOrderDate());
    // order.setArrivalDate(dto.getArrivalDate());
    // order.setOrderItems(dto.getOrderItems().stream().map(idto ->
    // fillOrderItem(idto)).collect(Collectors.toList()));
    // order.setOrderStatus(orderStatusRepository.findByName(dto.getOrderStatus()).get());
    // order.setPrice(dto.getTotalPrice());
    // order.setShipmentDate(dto.getShipmentDate());
    // order.setUser(userService.getUserById(dto.getUserId()).get());
    // return order;
    // }

    // public Order creatOrder(OrderCreationDto dto, Long userId) {
    // Order order = new Order();
    // order.setOrderDate(LocalDateTime.now());
    // order.setOrderStatus(orderStatusRepository.findByName("NEW").get());
    // order.setUser(userService.getUserById(userId));
    // List<OrderItem> items = dto.getOrderItems().stream()
    // .map(itemDto -> fillOrderItem(itemDto, order))
    // .collect(Collectors.toList());

    // order.setOrderItems(items);
    // order.setPrice(order.getOrderItems().stream().mapToDouble(OrderItem::getTotalPrice).sum());
    // return orderRepository.save(order);
    // }

    @Transactional
    public Order creatOrder(OrderCreationDto dto, Long userId) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(orderStatusRepository.findByName("NEW").orElseThrow());
        order.setUser(userService.getUserById(userId));

        List<OrderItem> items = dto.getOrderItems().stream()
                .map(itemDto -> {
                    OrderItem orderItem = fillOrderItem(itemDto, order);

                    Product product = orderItem.getProduct();

                    if (product.getQuantityInStock() < orderItem.getQuantity()) {
                        throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
                    }

                    product.setQuantityInStock(product.getQuantityInStock() - orderItem.getQuantity());
                    product.setQuantitySold(product.getQuantitySold() + orderItem.getQuantity());

                    productRepository.save(product);

                    return orderItem;
                })
                .collect(Collectors.toList());
        order.setOrderItems(items);
        order.setPrice(order.getOrderItems().stream()
                .mapToDouble(OrderItem::getTotalPrice)
                .sum());

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long orderId, Long userId, String newStatusName) {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isEmpty()) {
            throw new RuntimeException("Order not found");
        }

        Order order = optionalOrder.get();
        if (order.getUser().getId() != userId)
            throw new RuntimeException("User is not authorized to change order status");
        String currentStatus = order.getOrderStatus().getName();

        if (currentStatus.equals("CANCELLED") || currentStatus.equals("DELIVERED")) {
            throw new RuntimeException("Cannot change status of a completed or cancelled order.");
        }

        Optional<OrderStatus> optionalStatus = orderStatusRepository.findByName(newStatusName);
        if (optionalStatus.isEmpty()) {
            throw new RuntimeException("Order status not found");
        }

        if (newStatusName.equals("CANCELLED")) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setQuantityInStock(product.getQuantityInStock() + item.getQuantity());

                product.setQuantitySold(product.getQuantitySold() - item.getQuantity());

                productRepository.save(product);
            }

            OrderStatus newStatus = optionalStatus.get();
            order.setOrderStatus(newStatus);
        }
        return orderRepository.save(order);
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
