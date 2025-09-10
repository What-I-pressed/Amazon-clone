package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponseDto {
    private Long id;
    private ProductDto product;
    private int quantity;

    public CartItemResponseDto(com.finale.amazon.entity.CartItem cartItem) {
        if (cartItem.getProduct() != null) {
            this.id = cartItem.getId();
            this.product = new ProductDto(cartItem.getProduct());
        }
        this.quantity = cartItem.getQuantity();
    }
}
