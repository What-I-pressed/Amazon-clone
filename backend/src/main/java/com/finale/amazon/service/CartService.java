package com.finale.amazon.service;

import com.finale.amazon.dto.CartDto;
import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.entity.CartItem;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.CartItemRepository;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartItemService cartItemService;

    @Transactional(readOnly = true)    
    public List<CartItem> getCartItemsByUserId(Long userId) {
        return cartItemService.getCartItemsByUserId(userId);
    }

    public void Add(Long userId, CartItemDto item) {
        cartItemService.addCartItem(userId, item);
    }

    public void removeCartItem(Long userId, Long cartItemId) {
        cartItemService.deleteCartItem(userId, cartItemId);
    }

    public void clearCart(Long userId) {
        cartItemService.deleteAllItemsByUserId(userId);
    }
}
