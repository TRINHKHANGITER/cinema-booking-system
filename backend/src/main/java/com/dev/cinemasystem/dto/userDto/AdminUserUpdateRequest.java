package com.dev.cinemasystem.dto.userDto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserUpdateRequest {
    String fullName;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "PHONE_NUMBER_INVALID")
    String phoneNumber;

    @Email(message = "EMAIL_INVALID")
    String email;

    @Pattern(regexp = ".{8,}", message = "PASSWORD_INVALID")
    String password;

    String role;
    String status;
    LocalDate dateOfBirth;

    @Pattern(regexp = "^(male|female|other)$", message = "SEX_INVALID")
    String sex;
}

