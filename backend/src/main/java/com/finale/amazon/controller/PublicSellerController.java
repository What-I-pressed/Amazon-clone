package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.SellerService;
import com.finale.amazon.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "*")
@Tag(name = "Public Seller Controller", description = "Публічні ендпоінти для продавців")
public class PublicSellerController {

    @Autowired
    private UserService userService;

    @Autowired
    private SellerService sellerService;

    @Operation(summary = "Отримати публічний профіль продавця за slug", description = "Повертає публічний профіль продавця за унікальним slug")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профіль успішно отримано"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено")
    })
    @GetMapping("/{slug}")
    public ResponseEntity<UserDto> getPublicSellerProfile(
            @Parameter(description = "Slug продавця") @PathVariable String slug) {
        User seller = userService.findSellerBySlug(slug);
        if (seller == null || !"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserDto(seller));
    }

    @Operation(summary = "Отримати товари продавця за slug", description = "Повертає список товарів продавця за його slug з пагінацією")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Товари успішно отримано"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено")
    })
    @GetMapping("/{slug}/products")
    public ResponseEntity<Map<String,Object>> getSellerProducts(
            @Parameter(description = "Slug продавця") @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        User seller = userService.findSellerBySlug(slug);
        if (seller == null || !"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            return ResponseEntity.notFound().build();
        }

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<ProductDto> productsPage = sellerService.getFilteredSellerProductsPage(
                seller.getId(), null, null, "createdAt", "DESC", pageRequest
        );

        Map<String,Object> response = new HashMap<>();
        response.put("content", productsPage.getContent());
        response.put("totalElements", productsPage.getTotalElements());
        response.put("totalPages", productsPage.getTotalPages());
        response.put("currentPage", page);
        response.put("size", size);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Отримати slug продавця за ID", description = "Повертає slug продавця за його ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Slug успішно отримано"),
            @ApiResponse(responseCode = "404", description = "Продавця не знайдено")
    })
    @GetMapping("/id/{id}/slug")
    public ResponseEntity<Map<String, String>> getSellerSlugById(
            @Parameter(description = "ID продавця") @PathVariable Long id) {
        User seller = userService.getUserById(id);
        if (seller == null || !"SELLER".equalsIgnoreCase(seller.getRole().getName())) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("slug", seller.getSlug());
        return ResponseEntity.ok(response);
    }
}
