package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.ReviewDto;
import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.ProductService;
import com.finale.amazon.service.SellerService;
import com.finale.amazon.service.UserService;

import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
public class SellerController {

    @Autowired
    private UserService userService;

    @Autowired
    private SellerService sellerService;

    @Autowired
    private ProductService productService;


    @GetMapping("/profile")
    public ResponseEntity<UserDto> getSellerProfile(Authentication authentication) {
        String email = authentication.getName(); 
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        return ResponseEntity.ok(new UserDto(seller));
    }

    @GetMapping("/profile/stats")
    public ResponseEntity<SellerStatsDto> getSellerStats(Authentication authentication) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        return ResponseEntity.ok(sellerService.getSellerStats(seller));
    }

    @GetMapping("/profile/products/{page}")
    public ResponseEntity<Page<ProductDto>> getSellerProducts(@PathVariable int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = true) Long sellerId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double lowerPriceBound,
            @RequestParam(required = false) Double upperPriceBound,
            @Parameter(description = "Map of characteristics, e.g. ?color=red&size=XL")
            @RequestParam(required = false) Map<String, String> characteristics) {
        Map<String, String> chars = new HashMap<>(characteristics != null ? characteristics : Map.of());
        chars.remove("name");
        chars.remove("categoryId");
        chars.remove("lowerPriceBound");
        chars.remove("upperPriceBound");
        chars.remove("page");
        chars.remove("size");
        chars.remove("sort");
        chars.remove("sellerId");
        Page<ProductDto> productsPage = productService.getProductsPage(
                PageRequest.of(page, size), name, categoryId, lowerPriceBound, upperPriceBound, chars);
        return ResponseEntity.ok(productsPage);
    }

    @GetMapping("/profile/reviews")
    public ResponseEntity<List<ReviewDto>> getSellersReviews(Authentication authentication) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        return ResponseEntity.ok(
                sellerService.getSellersReviews(seller).stream()
                        .map(ReviewDto::new)
                        .toList()
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateSellerProfile(
            Authentication authentication,
            @RequestBody UserDto updateRequest
    ) {
        String email = authentication.getName();
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
    
        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }
    
        User updated = userService.updateSellerProfile(seller, updateRequest);
        return ResponseEntity.ok(new UserDto(updated));
    }
    
    
}
