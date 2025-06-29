package com.finale.amazon.entity;

import java.time.LocalDateTime;
import java.util.List;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
    private String name;

    @Column(length = 8192)
    private String description;

    @ManyToMany
    @JoinTable(name = "user_role",
               joinColumns = @jakarta.persistence.JoinColumn(name = "user_id", referencedColumnName = "id"),
               inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "role_id", referencedColumnName = "id"))
    private List<Role> roles;

    @Column(length = 512, nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "DATE")
    private LocalDateTime createdAt;
}
