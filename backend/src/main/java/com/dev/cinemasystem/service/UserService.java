package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.authDTO.ResendVerifyEmailRequest;
import com.dev.cinemasystem.dto.authDTO.VerifyEmailRequest;
import com.dev.cinemasystem.dto.authDTO.LoginResponse;
import com.dev.cinemasystem.dto.userDto.AdminUserCreationRequest;
import com.dev.cinemasystem.dto.userDto.AdminUserUpdateRequest;
import com.dev.cinemasystem.dto.userDto.ChangeEmailRequest;
import com.dev.cinemasystem.dto.userDto.ConfirmChangeEmailRequest;
import com.dev.cinemasystem.dto.userDto.UserCreationRequest;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.dto.userDto.UserUpdateRequest;
import com.dev.cinemasystem.entity.OtpToken;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.GioiTinh;
import com.dev.cinemasystem.enums.OtpPurpose;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.UserStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.UserMapper;
import com.dev.cinemasystem.repository.OtpTokenRepository;
import com.dev.cinemasystem.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    @NonFinal
    @Value("${app.auth.change-email-otp-expire-minutes:5}")
    int changeEmailOtpExpireMinutes;

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    OtpTokenRepository otpTokenRepository;
    EmailService emailService;
    AuthenticationService authenticationService;

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

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedPhone = request.getPhoneNumber() == null ? null : request.getPhoneNumber().trim();

        // Validate input status format from request for compatibility, but force pending verify flow.
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            parseUserStatus(request.getStatus());
        }

        User user = User.builder()
                .password(passwordEncoder.encode(request.getPassword()))
                .role(parseRole(request.getRole()))
                .email(normalizedEmail)
                .fullName(request.getFullName())
                .phoneNumber(normalizedPhone)
                .dateOfBirth(request.getDateOfBirth())
                .sex(parseSexNullable(request.getSex()))
                .status(UserStatus.PENDING_VERIFY)
                .build();

        User savedUser = userRepository.save(user);
        authenticationService.resendVerifyEmailOtp(
                ResendVerifyEmailRequest.builder()
                        .email(savedUser.getEmail())
                        .build()
        );

        log.info("Admin created pending user with email: {}", savedUser.getEmail());
        return userMapper.toUserResponseFromUser(savedUser);
    }

    @Transactional
    public void adminResendCreatedUserVerifyEmailOtp(ResendVerifyEmailRequest request) {
        getCurrentAdmin();
        String email = normalizeEmail(request.getEmail());

        User targetUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (targetUser.getStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (targetUser.getStatus() != UserStatus.PENDING_VERIFY) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        authenticationService.resendVerifyEmailOtp(
                ResendVerifyEmailRequest.builder()
                        .email(email)
                        .build()
        );
    }

    @Transactional
    public UserResponse adminConfirmCreatedUserVerifyEmail(VerifyEmailRequest request) {
        getCurrentAdmin();
        String email = normalizeEmail(request.getEmail());

        User targetUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (targetUser.getStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (targetUser.getStatus() != UserStatus.PENDING_VERIFY) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        authenticationService.verifyEmail(
                VerifyEmailRequest.builder()
                        .email(email)
                        .otp(request.getOtp())
                        .build()
        );

        User verifiedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toUserResponseFromUser(verifiedUser);
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
            throw new AppException(ErrorCode.INVALID_REQUEST);
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
            Integer userId,
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

            if (userId != null) {
                predicates.add(builder.equal(root.get("userId"), userId));
            }

            if (name != null && !name.isBlank()) {
                String normalizedKeyword = name.trim().toLowerCase(Locale.ROOT);
                String keywordPattern = "%" + normalizedKeyword + "%";
                String phonePattern = "%" + name.trim() + "%";

                Predicate searchByFullName = builder.like(
                        builder.lower(root.get("fullName")),
                        keywordPattern
                );
                Predicate searchByEmail = builder.like(
                        builder.lower(root.get("email")),
                        keywordPattern
                );
                Predicate searchByPhone = builder.like(
                        root.get("phoneNumber"),
                        phonePattern
                );

                predicates.add(builder.or(searchByFullName, searchByEmail, searchByPhone));
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

    @Transactional
    public void requestChangeOwnEmail(ChangeEmailRequest request) {
        User currentUser = getCurrentUser();

        if (currentUser.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String newEmail = normalizeEmail(request.getNewEmail());
        if (newEmail == null || newEmail.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (currentUser.getEmail().equalsIgnoreCase(newEmail)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        createChangeEmailOtp(currentUser, newEmail);
    }

    @Transactional
    public LoginResponse confirmChangeOwnEmail(ConfirmChangeEmailRequest request) {
        User currentUser = getCurrentUser();
        String newEmail = normalizeEmail(request.getNewEmail());

        OtpToken otpToken = otpTokenRepository
                .findTopByUser_UserIdAndEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                        currentUser.getUserId(),
                        newEmail,
                        OtpPurpose.CHANGE_EMAIL
                )
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID));

        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (!passwordEncoder.matches(request.getOtp().trim(), otpToken.getOtpHash())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        currentUser.setEmail(newEmail);
        User savedUser = userRepository.save(currentUser);

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        return authenticationService.buildLoginResponse(savedUser);
    }

    @Transactional
    public void adminRequestChangeUserEmail(Integer userId, ChangeEmailRequest request) {
        getCurrentAdmin();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (targetUser.getStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        String newEmail = normalizeEmail(request.getNewEmail());
        if (newEmail == null || newEmail.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (targetUser.getEmail().equalsIgnoreCase(newEmail)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        createChangeEmailOtp(targetUser, newEmail);
    }

    @Transactional
    public UserResponse adminConfirmChangeUserEmail(Integer userId, ConfirmChangeEmailRequest request) {
        getCurrentAdmin();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (targetUser.getStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        String newEmail = normalizeEmail(request.getNewEmail());

        OtpToken otpToken = otpTokenRepository
                .findTopByUser_UserIdAndEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                        targetUser.getUserId(),
                        newEmail,
                        OtpPurpose.CHANGE_EMAIL
                )
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID));

        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (!passwordEncoder.matches(request.getOtp().trim(), otpToken.getOtpHash())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        targetUser.setEmail(newEmail);
        User savedUser = userRepository.save(targetUser);

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        return userMapper.toUserResponseFromUser(savedUser);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String email = normalizeEmail(authentication.getName());
        if (email == null || email.isBlank() || "anonymoususer".equals(email)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private User getCurrentAdmin() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return currentUser;
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void createChangeEmailOtp(User user, String newEmail) {
        String otp = generateOtp();

        OtpToken otpToken = OtpToken.builder()
                .user(user)
                .email(newEmail)
                .otpHash(passwordEncoder.encode(otp))
                .purpose(OtpPurpose.CHANGE_EMAIL)
                .expiresAt(LocalDateTime.now().plusMinutes(changeEmailOtpExpireMinutes))
                .used(false)
                .build();

        otpTokenRepository.save(otpToken);
        emailService.sendChangeEmailOtp(newEmail, otp, changeEmailOtpExpireMinutes);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
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


