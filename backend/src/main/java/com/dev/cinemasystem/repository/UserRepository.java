package com.dev.cinemasystem.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.UserStatus;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmailAndUserIdNot(String email, Integer userId);
    boolean existsByPhoneNumberAndUserIdNot(String phoneNumber, Integer userId);
    Page<User> findByStatus(UserStatus status, Pageable pageable);

    Optional<User> findByEmail(String email);

}

