package com.finale.amazon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.finale.amazon.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.role.name = :role AND u.email = :gmail AND u.password = :password")
    List<User> findUser(@Param("role") String role, @Param("gmail") String gmail,
                        @Param("password") String password);

    @Query("SELECT u FROM User u WHERE u.role.name = :role")
    List<User> findByRoleName(@Param("role") String role);

    @Query("SELECT u FROM User u WHERE u.blocked = :blocked")
    List<User> findByBlockedStatus(@Param("blocked") boolean blocked);

    @Query("SELECT u FROM User u WHERE u.blocked = true")
    List<User> findBlockedUsers();

    @Query("SELECT u FROM User u WHERE u.blocked = false")
    List<User> findActiveUsers();

    Optional<User> findById(Long id);

    Optional<User> findByEmail(String email);

    Optional<User> findBySlug(String slug);
    boolean existsBySlug(String slug);

    // --- додані методи для email verification ---
    Optional<User> findByEmailAndVerificationCode(String email, String verificationCode);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.emailVerified = true")
    Optional<User> findVerifiedUserByEmail(@Param("email") String email);
}
