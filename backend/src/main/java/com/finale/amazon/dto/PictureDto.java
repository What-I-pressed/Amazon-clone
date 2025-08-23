package com.finale.amazon.dto;

import com.finale.amazon.entity.Picture;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PictureDto {
    private Long id;
    private String name;
    private String mimeType;
    private byte[] data;

    public PictureDto(Picture picture) {
        this.id = picture.getId();
        this.name = picture.getName();
        this.mimeType = picture.getMimeType();
        this.data = picture.getData();
    }
}
