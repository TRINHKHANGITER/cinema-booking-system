package com.dev.cinemasystem.service;



import com.dev.cinemasystem.dto.authDTO.*;
import com.dev.cinemasystem.entity.PasswordResetOtp;
import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.enums.Role;
import com.dev.cinemasystem.enums.UserStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.UserMapper;
import com.dev.cinemasystem.repository.PasswordResetOtpRepository;
import com.dev.cinemasystem.repository.UserRepository;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    @NonFinal
    @Value("${jwt.signerKey}")
    protected  String SIGNER_KEY ;

    @NonFinal
    @Value("${app.auth.reset-password-otp-expire-minutes:5}")
    int resetPasswordOtpExpireMinutes;

    UserMapper userMapper;
    UserRepository userRepository;

    GoogleTokenService googleTokenService;

    EmailService emailService;
    PasswordResetOtpRepository passwordResetOtpRepository;
    PasswordEncoder passwordEncoder;



    public boolean introspect (String token)
            throws JOSEException, ParseException {

        boolean isValid = true;
        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }
        return isValid;

    }



    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);
        if (!(verified && expiryTime.after(new Date()))){
            log.error("token invalid or expired");
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        log.info("token verified for user: {}", signedJWT.getJWTClaimsSet().getSubject());
        return signedJWT;
    }


    public LoginResponse authenticate(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!authenticated){
            log.error("Password mismatch for user: {}", request.getEmail());;
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var accessToken = generateToken(user, 24*7);
        var refreshToken = generateToken(user, 24*30);
        UserResponse userResponse = userMapper.toUserResponseFromUser(user);

        log.info("user {} authenticated successfully", user.getEmail());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userResponse)
                .authenticated(true)
                .build();

    }



    public String generateToken(User user, int hours){
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(new Date())
                .issuer("cinemasystem.com")
                .expirationTime(new Date(
                        Instant.now().plus(hours, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", "CUSTOMER")
//                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            log.info("JWT token created successfully");
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("cannot create token");
            throw new RuntimeException(e);
        }
    }


    @Transactional
    public LoginResponse loginGoogle(GoogleLoginRequest request) {
        GoogleUserInfo googleUser = googleTokenService.verify(request.getIdToken());

        User user = userRepository.findByGoogleProviderId(googleUser.getProviderId())
                .orElseGet(() -> userRepository.findByEmail(googleUser.getEmail())
                        .map(existingUser -> {
                            existingUser.setGoogleProviderId(googleUser.getProviderId());

                            if (existingUser.getFullName() == null || existingUser.getFullName().isBlank()) {
                                existingUser.setFullName(googleUser.getFullName());
                            }

                            return userRepository.save(existingUser);
                        })
                        .orElseGet(() -> {
                            User newUser = User.builder()
                                    .fullName(
                                            googleUser.getFullName() != null && !googleUser.getFullName().isBlank()
                                                    ? googleUser.getFullName()
                                                    : googleUser.getEmail()
                                    )
                                    .email(googleUser.getEmail())
                                    .password(null)
                                    .phoneNumber(null)
                                    .role(Role.USER)
                                    .status(UserStatus.ACTIVE)
                                    .googleProviderId(googleUser.getProviderId())
                                    .build();

                            return userRepository.save(newUser);
                        })
                );

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String accessToken = generateToken(user, 24 * 7);
        String refreshToken = generateToken(user, 24 * 30);

        UserResponse userResponse = userMapper.toUserResponseFromUser(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .user(userResponse)
                .build();
    }


    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        var userOpt = userRepository.findByEmail(email);

        // Không báo lỗi nếu email không tồn tại để tránh người khác dò email.
        if (userOpt.isEmpty()) {
            return;
        }

        String otp = generateOtp();

        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .email(email)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(resetPasswordOtpExpireMinutes))
                .used(false)
                .build();

        passwordResetOtpRepository.save(resetOtp);

        emailService.sendForgotPasswordOtp(email, otp, resetPasswordOtpExpireMinutes);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID));

        if (Boolean.TRUE.equals(resetOtp.getUsed())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        boolean otpValid = passwordEncoder.matches(request.getOtp(), resetOtp.getOtpHash());

        if (!otpValid) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetOtp.setUsed(true);
        passwordResetOtpRepository.save(resetOtp);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }


}
