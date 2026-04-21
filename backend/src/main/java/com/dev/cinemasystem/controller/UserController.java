package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.userDto.UserUpdateRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.dev.cinemasystem.dto.userDto.UserCreationRequest;
import com.dev.cinemasystem.service.UserService;


@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .message("User created successfully")
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable Integer userId){
        return ApiResponse.<UserResponse>builder()
                .message("User retrieved successfully")
                .result(userService.getUserById(userId))
                .build();
    }


    @GetMapping("/email/{email}")
    ApiResponse<UserResponse> getUserById(@PathVariable String email){
        return ApiResponse.<UserResponse>builder()
                .message("User retrieved successfully")
                .result(userService.getUserByEmail(email))
                .build();
    }



    @PatchMapping("/{userId}")
    ApiResponse<UserResponse> updateUserById(@PathVariable Integer userId, @RequestBody @Valid UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder().
                message("User updated successfully")
                .result(userService.updateUserById(userId, request))
                .build();

    }

    @DeleteMapping("/{userId}")
    ApiResponse<Boolean> deleteUserById(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<Boolean>builder()
                .message("User deleted successfully")
                .build();
    }

    @GetMapping("all")
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
}
