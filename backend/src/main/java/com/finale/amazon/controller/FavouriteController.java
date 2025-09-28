package com.finale.amazon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.FavouriteService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/favourite")
public class FavouriteController {
    @Autowired
    private FavouriteService favouriteService;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Отримати всі товари користувача", description = "Повертає список всіх товарів, доданих користувачем у обране")
    @GetMapping("/")
    public ResponseEntity<?> getAllByUser(@RequestParam String token){
        return ResponseEntity.ok(favouriteService.getByUser(jwtUtil.extractUserId(token)));
    }

    @Operation(summary = "Отримати всі товари користувача", description = "Повертає список всіх товарів, доданих користувачем у обране")
    @GetMapping("/ids/")
    public ResponseEntity<?> getIdsByUser(@RequestParam String token){
        return ResponseEntity.ok(favouriteService.getIdsByUser(jwtUtil.extractUserId(token)));
    }

    @PostMapping("/add")
    @Operation(
        summary = "Add favourite item",
        description = "Returns the id of the created favourite item"
    )
    public ResponseEntity<?> add(@RequestParam String token, @RequestParam Long productId){
        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(400).body("Token is expired");
        }

        if ("SELLER".equalsIgnoreCase(jwtUtil.extractRole(token))) {
            return ResponseEntity.status(403).body("Sellers are not allowed to add favourites");
        }

        return ResponseEntity.ok(favouriteService.Add(jwtUtil.extractUserId(token), productId));
    }

    @Operation(summary = "Видалити товар з обраного", description = "Видаляє товар із списку обраного користувача за його ID")
    @DeleteMapping("/delete/{favouriteId}")
    public ResponseEntity<?> delete(@PathVariable Long favouriteId, @RequestParam String token){
        favouriteService.delete(jwtUtil.extractUserId(token), favouriteId);
        return ResponseEntity.ok("Deleted successfully");
    }

    
}
