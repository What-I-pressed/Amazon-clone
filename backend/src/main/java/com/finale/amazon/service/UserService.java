package com.finale.amazon.service;

import com.finale.amazon.entity.User;
import com.finale.amazon.entity.VerificationToken;
import com.finale.amazon.dto.UserRequestDto;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.entity.Picture;
import com.finale.amazon.entity.Role;
import com.finale.amazon.repository.PictureRepository;
import com.finale.amazon.repository.RoleRepository;
import com.finale.amazon.repository.TokenRepository;
import com.finale.amazon.repository.UserRepository;
import com.finale.amazon.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
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

    @Autowired
    private PictureRepository pictureRepository;

    @Autowired
    private SlugService slugService;

    private final String dirPath = "uploads/pictures/";

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String hashPassword(String password) {
        return passwordEncoder.encode(password);
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
        return passwordEncoder.matches(password, hashedPassword);
    }

    // private void cp(String password, String email){
    // User user = userRepository.findByEmail(email).orElseThrow(() -> new
    // RuntimeException("User not found"));
    // user.setPassword(hashPassword(password));

    // userRepository.save(user);
    // }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
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
        User user = new User();
        user.setUsername(userRequestDto.getUsername());
        user.setEmail(userRequestDto.getEmail());
        user.setDescription(userRequestDto.getDescription());
        user.setBlocked(false);


        Role role = roleRepository.findByName(userRequestDto.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        if (userRequestDto.getPassword() != null && !userRequestDto.getPassword().isEmpty()) {
            System.out.println(userRequestDto.getPassword());
            user.setPassword(hashPassword(userRequestDto.getPassword()));
        } else {
            throw new RuntimeException("Password is required");
        }

        if ("SELLER".equalsIgnoreCase(role.getName())) {
            user.setSlug(generateUniqueSellerSlug());
        }

        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }
        User user = userOpt.get();

        if (!user.isEmailVerified()) {
            throw new RuntimeException("User email is unverified");
        }
        if (user.isBlocked()) {
            throw new RuntimeException("User account is blocked");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            // лог: hash відсутній
            return Optional.empty();
        }

        boolean matches = passwordEncoder.matches(password, user.getPassword());
        System.out.println("Auth attempt for " + email + " — hash-prefix: " + user.getPassword().substring(0, 4) +
                " len=" + user.getPassword().length() + " matches=" + matches);

        if (!matches) {
            return Optional.empty();
        }

        return Optional.of(user);
    }

    public Optional<User> getUserBySlug(String slug) {
        try {
            Optional<User> userOpt = userRepository.findBySlug(slug);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.isBlocked()) {
                    throw new RuntimeException("User is blocked");
                }
                return Optional.of(user);
            }
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String generateUniqueSellerSlug() {
        for (int i = 0; i < 10; i++) {
            String slug = slugService.generateRandomSlug(7);
            if (!userRepository.existsBySlug(slug)) {
                return slug;
            }
        }
        while (true) {
            String slug = slugService.generateRandomSlug(8);
            if (!userRepository.existsBySlug(slug)) {
                return slug;
            }
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

            if (userDetails.getRole() != null && "SELLER".equalsIgnoreCase(userDetails.getRole().getName())) {
                existingUser.setSlug(generateUniqueSellerSlug());
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

    public String authenticateToken(String token) {

        if (jwtUtil.isTokenExpired(token))
            return "Token expired";

        Optional<User> user = getUserByEmail(jwtUtil.extractSubject(token));

        if (!user.get().isEmailVerified()) {
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

    public User updateUserProfile(Long userId, String name, String description) throws IOException {
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (name != null) {
                user.setUsername(name);
            }
            if (description != null) {
                user.setDescription(description);
            }
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    public User updateUserProfile(Long userId, MultipartFile file) throws IOException {
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (file != null) {
                Picture picture = new Picture();
                Files.createDirectories(Paths.get(dirPath));
                String path = UUID.randomUUID().toString() + ".jpg";
                Files.write(Paths.get(dirPath + path), file.getBytes());
                picture.setPath(path);
                picture.setName(file.getOriginalFilename());
                user.setPicture(picture);
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
