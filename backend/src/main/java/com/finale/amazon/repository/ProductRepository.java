package com.finale.amazon.repository;

import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.Category;
import com.finale.amazon.entity.Subcategory;
import com.finale.amazon.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findAll(Pageable pageable);
    
    List<Product> findByCategory(Category category);
    
    List<Product> findBySubcategory(Subcategory subcategory);
    
    List<Product> findByVendor(User vendor);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByDiscountLaunchDateBeforeAndDiscountExpirationDateAfter(LocalDateTime start, LocalDateTime end);
    
    List<Product> findByQuantityInStockGreaterThan(Long quantity);
    
    long countByCategory(Category category);
    
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);
    
    @Query("SELECT p FROM Product p WHERE ((p.priceWithoutDiscount - p.price) / p.priceWithoutDiscount * 100) >= :discountPercentage")
    List<Product> findByDiscountPercentageGreaterThan(@Param("discountPercentage") double discountPercentage);
}
