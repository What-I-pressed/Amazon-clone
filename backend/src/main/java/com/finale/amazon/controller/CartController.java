package com.finale.amazon.controller;

import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.entity.CartItem;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.CartItemService;
import com.finale.amazon.service.UserService;
import com.finale.amazon.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartItemService cartItemService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (jwtUtil.isTokenExpired(token)) return null;
        return jwtUtil.extractSubject(token);
    }

    @GetMapping("/items")
    public ResponseEntity<List<CartItemDto>> getCartItemsByUser(
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        List<CartItem> items = cartItemService.getCartItemsByUserId(userOpt.get().getId());
        List<CartItemDto> dtos = items.stream()
                                     .map(CartItemDto::new)
                                     .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addCartItem(@RequestHeader("Authorization") String authHeader,
                                                   @RequestBody CartItemDto cartItemDto) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        cartItemDto.setUserId(userOpt.get().getId());

        CartItem item = cartItemService.addCartItem(cartItemDto);
        return ResponseEntity.ok(new CartItemDto(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItemDto> updateCartItemQuantity(@RequestHeader("Authorization") String authHeader,
                                                              @PathVariable Long id,
                                                              @RequestBody int quantity) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<CartItem> itemOpt = cartItemService.getCartItemsByUserId(userOpt.get().getId())
                                                   .stream()
                                                   .filter(ci -> ci.getId().equals(id))
                                                   .findFirst();

        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(403).build(); 
        }

        CartItem updated = cartItemService.updateQuantity(id, quantity);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new CartItemDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(@RequestHeader("Authorization") String authHeader,
                                               @PathVariable Long id) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<CartItem> itemOpt = cartItemService.getCartItemsByUserId(userOpt.get().getId())
                                                   .stream()
                                                   .filter(ci -> ci.getId().equals(id))
                                                   .findFirst();

        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        boolean deleted = cartItemService.deleteCartItem(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
