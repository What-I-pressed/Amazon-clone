package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariationDto {
    private Long id;
    private long quantityInStock;
    private String characteristicValue;
    
    public ProductVariationDto(com.finale.amazon.entity.ProductVariation variation) {
        this.id = variation.getId();
        this.quantityInStock = variation.getQuantityInStock();
        
        if (variation.getCharacteristic() != null) {
            this.characteristicValue = variation.getCharacteristic().getValue();
        }
    }
} 