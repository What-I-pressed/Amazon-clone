package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductStatisticsDto;
import com.finale.amazon.service.StatisticsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/{id}/statistics")
    public ResponseEntity<ProductStatisticsDto> getStatistics(@PathVariable Long id) {
        Optional<ProductStatisticsDto> statsOpt = statisticsService.getStatistics(id);
        if (statsOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(statsOpt.get());
    }
}
