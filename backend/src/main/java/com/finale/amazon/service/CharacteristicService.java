package com.finale.amazon.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.ProductFilterDto;
import com.finale.amazon.entity.CharacteristicValue;
import com.finale.amazon.entity.Product;
import com.finale.amazon.repository.CharacteristicValueRepository;
import com.finale.amazon.specification.CharacteristicSpecification;
import com.finale.amazon.specification.ProductSpecification;

@Service
public class CharacteristicService {
    @Autowired
    private CharacteristicValueRepository characteristicValueRepository;

    public Map<String, List<String>> belongsToSubcategory(Long subcategoryId) {
        List<CharacteristicValue> l = characteristicValueRepository
                .findAll(CharacteristicSpecification.belongToSubcategory(subcategoryId));
        return l.stream().collect(Collectors.groupingBy(cv -> cv.getCharacteristicType().getName(),
                Collectors.mapping(CharacteristicValue::getValue, Collectors.toList())));
    }

    private Specification<CharacteristicValue> getSpec(String name, Long categoryId, Long subcategoryId){
        Specification<CharacteristicValue> spec = Specification.where(null);

        if (name != null) {
            spec = spec.and(CharacteristicSpecification.hasProductName(name));
        }
        if (categoryId != null) {
            spec = spec.and(CharacteristicSpecification.hasProductCategory(categoryId));
        }
        if (subcategoryId != null) {
            spec = spec.and(CharacteristicSpecification.belongToSubcategory(subcategoryId));
        }

        return spec;
    }

    public Map<String, List<String>> findForSpec(String name, Long categoryId, Long subcategoryId) {
        Specification<CharacteristicValue> spec = getSpec(name, categoryId, subcategoryId);
        return characteristicValueRepository.findAll(spec).stream().collect(Collectors.groupingBy(cv -> cv.getCharacteristicType().getName(),
                Collectors.mapping(CharacteristicValue::getValue, Collectors.toList())));
    }
}
