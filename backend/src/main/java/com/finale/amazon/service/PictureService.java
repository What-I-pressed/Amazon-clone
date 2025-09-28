package com.finale.amazon.service;

import com.finale.amazon.dto.PictureDto;
import com.finale.amazon.entity.Picture;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.PictureRepository;
import com.finale.amazon.repository.PictureTypeRepository;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.UserRepository;

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
    @Autowired
    private UserRepository userRepository;
    
    private final String dirPath = "uploads/pictures/";
    private final String avatarDirPath = "uploads/avatars/";

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
    public PictureDto replacePicture(Long pictureId, MultipartFile file) throws IOException {
        Picture picture = pictureRepository.findById(pictureId)
                .orElseThrow(() -> new RuntimeException("Picture not found"));

        Files.deleteIfExists(Paths.get(dirPath + picture.getPath()));
        String path = UUID.randomUUID().toString() + ".jpg";
        Files.write(Paths.get(dirPath + path), file.getBytes());

        picture.setPath(path);
        picture.setName(file.getOriginalFilename());

        Picture saved = pictureRepository.save(picture);
        return new PictureDto(saved);
    }

    public void deletePicture(Long pictureId) throws IOException {
        Picture picture = pictureRepository.findById(pictureId)
                .orElseThrow(() -> new RuntimeException("Picture not found"));

        Files.deleteIfExists(Paths.get(dirPath + picture.getPath()));

        pictureRepository.delete(picture);
    }

    public Optional<PictureDto> getPicture(Long id) {
        return pictureRepository.findById(id)
                .map(p -> new PictureDto(p));
    }

    public String saveSellerAvatar(MultipartFile file, Long sellerId) throws IOException {
        // Verify seller exists by checking if user with sellerId exists
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller with this id was not found"));
        
        Files.createDirectories(Paths.get(avatarDirPath));
        String fileName = "seller_" + sellerId + "_" + UUID.randomUUID().toString() + ".jpg";
        String filePath = avatarDirPath + fileName;
        Files.write(Paths.get(filePath), file.getBytes());
        
        // Update seller's avatar URL in database
        seller.setUrl(fileName);
        userRepository.save(seller);
        
        return fileName;
    }

    public String saveUserAvatar(MultipartFile file, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with this id was not found"));
        
        Files.createDirectories(Paths.get(avatarDirPath));
        String fileName = "user_" + userId + "_" + UUID.randomUUID().toString() + ".jpg";
        String filePath = avatarDirPath + fileName;
        Files.write(Paths.get(filePath), file.getBytes());
        
        // Update user's avatar URL in database
        user.setUrl(fileName);
        userRepository.save(user);
        
        return fileName;
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
