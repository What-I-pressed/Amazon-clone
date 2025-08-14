package com.finale.amazon.controller;

import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.entity.CartItem;
import com.finale.amazon.service.CartService;
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
    private CartService cartService;

    @GetMapping("/user/{email}")
    public ResponseEntity<List<CartItemDto>> getCartItemsByUser(@PathVariable String email) {
        List<CartItem> items = cartService.getCartItemsByUserEmail(email);
        List<CartItemDto> dtos = items.stream()
                                     .map(CartItemDto::new)
                                     .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addCartItem(@RequestParam String email, @RequestParam Long productId, @RequestParam int quantity) {
        CartItem item = cartService.addOrUpdateCartItem(email, productId, quantity);
        return ResponseEntity.ok(new CartItemDto(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable Long id, @RequestParam String email) {
        try {
            cartService.removeCartItem(email, id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestParam String email) {
        cartService.clearCart(email);
        return ResponseEntity.noContent().build();
    }
}
