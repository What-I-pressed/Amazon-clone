package com.finale.amazon.repository;

import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.Category;
import com.finale.amazon.entity.Picture;
import com.finale.amazon.entity.Subcategory;
import com.finale.amazon.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // @EntityGraph(attributePaths = "pictures")
    // @Query("SELECT DISTINCT p FROM Product p")
    // @Query("""
    // SELECT DISTINCT p 
    // FROM Product p 
    
    // LEFT JOIN FETCH p.pictures pic 
    // WHERE pic.name LIKE '1.%' OR pic IS NULL
    // """)
    // Page<Product> findAll(Pageable pageable);
    
    Page<Product> findBySeller(Long vendorId, Pageable pageable);

    List<Product> findByCategory(Category category);
    
    List<Product> findBySubcategory(Subcategory subcategory);
    
    List<Product> findByseller(User seller);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByDiscountLaunchDateBeforeAndDiscountExpirationDateAfter(LocalDateTime start, LocalDateTime end);
    
    List<Product> findByQuantityInStockGreaterThan(Long quantity);
    
    long countByCategory(Category category);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.pictures WHERE p.id = :id")
    Optional<Product> findByIdWithPictures(@Param("id") Long id);
    
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);
    
    @Query("SELECT p FROM Product p WHERE ((p.priceWithoutDiscount - p.price) / p.priceWithoutDiscount * 100) >= :discountPercentage")
    List<Product> findByDiscountPercentageGreaterThan(@Param("discountPercentage") double discountPercentage);

    @Query("SELECT p FROM Product p " +
       "WHERE p.seller.id = :sellerId " +
       "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
       "AND (:categoryId IS NULL OR p.category.id = :categoryId)")
    List<Product> findFilteredProducts(@Param("sellerId") Long sellerId, @Param("name") String name, @Param("categoryId") Long categoryId, Sort sort);

}
