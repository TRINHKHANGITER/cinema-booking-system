package com.dev.cinemasystem.dto.Response;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    Integer userId;
    String fullName;
    String phoneNumber;
    LocalDate dateOfBirth;
    String sex;
    String address;
    String email;
    String status;

}
