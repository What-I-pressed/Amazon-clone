package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {
    private Long productId;
    private int quantity;

    public CartItemDto(com.finale.amazon.entity.CartItem cartItem) {
        if (cartItem.getProduct() != null) {
            this.productId = cartItem.getProduct().getId();
        }
        this.quantity = cartItem.getQuantity();
    }
}
