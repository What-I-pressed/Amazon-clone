package com.finale.amazon.controller;

import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.entity.CartItem;
import com.finale.amazon.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartItemService cartItemService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CartItemDto>> getCartItemsByUser(@PathVariable Long userId) {
        List<CartItem> items = cartItemService.getCartItemsByUserId(userId);
        List<CartItemDto> dtos = items.stream()
                                     .map(CartItemDto::new)
                                     .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addCartItem(@RequestBody CartItemDto cartItemDto) {
        CartItem item = cartItemService.addCartItem(cartItemDto);
        return ResponseEntity.ok(new CartItemDto(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItemDto> updateCartItemQuantity(@PathVariable Long id, @RequestBody int quantity) {
        CartItem updated = cartItemService.updateQuantity(id, quantity);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new CartItemDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable Long id) {
        boolean deleted = cartItemService.deleteCartItem(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
