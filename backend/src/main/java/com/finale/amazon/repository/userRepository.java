package com.finale.amazon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.finale.amazon.entity.User;

@Repository
public interface userRepository extends JpaRepository<User, Long> {
    @Query("Select u from User u where u.role.name = :role and u.email = :gmail and u.password = :password")
    List<User> findUser(@Param("role") String role, @Param("gmail") String gmail,
                        @Param("password") String password);
    
    @Query("Select u from User u where u.role.name = :role")
    List<User> findByRoleName(@Param("role") String role);
}
