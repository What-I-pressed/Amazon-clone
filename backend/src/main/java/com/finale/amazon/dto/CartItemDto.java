package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {
    private Long id;
    private Long userId;
    private Long productId;
    private String productName;
    private int quantity;
    private double productPrice;

    public CartItemDto(com.finale.amazon.entity.CartItem cartItem) {
        this.id = cartItem.getId();
        if (cartItem.getUser() != null) {
            this.userId = cartItem.getUser().getId();
        }
        if (cartItem.getProduct() != null) {
            this.productId = cartItem.getProduct().getId();
            this.productName = cartItem.getProduct().getName();
            this.productPrice = cartItem.getProduct().getPrice();
        }
        this.quantity = cartItem.getQuantity();
    }
}
