package com.finale.amazon.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationDto {

    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "You need at least 8 characters for the passwords")
    private String password;

    @NotBlank
    @Size(min = 3, max = 256, message = "Nickname should be from 3 to 256 characters long")
    private String username;
}
