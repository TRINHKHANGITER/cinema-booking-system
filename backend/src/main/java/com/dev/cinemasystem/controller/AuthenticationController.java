package com.dev.cinemasystem.controller;



import com.dev.cinemasystem.dto.authDTO.GoogleLoginRequest;
import com.dev.cinemasystem.service.AuthenticationService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.authDTO.LoginRequest;
import com.dev.cinemasystem.dto.authDTO.LoginResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    ApiResponse<LoginResponse> authenticate(@RequestBody @Valid LoginRequest request){
        var result =  authenticationService.authenticate(request);
        return ApiResponse.<LoginResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/google")
    ApiResponse<LoginResponse> googleLogin(@RequestBody @Valid GoogleLoginRequest request) {
        var result = authenticationService.loginGoogle(request);
        return ApiResponse.<LoginResponse>builder()
                .message("Google login successfully")
                .result(result)
                .build();
    }

}
