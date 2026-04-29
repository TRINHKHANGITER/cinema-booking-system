package com.dev.cinemasystem.dto.authDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {

    @NotBlank(message = "EMAIL_BLANK")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "INVALID_REQUEST")
    String otp;

    @NotBlank(message = "PASSWORD_BLANK")
    @Pattern(regexp = ".{8,}", message = "PASSWORD_INVALID")
    String newPassword;
}