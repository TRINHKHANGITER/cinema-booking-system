package com.dev.cinemasystem.dto.userDto;

import com.dev.cinemasystem.enums.GioiTinh;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.UserStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    GioiTinh sex;
    String email;
    Role role;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UserStatus status;

}
