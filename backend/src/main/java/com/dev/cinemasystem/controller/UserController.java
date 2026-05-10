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
                .message("Tạo người dùng thành công")
                .result(userService.createUser(request))
                .build();
    }

    @PostMapping("/admin")
    ApiResponse<UserResponse> createUserByAdmin(@RequestBody @Valid AdminUserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Tạo người dùng thành công, mã OTP đã được gửi để xác thực email")
                .result(userService.createUserByAdmin(request))
                .build();
    }

    @PostMapping("/admin/verify-email/resend")
    ApiResponse<Void> adminResendCreatedUserVerifyEmailOtp(
            @RequestBody @Valid ResendVerifyEmailRequest request
    ) {
        userService.adminResendCreatedUserVerifyEmailOtp(request);
        return ApiResponse.<Void>builder()
                .message("Đã gửi lại mã OTP xác thực email")
                .build();
    }

    @PostMapping("/admin/verify-email/confirm")
    ApiResponse<UserResponse> adminConfirmCreatedUserVerifyEmail(
            @RequestBody @Valid VerifyEmailRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Xác thực email người dùng thành công")
                .result(userService.adminConfirmCreatedUserVerifyEmail(request))
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable Integer userId) {
        return ApiResponse.<UserResponse>builder()
                .message("Lấy thông tin người dùng thành công")
                .result(userService.getUserById(userId))
                .build();
    }

    @GetMapping("/email/{email}")
    ApiResponse<UserResponse> getUserByEmail(@PathVariable String email) {
        return ApiResponse.<UserResponse>builder()
                .message("Lấy thông tin người dùng thành công")
                .result(userService.getUserByEmail(email))
                .build();
    }

    @PatchMapping("/{userId}")
    ApiResponse<UserResponse> updateUserById(
            @PathVariable Integer userId,
            @RequestBody @Valid UserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Cập nhật người dùng thành công")
                .result(userService.updateUserById(userId, request))
                .build();
    }

    @PatchMapping("/admin/{userId}")
    ApiResponse<UserResponse> updateUserByAdmin(
            @PathVariable Integer userId,
            @RequestBody @Valid AdminUserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Admin cập nhật người dùng thành công")
                .result(userService.updateUserByAdmin(userId, request))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<Boolean> deleteUserById(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("Xóa người dùng thành công")
                .result(true)
                .build();
    }

    @DeleteMapping("/admin/{userId}")
    ApiResponse<Boolean> deleteUserByAdmin(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("Admin xóa người dùng thành công")
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
                .message("Lấy danh sách người dùng thành công")
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
                .message("Lọc người dùng thành công")
                .result(userService.filterUsers(userId, name, role, status, page, size))
                .build();
    }

    @GetMapping("/roles")
    ApiResponse<ItemListDto<String>> getAllRoles() {
        List<String> roles = userService.getAllRoles();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách vai trò thành công")
                .result(ItemListDto.<String>builder().items(roles).build())
                .build();
    }

    @GetMapping("/statuses")
    ApiResponse<ItemListDto<String>> getAllUserStatuses() {
        List<String> statuses = userService.getAllUserStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách trạng thái người dùng thành công")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PostMapping("/change-email/request")
    ApiResponse<Void> requestChangeOwnEmail(@RequestBody @Valid ChangeEmailRequest request) {
        userService.requestChangeOwnEmail(request);
        return ApiResponse.<Void>builder()
                .message("Mã OTP đã được gửi đến email mới")
                .build();
    }

    @PostMapping("/change-email/confirm")
    ApiResponse<LoginResponse> confirmChangeOwnEmail(@RequestBody @Valid ConfirmChangeEmailRequest request) {
        return ApiResponse.<LoginResponse>builder()
                .message("Đổi email thành công")
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
                .message("Mã OTP đã được gửi đến email mới của khách hàng")
                .build();
    }

    @PostMapping("/admin/{userId}/change-email/confirm")
    ApiResponse<UserResponse> adminConfirmChangeUserEmail(
            @PathVariable Integer userId,
            @RequestBody @Valid ConfirmChangeEmailRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Admin đổi email khách hàng thành công")
                .result(userService.adminConfirmChangeUserEmail(userId, request))
                .build();
    }
}


