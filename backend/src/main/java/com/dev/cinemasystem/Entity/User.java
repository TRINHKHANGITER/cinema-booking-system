package com.dev.cinemasystem.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

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

    @Column(unique = true, length = 20)
    String identityCode;

    LocalDate dateOfBirth;

    @Column(length = 10)
    String sex; // MALE / FEMALE / OTHER

    @Column(columnDefinition = "TEXT")
    String address;

    @Column(nullable = false)
    String password;

    @Column(nullable = false, unique = true)
    String email;

    @Column(nullable = false)
    String role; // ADMIN / USER / STAFF

    @Column(nullable = false)
    String status; // ACTIVE / INACTIVE / BLOCKED
}
