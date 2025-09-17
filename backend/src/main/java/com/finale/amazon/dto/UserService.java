package com.finale.amazon.dto;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private List<User> users = new ArrayList<>();

    public UserService() {
        // Тимчасові користувачі
        users.add(new User("test@example.com", "oldPassword123"));
    }

    public User findByEmail(String email) {
        return users.stream().filter(u -> u.getEmail().equals(email)).findFirst().orElse(null);
    }

    public void updatePassword(String email, String newPassword) {
        User user = findByEmail(email);
        if (user != null) {
            user.setPassword(newPassword);
        }
    }
}
