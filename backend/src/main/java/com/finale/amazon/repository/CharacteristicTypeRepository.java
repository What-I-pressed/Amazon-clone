package com.finale.amazon.repository;

import com.finale.amazon.entity.CharacteristicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CharacteristicTypeRepository extends JpaRepository<CharacteristicType, Long> {
    Optional<CharacteristicType> findByName(String name);
} 