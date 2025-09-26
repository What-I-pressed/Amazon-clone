package com.finale.amazon.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.FavouriteResponseDto;
import com.finale.amazon.entity.Favourite;
import com.finale.amazon.repository.FavouriteRepository;

import jakarta.transaction.Transactional;

@Service
public class FavouriteService {
    @Autowired
    private FavouriteRepository favouriteRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    private void Authorize(Long userId, Long fav){
        if(userId != fav) throw new RuntimeException("You are unathorized to perform this operation");
    }

    public Long Add(Long userId, Long productId){
        Favourite f = new Favourite();
        f.setProduct(productService.findProductById(productId));
        f.setUser(userService.getUserById(userId));
        return favouriteRepository.save(f).getId();
    }

    @Transactional
    public void delete(Long userId, Long favId){
        Favourite f = favouriteRepository.findById(favId).orElseThrow(() -> new RuntimeException("This favourite item was not found"));
        Authorize(userId, f.getUser().getId());
        favouriteRepository.delete(f);

    }

    public List<Long> getIdsByUser(Long userId){
        // Return PRODUCT IDs so the frontend can check favourites presence efficiently
        return favouriteRepository
            .findByUser(userService.getUserById(userId))
            .stream()
            .map(fav -> fav.getProduct() != null ? fav.getProduct().getId() : null)
            .filter(id -> id != null)
            .collect(Collectors.toList());
    }

    public List<FavouriteResponseDto> getByUser(Long userId){
        return favouriteRepository.findByUser(userService.getUserById(userId)).stream().map(FavouriteResponseDto::new).collect(Collectors.toList());
    }
}
