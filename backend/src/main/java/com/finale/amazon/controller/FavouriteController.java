package com.finale.amazon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finale.amazon.security.JwtUtil;
import com.finale.amazon.service.FavouriteService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/favourite")
public class FavouriteController {
    @Autowired
    private FavouriteService favouriteService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/")
    public ResponseEntity<?> getAllByUser(@RequestParam String token){
        return ResponseEntity.ok(favouriteService.getByUser(jwtUtil.extractUserId(token)));
    }

    @PostMapping("/add")
    @Operation(
        summary = "Add favourite item",
        description = "Returns the id of the created favourite item"
    )
    public ResponseEntity<?> add(@RequestParam String token, @RequestParam Long productId){
        return ResponseEntity.ok(favouriteService.Add(jwtUtil.extractUserId(token), productId));
    }

    @DeleteMapping("/delete/{favouriteId}")
    public ResponseEntity<?> delete(@PathVariable Long favouriteId, @RequestParam String token){
        favouriteService.delete(jwtUtil.extractUserId(token), favouriteId);
        return ResponseEntity.ok("Deleted successfully");
    }
}
