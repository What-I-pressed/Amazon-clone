package com.finale.amazon.controller;

import com.finale.amazon.dto.ProductStatisticsDto;
import com.finale.amazon.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Statistics Controller", description = "Контролер для статистики продуктів")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Operation(summary = "Отримати статистику продукту")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Статистика успішно отримана"),
            @ApiResponse(responseCode = "404", description = "Продукт не знайдено")
    })
    @GetMapping("/{id}/statistics")
    public ResponseEntity<ProductStatisticsDto> getStatistics(
            @Parameter(description = "ID продукту", required = true)
            @PathVariable Long id) {
        Optional<ProductStatisticsDto> statsOpt = statisticsService.getStatistics(id);
        if (statsOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(statsOpt.get());
    }
}
