package com.dev.cinemasystem.dto.userDto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String fullName;
    String phoneNumber;
    LocalDate dateOfBirth;
    String sex;


}
