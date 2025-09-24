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
    private String url;
    private String pictureType;

    public PictureDto(Picture picture) {
        this.id = picture.getId();
        this.name = picture.getName();
        // Path path = Paths.get("uploads/pictures/" + picture.getPath());
        System.out.println(picture.getPath());
        pictureType = picture.getPictureType().getName();

        url = "uploads/pictures/" + picture.getPath();

    }
}
