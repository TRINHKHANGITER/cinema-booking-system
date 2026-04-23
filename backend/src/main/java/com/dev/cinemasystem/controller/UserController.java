package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.userDto.AdminUserCreationRequest;
import com.dev.cinemasystem.dto.userDto.AdminUserUpdateRequest;
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
                .message("User created successfully")
                .result(userService.createUser(request))
                .build();
    }

    @PostMapping("/admin")
    ApiResponse<UserResponse> createUserByAdmin(@RequestBody @Valid AdminUserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Admin created user successfully")
                .result(userService.createUserByAdmin(request))
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable Integer userId) {
        return ApiResponse.<UserResponse>builder()
                .message("User retrieved successfully")
                .result(userService.getUserById(userId))
                .build();
    }

    @GetMapping("/email/{email}")
    ApiResponse<UserResponse> getUserByEmail(@PathVariable String email) {
        return ApiResponse.<UserResponse>builder()
                .message("User retrieved successfully")
                .result(userService.getUserByEmail(email))
                .build();
    }

    @PatchMapping("/{userId}")
    ApiResponse<UserResponse> updateUserById(
            @PathVariable Integer userId,
            @RequestBody @Valid UserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("User updated successfully")
                .result(userService.updateUserById(userId, request))
                .build();
    }

    @PatchMapping("/admin/{userId}")
    ApiResponse<UserResponse> updateUserByAdmin(
            @PathVariable Integer userId,
            @RequestBody @Valid AdminUserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .message("Admin updated user successfully")
                .result(userService.updateUserByAdmin(userId, request))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<Boolean> deleteUserById(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("User deleted successfully")
                .result(true)
                .build();
    }

    @DeleteMapping("/admin/{userId}")
    ApiResponse<Boolean> deleteUserByAdmin(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("Admin deleted user successfully")
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
                .message("Users retrieved successfully")
                .result(userService.getAllUsers(pageNumber, pageSize, status))
                .build();
    }

    @GetMapping("/admin")
    ApiResponse<PagingDto<UserResponse>> filterUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PagingDto<UserResponse>>builder()
                .message("Users filtered successfully")
                .result(userService.filterUsers(name, role, status, page, size))
                .build();
    }

    @GetMapping("/roles")
    ApiResponse<ItemListDto<String>> getAllRoles() {
        List<String> roles = userService.getAllRoles();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Roles retrieved successfully")
                .result(ItemListDto.<String>builder().items(roles).build())
                .build();
    }

    @GetMapping("/statuses")
    ApiResponse<ItemListDto<String>> getAllUserStatuses() {
        List<String> statuses = userService.getAllUserStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("User statuses retrieved successfully")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }
}

