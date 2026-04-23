package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.GioiTinh;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer userId;

    @Column(nullable = false)
    String fullName;

    @Column(nullable = false, unique = true, length = 15)
    String phoneNumber;

    LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    GioiTinh sex;


    @Column(name = "password_hash", nullable = false, length = 255)
    String password;

    @Column(nullable = false, unique = true)
    String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Role role;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;



    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    UserStatus status;
}


