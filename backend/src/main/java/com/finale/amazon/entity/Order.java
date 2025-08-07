package com.finale.amazon.entity;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.cglib.core.Local;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private double price;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private LocalDateTime arrivalDate;

    @Column(nullable = false)
    private LocalDateTime shipmentDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = jakarta.persistence.FetchType.LAZY)
    private List<OrderItem> orderItems;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "order_status_id")
    private OrderStatus orderStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
