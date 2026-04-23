package com.dev.cinemasystem.dto.authDTO;


import com.dev.cinemasystem.dto.userDto.UserResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    String accessToken;
    String refreshToken;
    boolean authenticated;
    UserResponse user;
}
