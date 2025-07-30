package com.finale.amazon.controller;

import com.finale.amazon.dto.SellerStatsDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.SellerService;
import com.finale.amazon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
public class SellerController {

    private final UserService userService;
    private final SellerService sellerService;

    @Autowired
    public SellerController(UserService userService, SellerService sellerService) {
        this.userService = userService;
        this.sellerService = sellerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getSellerProfile(@RequestParam String email) {
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        return ResponseEntity.ok(new UserDto(seller));
    }

    @GetMapping("/profile/stats")
    public ResponseEntity<SellerStatsDto> getSellerStats(@RequestParam String email) {
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        return ResponseEntity.ok(sellerService.getSellerStats(seller));
    }

    @GetMapping("/profile/products")
    public ResponseEntity<List<ProductDto>> getSellerProducts(
            @RequestParam String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction
    ) {
        User seller = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (!"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a seller");
        }

        List<ProductDto> products = sellerService.getFilteredSellerProducts(
                seller.getId(), name, categoryId, sortBy, direction
        );

        return ResponseEntity.ok(products);
    }

}
