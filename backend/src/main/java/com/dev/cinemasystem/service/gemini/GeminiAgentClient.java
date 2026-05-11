package com.dev.cinemasystem.service.gemini;

import com.dev.cinemasystem.configuration.gemini.GeminiApiProperties;
import com.dev.cinemasystem.dto.geminiDTO.GeminiFunctionModels.*;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GeminiAgentClient {

    static final int MAX_RETRIES = 3;
    static final Set<Integer> RETRYABLE_STATUS = Set.of(429, 500, 503);

    GeminiApiProperties properties;
    ObjectMapper objectMapper;
    HttpClient httpClient = HttpClient.newHttpClient();

    public GeminiGenerateResponse generate(List<Object> contents, List<Object> tools) {
        validateConfig();
        String apiUrl = normalizeConfigValue(properties.getUrl());
        String apiKey = normalizeConfigValue(properties.getKey());

        try {
            Map<String, Object> body = Map.of(
                    "systemInstruction", Map.of(
                            "parts", List.of(
                                    Map.of(
                                            "text",
                                            """
                                            Bạn là trợ lý chatbot cho hệ thống bán vé xem phim.
                                            Hãy dùng tools khi cần dữ liệu thật từ hệ thống.
                                            Không tự bịa movieId, movieTypeId, cinemaId hay lịch chiếu.
                                            Nếu cần nhiều bước thì cứ gọi nhiều tool liên tiếp.
                                            Nếu thông tin mơ hồ thì hỏi lại ngắn gọn.
                                            Trả lời bằng tiếng Việt.
                                            """
                                    )
                            )
                    ),
                    "contents", contents,
                    "tools", tools
            );

            String json = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                log.info("=== GEMINI STATUS ===");
                log.info(String.valueOf(response.statusCode()));
                log.info("=== GEMINI RESPONSE BODY ===");
                log.info(response.body());

                int status = response.statusCode();
                if (status >= 200 && status < 300) {
                    return objectMapper.readValue(response.body(), GeminiGenerateResponse.class);
                }

                if (RETRYABLE_STATUS.contains(status) && attempt < MAX_RETRIES) {
                    long waitMs = attempt * 1200L;
                    log.warn("Gemini unavailable (status={}), retry {}/{} in {}ms",
                            status, attempt, MAX_RETRIES, waitMs);
                    Thread.sleep(waitMs);
                    continue;
                }

                throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
            }

            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        } catch (AppException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Gemini retry interrupted", e);
            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        }
    }

    private void validateConfig() {
        String key = normalizeConfigValue(properties.getKey());
        String url = normalizeConfigValue(properties.getUrl());

        if (key == null) {
            throw new AppException(ErrorCode.GEMINI_API_KEY_MISSING);
        }
        if (url == null) {
            throw new AppException(ErrorCode.GEMINI_API_URL_MISSING);
        }
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
}
