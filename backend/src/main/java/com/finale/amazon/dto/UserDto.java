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
    private String description;
    private String email;
    private String roleName;
    private LocalDateTime createdAt;

    public UserDto(User user){
        this.id = user.getId();
        this.username = user.getUsername();
        this.description = user.getDescription();
        this.email = user.getEmail();
        this.roleName = user.getRole() != null ? user.getRole().getName() : null;
        this.createdAt = user.getCreatedAt();
    }
}  