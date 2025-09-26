package com.finale.amazon.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank
    @Size(min = 2, max = 128, message = "Name should be from 2 to 128 characters long")
    private String name;
    
    @Pattern(regexp = "\\+?[0-9]{7,20}", message = "Phone number must be 7-20 digits, optional + at start")
    private String phone;

}
