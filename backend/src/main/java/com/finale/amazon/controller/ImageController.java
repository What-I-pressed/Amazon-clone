package com.finale.amazon.controller;

import com.finale.amazon.entity.Picture;
import com.finale.amazon.repository.PictureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private PictureRepository pictureRepository;

    @PostMapping("/upload")
    public ResponseEntity<Long> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            Picture picture = new Picture();
            picture.setData(file.getBytes());
            picture.setFileName(file.getOriginalFilename());
            picture.setMimeType(file.getContentType());
            picture.setFileSize(file.getSize());
            
            Picture savedPicture = pictureRepository.save(picture);
            return ResponseEntity.ok(savedPicture.getId());
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        Optional<Picture> picture = pictureRepository.findById(id);
        
        if (picture.isPresent()) {
            Picture pic = picture.get();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(pic.getMimeType()));
            headers.setContentLength(pic.getData().length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pic.getData());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteImage(@PathVariable Long id) {
        if (pictureRepository.existsById(id)) {
            pictureRepository.deleteById(id);
            return ResponseEntity.ok("Image deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 