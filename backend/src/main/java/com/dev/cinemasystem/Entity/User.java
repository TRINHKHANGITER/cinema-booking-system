package com.dev.cinemasystem.Entity;

import com.dev.cinemasystem.enums.GioiTinh;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.Status;
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

    @Column(unique = true)
    String username;

    LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    GioiTinh sex;


    @Column(nullable = false)
    String password;

    @Column(nullable = false, unique = true)
    String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Role role;

    @Column(nullable = false)
    LocalDate createAt;

    @Column(nullable = false)
    LocalDate updateAt;



    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    Status status;
}
