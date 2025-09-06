package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductCreationDto;
import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.entity.Product;
import com.finale.amazon.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Отримати сторінку продуктів (нумерація з 0)
    @GetMapping("page/{page}")
    public ResponseEntity<Page<ProductDto>> getProductsPage(@PathVariable int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double lowerPriceBound,
            @RequestParam(required = false) Double upperPriceBound,
            @RequestParam(required = false) Map<String, String> characteristics) {
        Map<String, String> chars = new HashMap<>(characteristics != null ? characteristics : Map.of());
        chars.remove("name");
        chars.remove("categoryId");
        chars.remove("lowerPriceBound");
        chars.remove("upperPriceBound");
        chars.remove("page");
        chars.remove("size");
        chars.remove("sort");

        Page<ProductDto> productsPage = productService.getProductsPage(
                PageRequest.of(page, size), name, categoryId, lowerPriceBound, upperPriceBound, chars);
        return ResponseEntity.ok(productsPage);
    }

    @PostMapping("/create/{sellerId}")
    public ResponseEntity<ProductDto> createProduct(@PathVariable Long sellerId,
                                                    @RequestBody ProductCreationDto productCreationDto) {
        Product product = productService.createProduct(productCreationDto, sellerId);
        return ResponseEntity.ok(new ProductDto(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        Optional<Product> productOpt = productService.getProductById(id);
        return productOpt.map(product -> ResponseEntity.ok(new ProductDto(product)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id,
            @RequestBody ProductCreationDto productCreationDto) {
        Optional<Product> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product updatedProduct = productService.updateProduct(id, productCreationDto);
        return ResponseEntity.ok(new ProductDto(updatedProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Optional<Product> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Page<ProductDto>> getProductsByVendor(
        @PathVariable Long vendorId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size) {
        Page<Product> productsPage = productService.getProductsByVendor(vendorId, PageRequest.of(page, size));
        return ResponseEntity.ok(productsPage.map(ProductDto::new));
}

}
