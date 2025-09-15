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
    @Query("Select u from User u where u.role.name = :role and u.email = :gmail and u.password = :password")
    List<User> findUser(@Param("role") String role, @Param("gmail") String gmail,
                        @Param("password") String password);
    
    @Query("Select u from User u where u.role.name = :role")
    List<User> findByRoleName(@Param("role") String role);
    
    @Query("Select u from User u where u.blocked = :blocked")
    List<User> findByBlockedStatus(@Param("blocked") boolean blocked);
    
    @Query("Select u from User u where u.blocked = true")
    List<User> findBlockedUsers();
    
    @Query("Select u from User u where u.blocked = false")
    List<User> findActiveUsers();

    Optional<User> findById(Long id);
    
    Optional<User> findByEmail(String email);

    Optional<User> findBySlug(String slug);
    boolean existsBySlug(String slug);
}

 