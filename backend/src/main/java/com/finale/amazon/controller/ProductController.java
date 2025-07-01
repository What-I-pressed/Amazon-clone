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


@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("page/{page}")
    public ResponseEntity<Page<ProductDto>> getProductsPage(@PathVariable int page, @RequestParam(defaultValue = "24") int size) {
        return ResponseEntity.ok(productService.getProductsPage(PageRequest.of(page, size)).map(ProductDto::new));
    }

    @PostMapping("/create")
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductCreationDto productCreationDto) {
        Product product = productService.createProduct(productCreationDto);
        return ResponseEntity.ok(new ProductDto(product));
    }
} 