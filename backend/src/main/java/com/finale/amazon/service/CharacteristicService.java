package com.finale.amazon.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.entity.CharacteristicValue;
import com.finale.amazon.repository.CharacteristicValueRepository;
import com.finale.amazon.specification.CharacteristicSpecification;

@Service
public class CharacteristicService {
    @Autowired
    private CharacteristicValueRepository characteristicValueRepository;
    

    public Map<String, List<String>> belongsToSubcategory(Long subcategoryId){
        List<CharacteristicValue> l = characteristicValueRepository.findAll(CharacteristicSpecification.belongToSubcategory(subcategoryId));
        return l.stream().collect(Collectors.groupingBy(cv -> cv.getCharacteristicType().getName(), Collectors.mapping(CharacteristicValue::getValue, Collectors.toList())));
    }
}
