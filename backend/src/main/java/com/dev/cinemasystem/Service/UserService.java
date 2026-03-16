package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.userDto.UserCreationRequest;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.dto.userDto.UserUpdateRequest;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dev.cinemasystem.Entity.User;
import com.dev.cinemasystem.Mapper.UserMapper;
import com.dev.cinemasystem.Repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;


    public UserResponse createUser(UserCreationRequest request){
        if(userRepository.existsByUsername(request.getUsername())){
            log.error("Username {} is already taken", request.getUsername());
            throw new AppException(ErrorCode.USERNAME_EXISTS);
        }
        if(userRepository.existsByEmail(request.getEmail())){
            log.error("Email {} is already in use", request.getEmail());
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        if(userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            log.error("Phone number {} is already in use", request.getPhoneNumber());
            throw new AppException(ErrorCode.PHONE_NUMBER_EXISTS);
        }
        User user = User.builder()
             .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.customer)
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .createAt(LocalDate.now())
                .updateAt(LocalDate.now())
                .status(Status.active)
                .build();
        userRepository.save(user);
        log.info("Creating user with email: {}", user.getEmail());
        return userMapper.toUserResponseFromUser(userRepository.save(user));
    }


    public UserResponse getUserById(Integer userId){
        User user = userRepository.findById(userId).orElseThrow(()->{
            log.error("User with id {} not found", userId);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        });
        log.info("Fetched user with id {}, username {}", userId, user.getUsername());
        return userMapper.toUserResponseFromUser(user);
    }

    public UserResponse getUserByEmail(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()->{
            log.error("User with email {} not found", email);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        });
        log.info("Fetched user with email {}", email);
        return userMapper.toUserResponseFromUser(user);
    }

    public UserResponse getUserByUsername(String username){
        User user = userRepository.findByUsername(username).orElseThrow(()->{
            log.error("User with username {} not found", username);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        });
        log.info("Fetched user with username {}", username);
        return userMapper.toUserResponseFromUser(user);
    }

    public UserResponse updateUserById(Integer userId, UserUpdateRequest request){
        User user = userRepository.findById(userId).orElseThrow(()->{
            log.error("User with id {} not found", userId);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        });
        log.info("Fetched user with id {} username {}", userId, user.getUsername());
        userMapper.updateUserInfo( user, request);
        user.setUpdateAt(LocalDate.now());
        return userMapper.toUserResponseFromUser(userRepository.save(user));
    }

    public boolean deleteUserById(Integer userId){
        User user = userRepository.findById(userId).orElseThrow(()->{
            log.error("User with id {} not found", userId);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        });
        user.setStatus(Status.deleted);
        user.setUpdateAt(LocalDate.now());
        userRepository.save(user);
        log.info("Deleted user with id {}", userId);
        return true;
    }


    public PagingDto<UserResponse> getAllUsers(int page, int size, String status) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 || size > 10) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);


        Page<User> userPage;
        if (status == null || status.isBlank()) {
            userPage = userRepository.findAll(pageable);
        } else {
            userPage = userRepository.findByStatus(status, pageable);
        }

        List<UserResponse> items = userPage.getContent()
                .stream()
                .map(userMapper::toUserResponseFromUser)
                .toList();

        log.info("Fetched {} users", items.size());
        return new PagingDto<>(
                items,
                userPage.getTotalElements(),
                userPage.getNumber() + 1,
                userPage.getSize(),
                userPage.getTotalPages()
        );
    }



}
