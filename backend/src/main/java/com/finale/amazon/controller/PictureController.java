package com.finale.amazon.controller;

import com.finale.amazon.dto.PictureDto;
import com.finale.amazon.service.PictureService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/pictures")
@RequiredArgsConstructor
@Tag(name = "Pictures Controller", description = "Контролер для роботи з зображеннями продуктів")
public class PictureController {

    private final PictureService pictureService;

    @Operation(summary = "Завантажити зображення продукту", description = "Завантажує зображення для певного продукту")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadPicture(
            @Parameter(description = "Файл зображення") @RequestPart("file") MultipartFile file,
            @Parameter(description = "ID продукту") @RequestParam("ProductId") Long productId) throws IOException {

        pictureService.savePicture(file, productId);
        return ResponseEntity.ok("Picture was successfully loaded");
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<PictureDto> getPicture(@PathVariable Long id) {
    //     return pictureService.getPicture(id)
    //             .map(ResponseEntity::ok)
    //             .orElse(ResponseEntity.notFound().build());
    // }

    @Operation(summary = "Отримати зображення продукту за ID", description = "Повертає зображення продукту у вигляді байтового масиву")
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getRawPicture(
            @Parameter(description = "ID зображення") @PathVariable Long id) {

        return pictureService.getPicture(id)
                .map(dto -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + dto.getName() + "\"")
                        .contentType(MediaType.parseMediaType(dto.getMimeType()))
                        .body(dto.getData()))
                .orElse(ResponseEntity.notFound().build());
    }
}
