package com.finale.amazon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/custom")
    public ResponseEntity<?> getCustomCharacteristicList(@RequestParam Long subcategoryId){
        return ResponseEntity.ok(characteristicService.belongsToSubcategory(subcategoryId));
    }

    @GetMapping("/sellers/")
    public ResponseEntity<?> getSellersBySubcategoryId(@RequestParam Long subcategoryId){
        return ResponseEntity.ok(sellerService.getBySubcategoryId(subcategoryId));
    }
}
