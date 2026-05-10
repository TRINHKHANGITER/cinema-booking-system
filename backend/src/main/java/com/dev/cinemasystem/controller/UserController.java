package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.authDTO.LoginResponse;
import com.dev.cinemasystem.dto.authDTO.ResendVerifyEmailRequest;
import com.dev.cinemasystem.dto.authDTO.VerifyEmailRequest;
import com.dev.cinemasystem.dto.userDto.AdminUserCreationRequest;
import com.dev.cinemasystem.dto.userDto.AdminUserUpdateRequest;
import com.dev.cinemasystem.dto.userDto.ChangeEmailRequest;
import com.dev.cinemasystem.dto.userDto.ConfirmChangeEmailRequest;
import com.dev.cinemasystem.dto.userDto.UserCreationRequest;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.dto.userDto.UserUpdateRequest;
import com.dev.cinemasystem.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Táº¡o ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.createUser(request))
                .build();
    }

    @PostMapping("/admin")
    ApiResponse<UserResponse> createUserByAdmin(@RequestBody @Valid AdminUserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Táº¡o ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng, mÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘á»ƒ xÃ¡c thá»±c email")
                .result(userService.createUserByAdmin(request))
                .build();
    }

    @PostMapping("/admin/verify-email/resend")
    ApiResponse<Void> adminResendCreatedUserVerifyEmailOtp(
            @RequestBody @Valid ResendVerifyEmailRequest request
    ) {
        userService.adminResendCreatedUserVerifyEmailOtp(request);
        return ApiResponse.<Void>builder()
                .message("ÄÃ£ gá»­i láº¡i mÃ£ OTP xÃ¡c thá»±c email")
                .build();
    }

    @PostMapping("/admin/verify-email/confirm")
    ApiResponse<UserResponse> adminConfirmCreatedUserVerifyEmail(
            @RequestBody @Valid VerifyEmailRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("XÃ¡c thá»±c email ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.adminConfirmCreatedUserVerifyEmail(request))
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable Integer userId) {
        return ApiResponse.<UserResponse>builder()
                .message("Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.getUserById(userId))
                .build();
    }

    @GetMapping("/email/{email}")
    ApiResponse<UserResponse> getUserByEmail(@PathVariable String email) {
        return ApiResponse.<UserResponse>builder()
                .message("Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.getUserByEmail(email))
                .build();
    }

    @PatchMapping("/{userId}")
    ApiResponse<UserResponse> updateUserById(
            @PathVariable Integer userId,
            @RequestBody @Valid UserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Cáº­p nháº­t ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.updateUserById(userId, request))
                .build();
    }

    @PatchMapping("/admin/{userId}")
    ApiResponse<UserResponse> updateUserByAdmin(
            @PathVariable Integer userId,
            @RequestBody @Valid AdminUserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Admin cáº­p nháº­t ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.updateUserByAdmin(userId, request))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<Boolean> deleteUserById(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(true)
                .build();
    }

    @DeleteMapping("/admin/{userId}")
    ApiResponse<Boolean> deleteUserByAdmin(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("Admin xÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(true)
                .build();
    }

    @GetMapping("/all")
    ApiResponse<PagingDto<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.<PagingDto<UserResponse>>builder()
                .message("Láº¥y danh sÃ¡ch ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.getAllUsers(pageNumber, pageSize, status))
                .build();
    }

    @GetMapping("/admin")
    ApiResponse<PagingDto<UserResponse>> filterUsers(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PagingDto<UserResponse>>builder()
                .message("Lá»c ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(userService.filterUsers(userId, name, role, status, page, size))
                .build();
    }

    @GetMapping("/roles")
    ApiResponse<ItemListDto<String>> getAllRoles() {
        List<String> roles = userService.getAllRoles();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch vai trÃ² thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(roles).build())
                .build();
    }

    @GetMapping("/statuses")
    ApiResponse<ItemListDto<String>> getAllUserStatuses() {
        List<String> statuses = userService.getAllUserStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PostMapping("/change-email/request")
    ApiResponse<Void> requestChangeOwnEmail(@RequestBody @Valid ChangeEmailRequest request) {
        userService.requestChangeOwnEmail(request);
        return ApiResponse.<Void>builder()
                .message("MÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n email má»›i")
                .build();
    }

    @PostMapping("/change-email/confirm")
    ApiResponse<LoginResponse> confirmChangeOwnEmail(@RequestBody @Valid ConfirmChangeEmailRequest request) {
        return ApiResponse.<LoginResponse>builder()
                .message("Äá»•i email thÃ nh cÃ´ng")
                .result(userService.confirmChangeOwnEmail(request))
                .build();
    }

    @PostMapping("/admin/{userId}/change-email/request")
    ApiResponse<Void> adminRequestChangeUserEmail(
            @PathVariable Integer userId,
            @RequestBody @Valid ChangeEmailRequest request
    ) {
        userService.adminRequestChangeUserEmail(userId, request);
        return ApiResponse.<Void>builder()
                .message("MÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n email má»›i cá»§a khÃ¡ch hÃ ng")
                .build();
    }

    @PostMapping("/admin/{userId}/change-email/confirm")
    ApiResponse<UserResponse> adminConfirmChangeUserEmail(
            @PathVariable Integer userId,
            @RequestBody @Valid ConfirmChangeEmailRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Admin Ä‘á»•i email khÃ¡ch hÃ ng thÃ nh cÃ´ng")
                .result(userService.adminConfirmChangeUserEmail(userId, request))
                .build();
    }
}


