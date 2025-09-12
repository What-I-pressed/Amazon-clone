package com.finale.amazon.controller;

import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.dto.CartItemResponseDto;
import com.finale.amazon.entity.CartItem;
import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.CartService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@Tag(name = "Cart Controller", description = "Контролер для роботи з кошиком користувача")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Отримати товари з кошика користувача", description = "Повертає всі товари, які користувач додав у кошик")
    @GetMapping("")
    public ResponseEntity<List<CartItemResponseDto>> getCartItemsByUser(@RequestParam String token) {
        List<CartItem> items = cartService.getCartItemsByUserId(jwtUtil.extractUserId(token));
        List<CartItemResponseDto> dtos = items.stream()
                                     .map(CartItemResponseDto::new)
                                     .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @Operation(summary = "Додати товар до кошика або оновити кількість")
    @PostMapping("/add")
    public ResponseEntity<?> addCartItem(@RequestParam String token, @RequestBody CartItemDto cartItemDto) {
        cartService.Add(jwtUtil.extractUserId(token), cartItemDto);
        return ResponseEntity.ok("Successfully added to cart");
    }

    @Operation(summary = "Видалити конкретний товар з кошика користувача")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCartItem(@RequestParam String token, @PathVariable Long id ) {
        try {
            cartService.removeCartItem(jwtUtil.extractUserId(token), id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Очистити кошик користувача")
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestParam String token) {
        cartService.clearCart(jwtUtil.extractUserId(token));
        return ResponseEntity.noContent().build();
    }
}
