package com.finale.amazon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariation {             //shloud be a lot of logic with this
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private long quantityInStock;

    @ManyToOne
    @JoinColumn(name = "characteristic_value_id")
    private CharacteristicValue characteristic;
}