package com.finale.amazon.service;

import com.finale.amazon.entity.User;
import com.finale.amazon.entity.VerificationToken;
import com.finale.amazon.dto.UserRequestDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.Role;
import com.finale.amazon.repository.RoleRepository;
import com.finale.amazon.repository.TokenRepository;
import com.finale.amazon.repository.UserRepository;
import com.finale.amazon.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private JwtUtil jwtUtil;
    
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

    public String generateVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(60));
        tokenRepository.save(verificationToken);
        return token;
    }

    
    private boolean verifyPassword(String password, String hashedPassword) {
        
        return hashPassword(password).equals(hashedPassword);
    }

    // private void cp(String password, String email){
    //     User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    //     user.setPassword(hashPassword(password));

    //     userRepository.save(user);
    // }

    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    
    public Optional<User> getUserByEmail(String email) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            if (user.isBlocked()) {
                throw new RuntimeException("User is blocked");
            }
            return Optional.of(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    
    public User createUser(UserRequestDto userRequestDto) {
        try{

            User user = new User();
            user.setUsername(userRequestDto.getUsername());
            user.setEmail(userRequestDto.getEmail());
            user.setPassword(userRequestDto.getPassword());
            user.setDescription(userRequestDto.getDescription());
            user.setBlocked(false);
    
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
            existingUser.setBlocked(userDetails.isBlocked());
            
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
        //cp(password, email);
        if( !user.get().isEmailVerified()){
            throw new RuntimeException("User email is unverified");
        }

        if (user.isPresent() && verifyPassword(password, user.get().getPassword())) {
            if (user.get().isBlocked()) {
                throw new RuntimeException("User account is blocked");
            }
            return user;
        }
        
        return Optional.empty();
    }

        public String authenticateToken(String token) {
        
        if(jwtUtil.isTokenExpired(token)) return "Token expired";

        Optional<User> user = getUserByEmail(jwtUtil.extractSubject(token));


        if( !user.get().isEmailVerified()){
            return "Email is unverified";
        }

        
        if (user.get().isBlocked()) {
            return "User is blocked";
        }
        return null;
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
                user.setEmailVerified(false);
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

    public User blockUser(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setBlocked(true);
            return userRepository.save(user);
        }
        
        throw new RuntimeException("User not found with id: " + userId);
    }

    public User unblockUser(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setBlocked(false);
            return userRepository.save(user);
        }
        
        throw new RuntimeException("User not found with id: " + userId);
    }

    public boolean isUserBlocked(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent() && user.get().isBlocked();
    }

    public List<User> getBlockedUsers() {
        return userRepository.findBlockedUsers();
    }

    public List<User> getActiveUsers() {
        return userRepository.findActiveUsers();
    }

    public List<User> getUsersByBlockedStatus(boolean blocked) {
        return userRepository.findByBlockedStatus(blocked);
    }

    public User updateSellerProfile(User seller, UserDto updateRequest) {
        if (updateRequest.getUsername() != null) {
            seller.setUsername(updateRequest.getUsername());
        }
        if (updateRequest.getDescription() != null) {
            seller.setDescription(updateRequest.getDescription());
        }
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(seller.getEmail())) {
            if (userExistsByEmail(updateRequest.getEmail())) {
                throw new RuntimeException("Email already exists: " + updateRequest.getEmail());
            }
            seller.setEmail(updateRequest.getEmail());
            seller.setEmailVerified(false);
        }
        
        return userRepository.save(seller);
    }
}
