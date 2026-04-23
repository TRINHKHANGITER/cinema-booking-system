package com.dev.cinemasystem.dto.userDto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class AdminUserCreationRequest {

    @NotBlank(message = "FULLNAME_BLANK")
    String fullName;

    @NotBlank(message = "PHONE_NUMBER_BLANK")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "PHONE_NUMBER_INVALID")
    String phoneNumber;

    @NotBlank(message = "EMAIL_BLANK")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "PASSWORD_BLANK")
    @Pattern(regexp = ".{8,}", message = "PASSWORD_INVALID")
    String password;

    @NotBlank(message = "ROLE_BLANK")
    String role;

    @NotBlank(message = "USER_STATUS_BLANK")
    String status;

    LocalDate dateOfBirth;

    @Pattern(regexp = "^(male|female|other)$", message = "SEX_INVALID")
    String sex;
}

