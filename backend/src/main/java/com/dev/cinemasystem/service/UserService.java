package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.userDto.AdminUserCreationRequest;
import com.dev.cinemasystem.dto.userDto.AdminUserUpdateRequest;
import com.dev.cinemasystem.dto.userDto.UserCreationRequest;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.dto.userDto.UserUpdateRequest;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.GioiTinh;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.UserStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.UserMapper;
import com.dev.cinemasystem.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        ensureEmailAndPhoneAvailable(request.getEmail(), request.getPhoneNumber(), null);

        User user = User.builder()
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .sex(parseSexNullable(request.getSex()))
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Creating customer user with email: {}", savedUser.getEmail());
        return userMapper.toUserResponseFromUser(savedUser);
    }

    public UserResponse createUserByAdmin(AdminUserCreationRequest request) {
        ensureEmailAndPhoneAvailable(request.getEmail(), request.getPhoneNumber(), null);

        User user = User.builder()
                .password(passwordEncoder.encode(request.getPassword()))
                .role(parseRole(request.getRole()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .sex(parseSexNullable(request.getSex()))
                .status(parseUserStatus(request.getStatus()))
                .build();

        User savedUser = userRepository.save(user);
        log.info("Admin created user with email: {}", savedUser.getEmail());
        return userMapper.toUserResponseFromUser(savedUser);
    }

    public UserResponse getUserById(Integer userId) {
        User user = getUserOrThrow(userId);
        log.info("Fetched user with id {}", userId);
        return userMapper.toUserResponseFromUser(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> {
            log.error("User with email {} not found", email);
            return new AppException(ErrorCode.USER_NOT_FOUND);
        });
        log.info("Fetched user with email {}", email);
        return userMapper.toUserResponseFromUser(user);
    }

    public UserResponse updateUserById(Integer userId, UserUpdateRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            String nextPhone = request.getPhoneNumber().trim();
            if (!nextPhone.equals(user.getPhoneNumber())
                    && userRepository.existsByPhoneNumberAndUserIdNot(nextPhone, userId)) {
                throw new AppException(ErrorCode.PHONE_NUMBER_EXISTS);
            }
            user.setPhoneNumber(nextPhone);
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getSex() != null) {
            user.setSex(parseSexNullable(request.getSex()));
        }

        User savedUser = userRepository.save(user);
        return userMapper.toUserResponseFromUser(savedUser);
    }

    public UserResponse updateUserByAdmin(Integer userId, AdminUserUpdateRequest request) {
        User user = getUserOrThrow(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null) {
            String nextEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!nextEmail.equalsIgnoreCase(user.getEmail())
                    && userRepository.existsByEmailAndUserIdNot(nextEmail, userId)) {
                throw new AppException(ErrorCode.EMAIL_EXISTS);
            }
            user.setEmail(nextEmail);
        }

        if (request.getPhoneNumber() != null) {
            String nextPhone = request.getPhoneNumber().trim();
            if (!nextPhone.equals(user.getPhoneNumber())
                    && userRepository.existsByPhoneNumberAndUserIdNot(nextPhone, userId)) {
                throw new AppException(ErrorCode.PHONE_NUMBER_EXISTS);
            }
            user.setPhoneNumber(nextPhone);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(parseRole(request.getRole()));
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(parseUserStatus(request.getStatus()));
        }

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getSex() != null) {
            user.setSex(parseSexNullable(request.getSex()));
        }

        User savedUser = userRepository.save(user);
        log.info("Admin updated user with id {}", userId);
        return userMapper.toUserResponseFromUser(savedUser);
    }

    public boolean deleteUserById(Integer userId) {
        User user = getUserOrThrow(userId);
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
        log.info("Deleted user with id {}", userId);
        return true;
    }

    public PagingDto<UserResponse> getAllUsers(int page, int size, String status) {
        validatePageAndSize(page, size);
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<User> userPage;
        if (status == null || status.isBlank()) {
            userPage = userRepository.findAll(pageable);
        } else {
            UserStatus parsedStatus = parseUserStatus(status);
            userPage = userRepository.findByStatus(parsedStatus, pageable);
        }

        return mapToPaging(userPage);
    }

    public PagingDto<UserResponse> filterUsers(
            String name,
            String role,
            String status,
            int page,
            int size
    ) {
        validatePageAndSize(page, size);
        Pageable pageable = PageRequest.of(page - 1, size);

        Specification<User> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("fullName")), keyword));
            }

            if (role != null && !role.isBlank()) {
                predicates.add(builder.equal(root.get("role"), parseRole(role)));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseUserStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(specification, pageable);
        return mapToPaging(userPage);
    }

    public List<String> getAllRoles() {
        return Arrays.stream(Role.values())
                .map(Enum::name)
                .toList();
    }

    public List<String> getAllUserStatuses() {
        return Arrays.stream(UserStatus.values())
                .map(Enum::name)
                .toList();
    }

    private User getUserOrThrow(Integer userId) {
        return userRepository.findById(userId).orElseThrow(() -> {
            log.error("User with id {} not found", userId);
            return new AppException(ErrorCode.USER_NOT_FOUND);
        });
    }

    private void validatePageAndSize(int page, int size) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }

        if (size < 1 || size > 100) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
    }

    private void ensureEmailAndPhoneAvailable(String email, String phoneNumber, Integer excludedUserId) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        String normalizedPhone = phoneNumber == null ? null : phoneNumber.trim();

        boolean emailExists = excludedUserId == null
                ? userRepository.existsByEmail(normalizedEmail)
                : userRepository.existsByEmailAndUserIdNot(normalizedEmail, excludedUserId);
        if (emailExists) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        boolean phoneExists = excludedUserId == null
                ? userRepository.existsByPhoneNumber(normalizedPhone)
                : userRepository.existsByPhoneNumberAndUserIdNot(normalizedPhone, excludedUserId);
        if (phoneExists) {
            throw new AppException(ErrorCode.PHONE_NUMBER_EXISTS);
        }
    }

    private Role parseRole(String value) {
        try {
            return Role.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private UserStatus parseUserStatus(String value) {
        try {
            return UserStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private GioiTinh parseSexNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return GioiTinh.valueOf(value.trim().toLowerCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new AppException(ErrorCode.SEX_INVALID);
        }
    }

    private PagingDto<UserResponse> mapToPaging(Page<User> userPage) {
        List<UserResponse> items = userPage.getContent().stream()
                .map(userMapper::toUserResponseFromUser)
                .toList();

        return PagingDto.<UserResponse>builder()
                .items(items)
                .totalItems(userPage.getTotalElements())
                .currentPage(userPage.getNumber() + 1)
                .pageSize(userPage.getSize())
                .totalPages(userPage.getTotalPages())
                .build();
    }
}

