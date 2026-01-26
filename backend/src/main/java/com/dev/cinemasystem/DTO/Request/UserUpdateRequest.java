package com.dev.cinemasystem.dto.Request;

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
    String identityCode;
    LocalDate dateOfBirth;
    String sex;
    String address;

}
