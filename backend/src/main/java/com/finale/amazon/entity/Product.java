package com.finale.amazon.entity;

import java.sql.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
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

    @Column(length = 512)
    private String name;

    @Column(length = 8192)
    private String description;

    private double price;           //default currency in $, in perspective implement currency converter

    private double priceWithoutDiscount;

    @Temporal(TemporalType.TIMESTAMP)
    private Date discountLaunchDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date discountExpirationDate;

    private long quantityInStock;

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
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Picture> pictures;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @OneToMany(mappedBy = "product", cascade =  CascadeType.ALL)
    private List<Order> orders;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<CharacteristicValue> characteristics_value;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariation> variations;
}
