package com.dev.cinemasystem.controller;



import com.dev.cinemasystem.dto.authDTO.*;
import com.dev.cinemasystem.service.AuthenticationService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.service.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    EmailService emailService;

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
                .message("Đăng nhập Google thành công")
                .result(result)
                .build();
    }

    @PostMapping("/register")
    ApiResponse<Void> register(@RequestBody @Valid RegisterRequest request) {
        authenticationService.register(request);

        return ApiResponse.<Void>builder()
                .message("Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.")
                .build();
    }

    @PostMapping("/forgot-password")
    ApiResponse<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);

        return ApiResponse.<Void>builder()
                .message("Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.")
                .build();
    }

    @PostMapping("/reset-password")
    ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authenticationService.resetPassword(request);

        return ApiResponse.<Void>builder()
                .message("Đặt lại mật khẩu thành công")
                .build();
    }

    @PostMapping("/resend-verify-email")
    ApiResponse<Void> resendVerifyEmail(@RequestBody @Valid ResendVerifyEmailRequest request) {
        authenticationService.resendVerifyEmailOtp(request);

        return ApiResponse.<Void>builder()
                .message("Mã OTP xác thực đã được gửi tới email của bạn.")
                .build();
    }

    @PostMapping("/verify-email")
    ApiResponse<Void> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        authenticationService.verifyEmail(request);

        return ApiResponse.<Void>builder()
                .message("Xác thực email thành công")
                .build();
    }



}
