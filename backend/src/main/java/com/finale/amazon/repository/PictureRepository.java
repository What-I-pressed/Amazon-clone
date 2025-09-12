package com.finale.amazon.repository;

import com.finale.amazon.entity.Picture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PictureRepository extends JpaRepository<Picture, Long> {
    List<Picture> findPictureByProductId(Long productId);

    @Query("SELECT pic FROM Picture pic WHERE pic.product.id = :productId AND pic.pictureType.name = 'PRIMARY'")
    List<Picture> findMainPicture(@Param("productId")Long productId);
} 