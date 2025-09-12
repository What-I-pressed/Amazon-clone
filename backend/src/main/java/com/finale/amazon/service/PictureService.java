package com.finale.amazon.service;

import com.finale.amazon.dto.PictureDto;
import com.finale.amazon.entity.Picture;
import com.finale.amazon.entity.PictureType;
import com.finale.amazon.entity.Product;
import com.finale.amazon.repository.PictureRepository;
import com.finale.amazon.repository.PictureTypeRepository;
import com.finale.amazon.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PictureService {
    @Autowired
    private PictureRepository pictureRepository;
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PictureTypeRepository pictureTypeRepository;
    private final String dirPath = "uploads/pictures/";

    public PictureDto savePicture(MultipartFile file, Long productId) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product with this id was not found"));
        Picture picture = new Picture();
        if(product.getPictures().isEmpty()){
            picture.setPictureType(pictureTypeRepository.findByName("PRIMARY"));
        }else{
            picture.setPictureType(pictureTypeRepository.findByName("SECONDARY"));
        }   
        Files.createDirectories(Paths.get(dirPath));
        String path = UUID.randomUUID().toString() + ".jpg";
        Files.write(Paths.get(dirPath + path), file.getBytes());
        picture.setPath(path);
        picture.setName(file.getOriginalFilename());
        picture.setProduct(product);

        Picture saved = pictureRepository.save(picture);
        return new PictureDto(saved);
    }

    public Optional<PictureDto> getPicture(Long id) {
        return pictureRepository.findById(id)
                .map(p -> new PictureDto(p));
    }

    // public List<byte[]> getPicturesByProduct(Long productId){
    // return pictureRepository.findPictureByProductId(productId)
    // .map(dto -> ResponseEntity.ok()
    // .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" +
    // dto.getName() + "\"")
    // .contentType(MediaType.parseMediaType(dto.getMimeType()))
    // .body(dto.getData()));
    // }
}
