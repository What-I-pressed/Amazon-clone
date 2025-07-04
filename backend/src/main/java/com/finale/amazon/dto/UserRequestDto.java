package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequestDto {
    private String username;
    private String description;
    private String email;
    private String roleName;
    
    private String password;
    private String oldPassword;
    private String newPassword;
} 