package com.finale.amazon.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {                  
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(length = 512, nullable = false)
    private String name;

    @Column(length = 8192)
    private String description;

    @Column(nullable = false)
    private double price;           //default currency in $, in perspective implement currency converter

    @Column(nullable = false)
    private double priceWithoutDiscount;

    @Column(columnDefinition = "DATE")
    private LocalDateTime discountLaunchDate;

    @Column(columnDefinition = "DATE")
    private LocalDateTime discountExpirationDate;

    @Column(nullable = false)
    private long quantityInStock;

    @Column(nullable = false)
    private long quantitySold;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategory;


    @ManyToOne
    @JoinColumn(name = "characteristic_type_id")
    private CharacteristicType characteristic;

    @ManyToOne
    @JoinColumn(name = "vendor_id", referencedColumnName = "id")
    private User vendor;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Picture> pictures;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @OneToMany(mappedBy = "product", cascade =  CascadeType.ALL)
    private List<Order> orders;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariation> variations;
}
