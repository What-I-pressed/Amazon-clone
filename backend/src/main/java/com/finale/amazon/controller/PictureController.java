package com.finale.amazon.controller;

import com.finale.amazon.dto.PictureDto;
import com.finale.amazon.service.PictureService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/pictures")
@CrossOrigin(
    origins = {"http://localhost:5173"},
    allowedHeaders = {"*"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
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

    @Operation(summary = "Завантажити аватар продавця", description = "Завантажує аватар для певного продавця")
    @PostMapping(value = "/upload/seller/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadSellerAvatar(
            @Parameter(description = "Файл зображення") @RequestPart("file") MultipartFile file,
            @Parameter(description = "ID продавця") @RequestParam("SellerId") Long sellerId) throws IOException {

        String avatarPath = pictureService.saveSellerAvatar(file, sellerId);
        return ResponseEntity.ok(avatarPath);
    }

    @Operation(summary = "Завантажити аватар користувача", description = "Завантажує аватар для певного користувача")
    @PostMapping(value = "/upload/user/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadUserAvatar(
            @Parameter(description = "Файл зображення") @RequestPart("file") MultipartFile file,
            @Parameter(description = "ID користувача") @RequestParam("UserId") Long userId) throws IOException {

        String avatarPath = pictureService.saveUserAvatar(file, userId);
        return ResponseEntity.ok(avatarPath);
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<PictureDto> getPicture(@PathVariable Long id) {
    //     return pictureService.getPicture(id)
    //             .map(ResponseEntity::ok)
    //             .orElse(ResponseEntity.notFound().build());
    // }

    @Operation(summary = "Отримати зображення продукту за ID", description = "Повертає DTO з інформацією про зображення продукту")
    @GetMapping("/{id}")
    public ResponseEntity<PictureDto> getRawPicture(@PathVariable Long id) {
        return ResponseEntity.ok(pictureService.getPicture(id).orElseThrow(() -> new RuntimeException("Couldnt get picture with id : " + id.toString())));
    }

     @Operation(summary = "Замінити зображення продукту", description = "Заміна існуючого зображення новим файлом")
    @PutMapping(value = "/{id}/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> replacePicture(
            @Parameter(description = "ID зображення для заміни") @PathVariable Long id,
            @Parameter(description = "Новий файл зображення") @RequestPart("file") MultipartFile file) throws IOException {
        pictureService.replacePicture(id, file);
        return ResponseEntity.ok("Picture was successfully replaced");
    }

    @Operation(summary = "Видалити зображення продукту", description = "Видаляє зображення за ID і файл з диску")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePicture(
            @Parameter(description = "ID зображення для видалення") @PathVariable Long id) throws IOException {
        pictureService.deletePicture(id);
        return ResponseEntity.ok("Picture was successfully deleted");
    }
}
