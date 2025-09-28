package com.finale.amazon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finale.amazon.dto.ProductFilterDto;
import com.finale.amazon.service.CategoryService;
import com.finale.amazon.service.CharacteristicService;
import com.finale.amazon.service.SellerService;

import java.util.Map;

@RestController
@RequestMapping("/api/characteristics")
@CrossOrigin("*")
public class CharacteristicController {
    @Autowired
    private CharacteristicService characteristicService;

    @Autowired
    private SellerService sellerService;

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/custom/")
    public ResponseEntity<?> getCustomCharacteristicList(@RequestBody(required = false) ProductFilterDto productFilterDto){
        if (productFilterDto == null) {
            // No filters provided, return empty result to avoid heavy full-scan
            return ResponseEntity.ok(Map.of());
        }
        return ResponseEntity.ok(characteristicService.findForSpec(productFilterDto.getName(), productFilterDto.getCategoryId(),
                productFilterDto.getSubcategoryId()));
    }

    @PostMapping("/custom")
    public ResponseEntity<?> getCustomCharacteristicListNoSlash(@RequestBody(required = false) ProductFilterDto productFilterDto){
        return getCustomCharacteristicList(productFilterDto);
    }

    @GetMapping("/custom")
    public ResponseEntity<?> getCustomCharacteristicListGet(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subcategoryId
    ){
        if (name == null && categoryId == null && subcategoryId == null) {
            return ResponseEntity.ok(Map.of());
        }
        return ResponseEntity.ok(characteristicService.findForSpec(name, categoryId, subcategoryId));
    }

    @GetMapping("/sellers/")
    public ResponseEntity<?> getSellersBySubcategoryId(@RequestParam Long subcategoryId){
        return ResponseEntity.ok(sellerService.getBySubcategoryId(subcategoryId));
    }

    @GetMapping("/categories/")
    public ResponseEntity<?> getCategories(){
        return ResponseEntity.ok(categoryService.getCategoryList());
    }
}
