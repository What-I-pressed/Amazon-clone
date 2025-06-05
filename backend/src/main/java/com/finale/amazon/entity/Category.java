package com.finale.amazon.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String Name;
    
    @OneToMany(mappedBy = "category", cascade =  CascadeType.ALL)
    public List<Product> products;

    @OneToMany(mappedBy = "category", cascade =  CascadeType.ALL)
    public List<Subcategory> subcategories;
}
