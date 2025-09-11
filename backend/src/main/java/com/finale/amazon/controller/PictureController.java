package com.finale.amazon.controller;

import com.finale.amazon.dto.PictureDto;
import com.finale.amazon.service.PictureService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/pictures")
@RequiredArgsConstructor
public class PictureController {

    private final PictureService pictureService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a picture")
    public ResponseEntity<String> uploadPicture(
            @RequestPart("file") MultipartFile file,
            @RequestParam("ProductId") Long productId) throws IOException {
        pictureService.savePicture(file, productId);
        return ResponseEntity.ok("Picture was successfully loaded");
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<PictureDto> getPicture(@PathVariable Long id) {
    //     return pictureService.getPicture(id)
    //             .map(ResponseEntity::ok)
    //             .orElse(ResponseEntity.notFound().build());
    // }

    @GetMapping("/{id}")
    public ResponseEntity<PictureDto> getRawPicture(@PathVariable Long id) {
        return ResponseEntity.ok(pictureService.getPicture(id).orElseThrow(() -> new RuntimeException("Couldnt get picture with id : " + id.toString())));
    }
}
