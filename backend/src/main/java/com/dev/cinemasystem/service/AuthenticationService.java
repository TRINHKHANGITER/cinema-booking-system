package com.dev.cinemasystem.service;



import com.dev.cinemasystem.entity.User;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.UserMapper;
import com.dev.cinemasystem.repository.UserRepository;
import com.dev.cinemasystem.dto.authDTO.LoginRequest;
import com.dev.cinemasystem.dto.authDTO.LoginResponse;
import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.text.ParseException;
import java.time.Instant;
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

    UserMapper userMapper;
    UserRepository userRepository;



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
        User user = userRepository.findByUsername(request.getEmail())
                .orElse(null);
        if(user == null){
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        }

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!authenticated){
            log.error("Password mismatch for user: {}", request.getEmail());;
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var accessToken = generateToken(user, 24*7);
        var refreshToken = generateToken(user, 24*30);
        UserResponse userResponse = userMapper.toUserResponseFromUser(user);

        log.info("user {} authenticated successfully", user.getUsername());
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
                .subject(user.getUsername())
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


}
