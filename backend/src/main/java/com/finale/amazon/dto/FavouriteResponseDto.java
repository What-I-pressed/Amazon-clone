package com.finale.amazon.dto;

import com.finale.amazon.entity.Favourite;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavouriteResponseDto {
    private long id;

    private ProductDto product;

    public FavouriteResponseDto(Favourite fav){
        id = fav.getId();
        product = fav.getProduct() != null ? new ProductDto(fav.getProduct()) : null; 
    }
}
