package com.finale.amazon.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.finale.amazon.entity.OrderStatus;

@Repository
public interface OrderStatusRepository extends JpaRepository<OrderStatus, Long> {
    Optional<OrderStatus> findByName(String name);
}
