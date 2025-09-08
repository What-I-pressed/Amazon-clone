package com.finale.amazon.controller;

import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.entity.CartItem;
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

    @Operation(summary = "Отримати всі товари у кошику користувача за email")
    @GetMapping("/user/{email}")
    public ResponseEntity<List<CartItemDto>> getCartItemsByUser(
            @Parameter(description = "Email користувача") @PathVariable String email) {

        List<CartItem> items = cartService.getCartItemsByUserEmail(email);
        List<CartItemDto> dtos = items.stream()
                                     .map(CartItemDto::new)
                                     .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @Operation(summary = "Додати товар до кошика або оновити кількість")
    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addCartItem(
            @Parameter(description = "Email користувача") @RequestParam String email,
            @Parameter(description = "ID продукту") @RequestParam Long productId,
            @Parameter(description = "Кількість товару") @RequestParam int quantity) {

        CartItem item = cartService.addOrUpdateCartItem(email, productId, quantity);
        return ResponseEntity.ok(new CartItemDto(item));
    }

    @Operation(summary = "Видалити конкретний товар з кошика користувача")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(
            @Parameter(description = "ID товару у кошику") @PathVariable Long id,
            @Parameter(description = "Email користувача") @RequestParam String email) {

        try {
            cartService.removeCartItem(email, id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Очистити кошик користувача")
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @Parameter(description = "Email користувача") @RequestParam String email) {

        cartService.clearCart(email);
        return ResponseEntity.noContent().build();
    }
}
