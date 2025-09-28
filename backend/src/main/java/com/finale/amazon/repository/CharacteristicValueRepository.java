package com.finale.amazon.repository;



import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.finale.amazon.entity.CharacteristicValue;
import com.finale.amazon.entity.Product;

@Repository
public interface CharacteristicValueRepository extends JpaRepository<CharacteristicValue, Long>, JpaSpecificationExecutor<CharacteristicValue>{
    
}
