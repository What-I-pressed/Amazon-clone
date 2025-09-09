package com.finale.amazon.repository;

import com.finale.amazon.entity.CartItem;
import com.finale.amazon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("""
                SELECT ci
                FROM CartItem ci
                JOIN FETCH ci.product p
                LEFT JOIN FETCH p.pictures pic
                WHERE ci.user = :user AND (pic.name LIKE '1.%' OR pic IS NULL)
            """)
    List<CartItem> findByUserWithMainPicture(@Param("user") User user);

    List<CartItem> findByUser(User user);

    void deleteByUser(User user);
}
