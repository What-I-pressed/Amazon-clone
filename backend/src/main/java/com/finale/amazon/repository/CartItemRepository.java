package com.finale.amazon.repository;

import com.finale.amazon.entity.CartItem;
import com.finale.amazon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    void deleteByUser(User user);
}
