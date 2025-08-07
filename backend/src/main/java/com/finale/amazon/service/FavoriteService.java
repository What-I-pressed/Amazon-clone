package com.finale.amazon.service;

import com.finale.amazon.dto.FavoriteDto;
import com.finale.amazon.entity.Favorite;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.FavoriteRepository;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public void addToFavorites(Long userId, FavoriteDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        boolean alreadyExists = favoriteRepository.findByUserAndProduct(user, product).isPresent();
        if (!alreadyExists) {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setProduct(product);
            favoriteRepository.save(favorite);
        }
    }

    public void removeFromFavorites(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        favoriteRepository.deleteByUserAndProduct(user, product);
    }

    public List<Favorite> getFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return favoriteRepository.findByUser(user);
    }

    public boolean isFavorite(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        return favoriteRepository.findByUserAndProduct(user, product).isPresent();
    }
}
