package com.finale.amazon.service;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.CategoryRepository;
import com.finale.amazon.repository.SubcategoryRepository;
import com.finale.amazon.repository.CharacteristicTypeRepository;
import com.finale.amazon.repository.UserRepository;
import com.finale.amazon.repository.PictureRepository;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.ProductCreationDto;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.ProductVariation;

@Service
public class ProductService {

    

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SubcategoryRepository subcategoryRepository;
    @Autowired
    private CharacteristicTypeRepository characteristicTypeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PictureRepository pictureRepository;

    public Page<Product> getProductsPage(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Product createProduct(ProductCreationDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setPriceWithoutDiscount(dto.getPriceWithoutDiscount());
        product.setDiscountLaunchDate(dto.getDiscountLaunchDate());
        product.setDiscountExpirationDate(dto.getDiscountExpirationDate());
        product.setQuantityInStock(dto.getQuantityInStock());
        product.setQuantitySold(0);

        if (dto.getCategoryName() != null) {
            categoryRepository.findByName(dto.getCategoryName()).ifPresent(product::setCategory);
        }
        if (dto.getSubcategoryName() != null) {
            subcategoryRepository.findByName(dto.getSubcategoryName()).ifPresent(product::setSubcategory);
        }
        if (dto.getCharacteristicTypeName() != null) {
            characteristicTypeRepository.findByName(dto.getCharacteristicTypeName()).ifPresent(product::setCharacteristic);
        }
        if (dto.getVendorId() != null) {
            userRepository.findById(dto.getVendorId()).ifPresent(product::setVendor);
        }
        if (dto.getImageIds() != null && !dto.getImageIds().isEmpty()) {
            var pictures = dto.getImageIds().stream()
                .map(pictureRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
            product.setPictures(pictures);
        }
        if (dto.getVariations() != null) {
            product.setVariations(dto.getVariations().stream()
                .map(variationDto -> {
                    ProductVariation variation = new ProductVariation();
                    variation.setQuantityInStock(variationDto.getQuantityInStock());
                    if (variationDto.getCharacteristicValue() != null) {
                        characteristicTypeRepository.findByName(dto.getCharacteristicTypeName())
                            .ifPresent(type -> {
                                type.getValues().stream()
                                    .filter(val -> val.getValue().equals(variationDto.getCharacteristicValue()))
                                    .findFirst()
                                    .ifPresent(variation::setCharacteristic);
                            });
                    }
                    variation.setProduct(product);
                    return variation;
                }).toList());
        }

        return productRepository.save(product);
    }
}
