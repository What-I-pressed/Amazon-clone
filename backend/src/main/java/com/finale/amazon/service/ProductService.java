package com.finale.amazon.service;

import java.util.ArrayList;
import java.util.Map;

import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.CategoryRepository;
import com.finale.amazon.repository.SubcategoryRepository;
import com.finale.amazon.repository.CharacteristicTypeRepository;
import com.finale.amazon.repository.UserRepository;
import com.finale.amazon.specification.ProductSpecification;
import com.finale.amazon.repository.PictureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finale.amazon.dto.ProductCreationDto;
import com.finale.amazon.dto.ProductDto;
import com.finale.amazon.entity.CharacteristicType;
import com.finale.amazon.entity.CharacteristicValue;
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

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsPage(Pageable pageable, String name, Long categoryId, Double lowerBound,
            Double upperBound, Map<String, String> characteristics) {
        Map<String, String> filtered = characteristics.entrySet().stream().filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        System.out.println("Name : " + name);

        Specification<Product> spec = Specification.where(null);

        if (name != null) {
            spec = spec.and(ProductSpecification.hasName(name));
        }
        if (categoryId != null) {
            spec = spec.and(ProductSpecification.hasCategory(categoryId));
        }
        if (lowerBound != null && upperBound != null) {
            spec = spec.and(ProductSpecification.priceBetween(lowerBound, upperBound));
        }

        Specification<Product> charSpec = filtered.entrySet().stream()
                .map(entry -> ProductSpecification.matchCharacteristic(entry.getKey(), entry.getValue()))
                .reduce(Specification.where(null), Specification::and);

        spec = spec.and(charSpec);

        Page<Product> page = productRepository.findAll(spec, pageable);
        page.getContent().stream().forEach(prod -> prod.setPictures(pictureRepository.findMainPicture(prod.getId())));
        return page.map(ProductDto::new);
    }

    public Product createProduct(ProductCreationDto dto) {
        Product product = new Product();
        fillProductFromDto(product, dto);
        return productRepository.save(product);
    }

    public void changeQuantity(Product product, Long add){
        if(product.getQuantityInStock() + add < 0) throw new RuntimeException("Unable to order so much");
        product.setQuantityInStock(product.getQuantityInStock() + add);
        if(add < 0) product.setQuantitySold(product.getQuantitySold() - add);
        //productRepository.save(product);
    }

    public void changeQuantitySold(Product product, Long add){
        product.setQuantitySold(product.getQuantitySold() + add);
        productRepository.save(product);
    }

    public Product createProduct(ProductCreationDto dto, Long sellerId) {
        Product product = new Product();
        fillProductFromDto(product, dto);
        userRepository.findById(sellerId).ifPresent(product::setSeller);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductCreationDto dto) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found");
        }
        Product product = optionalProduct.get();
        fillProductFromDto(product, dto);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long productId) {
        return productRepository.findByIdWithPictures(productId);
    }

    public Product findProductById(Long id) {
        return productRepository.findById(id).orElseThrow(()-> new RuntimeException("Product not found"));
    }

    @Transactional(readOnly = true)
    public Page<Product> getProductsByVendor(Long vendorId, Pageable pageable) {
        return productRepository.findBySeller(vendorId, pageable);
    }

    private void fillProductFromDto(Product product, ProductCreationDto dto) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setPriceWithoutDiscount(dto.getPriceWithoutDiscount());
        product.setDiscountLaunchDate(dto.getDiscountLaunchDate());
        product.setDiscountExpirationDate(dto.getDiscountExpirationDate());
        product.setQuantityInStock(dto.getQuantityInStock());
        product.setQuantitySold(0);

        if (dto.getCategoryName() != null) {
            categoryRepository.findByName(dto.getCategoryName().toLowerCase())
                              .ifPresent(product::setCategory);
        }
        if (dto.getSubcategoryName() != null) {
            subcategoryRepository.findByName(dto.getSubcategoryName().toLowerCase())
                                 .ifPresent(product::setSubcategory);
        }
        if (dto.getCharacteristicTypeName() != null) {
            characteristicTypeRepository.findByName(dto.getCharacteristicTypeName().toLowerCase())
                    .ifPresent(product::setCharacteristic);
        }
        if (dto.getSellerId() != null) {
            userRepository.findById(dto.getSellerId()).ifPresent(product::setSeller);
            characteristicTypeRepository.findByName(dto.getCharacteristicTypeName().toLowerCase())
                                        .ifPresent(product::setCharacteristic);
        }

        if(dto.getCharacteristics() != null){
            dto.getCharacteristics().stream().forEach(chare -> {
                Optional<CharacteristicType> exist = characteristicTypeRepository.findByName(chare.getCharacteristic());
                CharacteristicValue val = new CharacteristicValue();
                if(exist.isPresent()){
                    val.setValue(chare.getValue().toLowerCase());
                    val.setProduct(product);
                    val.setCharacteristicType(exist.get());
                }
                else{
                    CharacteristicType typ = new CharacteristicType();
                    typ.setName(chare.getCharacteristic().toLowerCase());
                    val.setValue(chare.getValue().toLowerCase());
                    val.setProduct(product);
                    val.setCharacteristicType(typ);
                }
                if (product.getCharacteristics() == null) {
                    product.setCharacteristics(new ArrayList<>());
                }
                product.getCharacteristics().add(val);
            });
        }

        if (dto.getVariations() != null) {
            product.setVariations(dto.getVariations().stream()
                    .map(variationDto -> {
                        ProductVariation variation = new ProductVariation();
                        variation.setQuantityInStock(variationDto.getQuantityInStock());
                        if (variationDto.getCharacteristicValue() != null) {
                            characteristicTypeRepository.findByName(dto.getCharacteristicTypeName().toLowerCase())
                                    .ifPresent(type -> {
                                        type.getValues().stream()
                                                .filter(val -> val.getValue()
                                                        .equals(variationDto.getCharacteristicValue()))
                                                .findFirst()
                                                .ifPresent(variation::setCharacteristic);
                                    });
                        }
                        variation.setProduct(product);
                        return variation;
                    }).toList());
        }

        productRepository.save(product);
    }

}
