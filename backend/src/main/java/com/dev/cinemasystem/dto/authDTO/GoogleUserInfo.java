package com.dev.cinemasystem.dto.authDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleUserInfo {
    String providerId;
    String email;
    String fullName;
}