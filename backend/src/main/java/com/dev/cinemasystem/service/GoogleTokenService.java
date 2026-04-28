package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.authDTO.GoogleUserInfo;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleTokenService {

    @Value("${google.client-id}")
    String googleClientId;

    public GoogleUserInfo verify(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                throw new AppException(ErrorCode.ID_TOKEN_INVALID);
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            Boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());

            if (!emailVerified) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            return GoogleUserInfo.builder()
                    .providerId(payload.getSubject())
                    .email(payload.getEmail())
                    .fullName((String) payload.get("name"))
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
    }
}