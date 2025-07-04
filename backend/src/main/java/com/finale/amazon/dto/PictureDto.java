package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Base64;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PictureDto {
    private Long id;
    private String fileName;
    private String mimeType;
    private long fileSize;
    private String imageUrl;  // URL to fetch image from database
    private String base64Data; // Base64 encoded image data (optional)
    
    // Constructor from Picture entity (with URL only)
    public PictureDto(com.finale.amazon.entity.Picture picture) {
        this.id = picture.getId();
        this.fileName = picture.getFileName();
        this.mimeType = picture.getMimeType();
        this.fileSize = picture.getFileSize();
        this.imageUrl = "/api/images/" + picture.getId();
    }
    
    // Constructor with Base64 data (for small images or when needed)
    public PictureDto(com.finale.amazon.entity.Picture picture, boolean includeBase64) {
        this.id = picture.getId();
        this.fileName = picture.getFileName();
        this.mimeType = picture.getMimeType();
        this.fileSize = picture.getFileSize();
        this.imageUrl = "/api/images/" + picture.getId();
        
        if (includeBase64 && picture.getData() != null) {
            this.base64Data = Base64.getEncoder().encodeToString(picture.getData());
        }
    }
    
    // Constructor for creating new pictures
    public PictureDto(String fileName, String mimeType, long fileSize) {
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
    }
} 