package com.finale.amazon.repository;

import com.finale.amazon.entity.Picture;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PictureRepository extends JpaRepository<Picture, Long> {
    List<Picture> findPictureByProductId(Long productId);
} 