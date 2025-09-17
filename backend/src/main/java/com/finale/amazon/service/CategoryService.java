package com.finale.amazon.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.SubcategoryDto;
import com.finale.amazon.entity.Subcategory;
import com.finale.amazon.repository.CategoryRepository;
import com.finale.amazon.repository.SubcategoryRepository;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SubcategoryRepository subcategoryRepository;

    public Map<String, List<SubcategoryDto>> getCategoryList(){
        List<Subcategory> subs = subcategoryRepository.findAll();
        return subs.stream().collect(Collectors.groupingBy(s -> s.getCategory().getName(), Collectors.mapping(SubcategoryDto::new, Collectors.toList())));
    }
}
