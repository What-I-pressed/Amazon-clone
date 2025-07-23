package com.finale.amazon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.Order;
import com.finale.amazon.entity.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByProductSeller(User seller);
    long countByProductSeller(User seller);
    long countByProductSellerAndOrderStatusNameIn(User seller, List<String> statusNames);
    List<Order> findByProductSellerAndOrderStatusName(User seller, String statusName);

}
