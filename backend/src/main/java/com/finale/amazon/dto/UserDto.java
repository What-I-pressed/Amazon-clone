package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.finale.amazon.entity.User;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String name;
    private String phone;
    private String description;
    private String email;
    private String roleName;
    private LocalDateTime createdAt;
    private boolean blocked = false;
    private String slug;
    private String url;
    private SellerStatsDto stats;

    public UserDto(User user){
        this.id = user.getId();
        slug = user.getSlug();
        this.username = user.getUsername();
        this.name = user.getName();
        this.phone = user.getPhone();
        this.description = user.getDescription();
        this.email = user.getEmail();
        this.roleName = user.getRole() != null ? user.getRole().getName() : null;
        this.createdAt = user.getCreatedAt();
        this.blocked = user.isBlocked();
        url = "uploads/pictures/" + (user.getPicture() == null ?  "unathorized.jpg" : user.getPicture().getPath());
    }
}  