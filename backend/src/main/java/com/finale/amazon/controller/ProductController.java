package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductCreationDto;
import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.dto.ProductFilterDto;
import com.finale.amazon.entity.Product;
import com.finale.amazon.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Tag(name = "Products Controller", description = "Контролер для роботи продуктами")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Отримати сторінку продуктів (нумерація з 0)
    @PostMapping("page/{page}")
    public ResponseEntity<Page<ProductDto>> getProductsPage(Pageable pageable,
            @RequestBody(required = false) ProductFilterDto productFilterDto) {
        Page<ProductDto> productsPage = productService.getProductsPage(
                pageable, productFilterDto.getName(), productFilterDto.getCategoryId(), productFilterDto.getSubcategoryId(),
                productFilterDto.getLowerPriceBound(), productFilterDto.getUpperPriceBound(),
                productFilterDto.getSellerIds(), productFilterDto.getSlugs(), productFilterDto.getCharacteristics());
        return ResponseEntity.ok(productsPage);
    }

    @Operation(summary = "Створити продукт", description = "Створює новий продукт для певного продавця")
    @PostMapping("/create/{sellerId}")
    public ResponseEntity<ProductDto> createProduct(
            @Parameter(description = "ID продавця") @PathVariable Long sellerId,
            @Parameter(description = "DTO продукту") @RequestBody ProductCreationDto productCreationDto) {

        Product product = productService.createProduct(productCreationDto, sellerId);
        return ResponseEntity.ok(new ProductDto(product));
    }

    @Operation(summary = "Отримати продукт за slug", description = "Повертає продукт за його slug")
    @GetMapping("/{slug:.+}")
    public ResponseEntity<ProductDto> getProductBySlug(
            @Parameter(description = "Slug продукту") @PathVariable String slug) {
        Optional<Product> productOpt = productService.getProductBySlug(slug);
        return productOpt.map(product -> ResponseEntity.ok(new ProductDto(product)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Отримати продукт за ID", description = "Повертає продукт за його унікальним ID")
    @GetMapping("/id/{id}")
    public ResponseEntity<ProductDto> getProduct(
            @Parameter(description = "ID продукту") @PathVariable Long id) {

        Optional<Product> productOpt = productService.getProductById(id);
        return productOpt.map(product -> ResponseEntity.ok(new ProductDto(product)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Оновити продукт", description = "Оновлює існуючий продукт за його ID")
    @PutMapping("/update/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @Parameter(description = "ID продукту") @PathVariable Long id,
            @Parameter(description = "DTO продукту для оновлення") @RequestBody ProductCreationDto productCreationDto) {

        Optional<Product> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product updatedProduct = productService.updateProduct(id, productCreationDto);
        return ResponseEntity.ok(new ProductDto(updatedProduct));
    }

    @Operation(summary = "Видалити продукт", description = "Видаляє продукт за його ID")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "ID продукту") @PathVariable Long id) {

        Optional<Product> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Отримати продукти продавця", description = "Повертає список продуктів певного продавця з пагінацією")
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Page<ProductDto>> getProductsByVendor(
            @Parameter(description = "ID продавця") @PathVariable Long vendorId,
            @Parameter(description = "Номер сторінки") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Розмір сторінки") @RequestParam(defaultValue = "12") int size) {

        Page<Product> productsPage = productService.getProductsByVendor(vendorId, PageRequest.of(page, size));
        return ResponseEntity.ok(productsPage.map(ProductDto::new));
    }

}
