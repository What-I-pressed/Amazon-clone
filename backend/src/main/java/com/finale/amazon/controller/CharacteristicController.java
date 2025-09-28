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
        return ResponseEntity.ok(characteristicService.findForSpec(productFilterDto.getName(), productFilterDto.getCategoryId(),
                productFilterDto.getSubcategoryId()));
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
