package com.finale.amazon.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.CharacteristicValue;

@Repository
public interface CharacteristicValueRepository extends JpaRepository<CharacteristicValue, Long>{
    
}
