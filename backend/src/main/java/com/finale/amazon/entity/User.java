package com.finale.amazon.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
 
    @Column(length = 256)
    private String username;

    @Column(length = 128)
    private String name;

    @Column(length = 20, unique = true)
    private String phone;

    @Column(length = 8192)
    private String description;

    @Column(nullable = false)
    private boolean blocked = false;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @ManyToOne
    @JoinTable(name = "user_role")
    private Role role;

    @Column(length = 512, nullable = false, unique = true)
    private String email;

    @OneToOne(cascade = CascadeType.ALL)
    private Picture picture;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "DATE")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Favourite> favourites;

    @Column(length = 256, unique = true)
    private String slug;

    @Column(length = 512)
    private String url;

}
