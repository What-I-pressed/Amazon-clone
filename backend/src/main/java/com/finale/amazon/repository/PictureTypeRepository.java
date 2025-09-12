package com.finale.amazon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.PictureType;

@Repository
public interface PictureTypeRepository extends JpaRepository<PictureType, Long> {
    PictureType findByName(String name);
}
