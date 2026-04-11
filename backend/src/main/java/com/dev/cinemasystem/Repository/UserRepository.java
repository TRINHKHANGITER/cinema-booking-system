package com.dev.cinemasystem.Repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dev.cinemasystem.Entity.User;
import com.dev.cinemasystem.enums.Status;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    Page<User> findByStatus(Status status, Pageable pageable);

    Optional<User> findByEmail(String email);

}
