package com.finale.amazon.service;

import com.finale.amazon.dto.PictureDto;
import com.finale.amazon.entity.Picture;
import com.finale.amazon.entity.Product;
import com.finale.amazon.repository.PictureRepository;
import com.finale.amazon.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PictureService {
    @Autowired
    private PictureRepository pictureRepository;
    @Autowired
    private ProductRepository productRepository;

    public PictureDto savePicture(MultipartFile file, Long productId) throws IOException {
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product with this id was not found"));
        Picture picture = new Picture();
        picture.setName(file.getOriginalFilename());
        picture.setMimeType(file.getContentType());
        picture.setData(file.getBytes());
        picture.setFileSize(file.getSize());
        picture.setProduct(product);

        Picture saved = pictureRepository.save(picture);
        return new PictureDto(saved.getId(), saved.getName(), saved.getMimeType(), saved.getData());
    }

    public Optional<PictureDto> getPicture(Long id) {
        return pictureRepository.findById(id)
                .map(p -> new PictureDto(p.getId(), p.getName(), p.getMimeType(), p.getData()));
    }

    // public List<byte[]> getPicturesByProduct(Long productId){
    //     return pictureRepository.findPictureByProductId(productId)
    //             .map(dto -> ResponseEntity.ok()
    //                     .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + dto.getName() + "\"")
    //                     .contentType(MediaType.parseMediaType(dto.getMimeType()))
    //                     .body(dto.getData()));
    // }
}
