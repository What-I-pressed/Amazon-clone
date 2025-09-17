package com.finale.amazon.dto;

import com.finale.amazon.entity.Subcategory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubcategoryDto {
    private Long id;
    private String name;

    public SubcategoryDto(Subcategory s){
        id = s.getId();
        name = s.getName();
    }
}
