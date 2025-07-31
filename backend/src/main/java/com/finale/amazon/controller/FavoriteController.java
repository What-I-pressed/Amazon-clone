package com.finale.amazon.controller;

import com.finale.amazon.dto.FavoriteDto;
import com.finale.amazon.entity.Favorite;
import com.finale.amazon.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/{userId}")
    public void addToFavorites(@PathVariable Long userId, @RequestBody FavoriteDto dto) {
        favoriteService.addToFavorites(userId, dto);
    }

    @DeleteMapping("/{userId}/{productId}")
    public void removeFromFavorites(@PathVariable Long userId, @PathVariable Long productId) {
        favoriteService.removeFromFavorites(userId, productId);
    }

    @GetMapping("/{userId}")
    public List<Favorite> getFavorites(@PathVariable Long userId) {
        return favoriteService.getFavorites(userId);
    }

    @GetMapping("/{userId}/{productId}/exists")
    public boolean isFavorite(@PathVariable Long userId, @PathVariable Long productId) {
        return favoriteService.isFavorite(userId, productId);
    }
}
