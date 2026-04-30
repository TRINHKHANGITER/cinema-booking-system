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

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GeminiAgentClient {

    GeminiApiProperties properties;
    ObjectMapper objectMapper;
    HttpClient httpClient = HttpClient.newHttpClient();

    public GeminiGenerateResponse generate(List<Object> contents, List<Object> tools) {
        validateConfig();

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
                    .uri(URI.create(properties.getUrl()))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", properties.getKey())
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());


            log.info("=== GEMINI STATUS ===");
            log.info(response.statusCode()+"");

            log.info("=== GEMINI RESPONSE BODY ===");
            log.info(response.body());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
            }

            return objectMapper.readValue(response.body(), GeminiGenerateResponse.class);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new AppException(ErrorCode.GEMINI_API_CALL_FAILED);
        }
    }

    private void validateConfig() {
        if (properties.getKey() == null || properties.getKey().isBlank()) {
            throw new AppException(ErrorCode.GEMINI_API_KEY_MISSING);
        }
        if (properties.getUrl() == null || properties.getUrl().isBlank()) {
            throw new AppException(ErrorCode.GEMINI_API_URL_MISSING);
        }
    }
}
