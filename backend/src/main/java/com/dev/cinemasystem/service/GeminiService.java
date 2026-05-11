package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.gemini.GeminiApiProperties;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GeminiService {

    static final int MAX_RETRIES = 3;
    static final Set<Integer> RETRYABLE_STATUS = Set.of(429, 500, 503);

    GeminiApiProperties geminiApiProperties;
    RestTemplateBuilder restTemplateBuilder;
    ObjectMapper objectMapper;

    public String ask(String question) {
        String key = normalizeConfigValue(geminiApiProperties.getKey());
        String baseUrl = normalizeConfigValue(geminiApiProperties.getUrl());

        if (key == null) {
            throw new AppException(ErrorCode.GEMINI_API_KEY_MISSING);
        }
        if (baseUrl == null) {
            throw new AppException(ErrorCode.GEMINI_API_URL_MISSING);
        }

        String requestUrl = buildRequestUrl(baseUrl, key);
        RestTemplate restTemplate = restTemplateBuilder.build();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", question)))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                response = restTemplate.postForEntity(requestUrl, requestEntity, String.class);
                break;
            } catch (HttpStatusCodeException exception) {
                int status = exception.getStatusCode().value();
                log.error("Gemini ask upstream error status={} body={}",
                        status,
                        exception.getResponseBodyAsString(),
                        exception
                );

                if (RETRYABLE_STATUS.contains(status) && attempt < MAX_RETRIES) {
                    long waitMs = attempt * 1200L;
                    log.warn("Gemini ask retry {}/{} in {}ms", attempt, MAX_RETRIES, waitMs);
                    sleep(waitMs);
                    continue;
                }

                throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
            } catch (RestClientException exception) {
                log.error("Gemini ask call failed", exception);

                if (attempt < MAX_RETRIES) {
                    long waitMs = attempt * 1200L;
                    log.warn("Gemini ask network retry {}/{} in {}ms", attempt, MAX_RETRIES, waitMs);
                    sleep(waitMs);
                    continue;
                }

                throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
            }
        }

        if (response != null) {
            log.info("=== GEMINI ASK STATUS ===");
            log.info("{}", response.getStatusCode().value());
            log.info("=== GEMINI ASK RESPONSE BODY ===");
            log.info("{}", response.getBody());
        }

        if (response == null || !response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        }

        return extractAnswer(response.getBody());
    }

    private String extractAnswer(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new AppException(ErrorCode.GEMINI_EMPTY_RESPONSE);
            }

            JsonNode textNode = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            String answer = normalizeConfigValue(textNode.asText());
            if (answer == null) {
                throw new AppException(ErrorCode.GEMINI_EMPTY_RESPONSE);
            }

            return answer;
        } catch (AppException exception) {
            throw exception;
        } catch (JsonProcessingException exception) {
            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        }
    }

    private String buildRequestUrl(String baseUrl, String key) {
        if (baseUrl.contains("{key}")) {
            return baseUrl.replace("{key}", URLEncoder.encode(key, StandardCharsets.UTF_8));
        }

        if (baseUrl.contains("key=")) {
            return baseUrl;
        }

        String separator = baseUrl.contains("?") ? "&" : "?";
        return baseUrl + separator + "key=" + URLEncoder.encode(key, StandardCharsets.UTF_8);
    }

    private String normalizeConfigValue(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }

        return trimmed.isEmpty() ? null : trimmed;
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        }
    }
}
