package com.finale.amazon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.vendor = :seller")
    List<Order> findByProductSeller(@Param("seller") User seller);
    
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.vendor = :seller")
    long countByProductSeller(@Param("seller") User seller);
    
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.vendor = :seller AND o.orderStatus.name IN :statusNames")
    long countByProductSellerAndOrderStatusNameIn(@Param("seller") User seller, @Param("statusNames") List<String> statusNames);
    
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.vendor = :seller AND o.orderStatus.name = :statusName")
    List<Order> findByProductSellerAndOrderStatusName(@Param("seller") User seller, @Param("statusName") String statusName);
    
    List<Order> findByOrderStatus_NameIn(List<String> statusNames);
}
