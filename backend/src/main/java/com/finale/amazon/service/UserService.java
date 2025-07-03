package com.finale.amazon.service;

import com.finale.amazon.entity.User;
import com.finale.amazon.dto.UserRequestDto;
import com.finale.amazon.entity.Role;
import com.finale.amazon.repository.RoleRepository;
import com.finale.amazon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    
    private boolean verifyPassword(String password, String hashedPassword) {
        return hashPassword(password).equals(hashedPassword);
    }

    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findAll().stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    
    public User createUser(UserRequestDto userRequestDto) {
        try{

            User user = new User();
            user.setUsername(userRequestDto.getUsername());
            user.setEmail(userRequestDto.getEmail());
            user.setPassword(userRequestDto.getPassword());
            user.setDescription(userRequestDto.getDescription());
    
            Role role = roleRepository.findByName(userRequestDto.getRoleName()).orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
            user.setCreatedAt(LocalDateTime.now());
            
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(hashPassword(user.getPassword()));
            }
            else throw new RuntimeException("Password is required");
            
            
            return userRepository.save(user);
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    
    public User updateUser(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);
        
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            if (userDetails.getUsername() != null) {
                existingUser.setUsername(userDetails.getUsername());
            }
            if (userDetails.getDescription() != null) {
                existingUser.setDescription(userDetails.getDescription());
            }
            if (userDetails.getEmail() != null) {
                existingUser.setEmail(userDetails.getEmail());
            }
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                existingUser.setPassword(hashPassword(userDetails.getPassword()));
            }
            if (userDetails.getRole() != null) {
                existingUser.setRole(userDetails.getRole());
            }
            
            return userRepository.save(existingUser);
        }
        
        throw new RuntimeException("User not found with id: " + id);
    }

    
    public void deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        } else {
            throw new RuntimeException("User not found with id: " + id);
        }
    }

    
    public Optional<User> authenticateUser(String email, String password) {
        Optional<User> user = getUserByEmail(email);
        
        if (user.isPresent() && verifyPassword(password, user.get().getPassword())) {
            return user;
        }
        
        return Optional.empty();
    }

   
    public List<User> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName);
    }

    
    public List<User> findUser(String role, String email, String password) {
        return userRepository.findUser(role, email, password);
    }

    
    public boolean userExistsByEmail(String email) {
        return getUserByEmail(email).isPresent();
    }

    
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            
            if (verifyPassword(oldPassword, user.getPassword())) {
                
                user.setPassword(hashPassword(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        
        return false;
    }

    
    public User updateUserProfile(Long userId, String name, String description, String email) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            
            if (name != null) {
                user.setUsername(name);
            }
            if (description != null) {
                user.setDescription(description);
            }
            if (email != null && !email.equals(user.getEmail())) {
                if (userExistsByEmail(email)) {
                    throw new RuntimeException("Email already exists: " + email);
                }
                user.setEmail(email);
            }
            
            return userRepository.save(user);
        }
        
        throw new RuntimeException("User not found with id: " + userId);
    }

    public long getUsersCount() {
        return userRepository.count();
    }

    public boolean hasRole(Long userId, String roleName) {
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent() && 
               user.get().getRole() != null && 
               roleName.equals(user.get().getRole().getName());
    }
}
