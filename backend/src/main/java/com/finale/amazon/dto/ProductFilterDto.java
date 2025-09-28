package com.finale.amazon.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductFilterDto {

    private String name = null;
    private Long categoryId = null;
    private Long subcategoryId = null;
    private Double lowerPriceBound = null;
    private Double upperPriceBound = null;
    private List<Long> sellerIds = null;
    private List<String> slugs = null;
    private Map<String, String> characteristics = null;

}
