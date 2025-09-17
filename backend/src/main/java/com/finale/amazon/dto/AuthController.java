package com.finale.amazon.dto;

import com.finale.amazon.dto.User;
import com.finale.amazon.repository.UserRepository;
import com.finale.amazon.dto.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // React фронтенд
public class AuthController {
    // код контролера (реєстрація + верифікація)
}
