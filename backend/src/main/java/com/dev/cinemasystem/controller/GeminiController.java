package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.geminiDTO.GeminiAskRequest;
import com.dev.cinemasystem.dto.geminiDTO.GeminiAskResponse;
import com.dev.cinemasystem.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gemini")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Gemini", description = "API hỏi đáp để kiểm tra Gemini key")
public class GeminiController {

    GeminiService geminiService;

    @PostMapping("/ask")
    @Operation(summary = "Hỏi Gemini", description = "Nhập câu hỏi để kiểm tra GEMINI_API_KEY có hoạt động hay không")
    public ApiResponse<GeminiAskResponse> ask(@RequestBody @Valid GeminiAskRequest request) {
        String answer = geminiService.ask(request.getQuestion().trim());

        return ApiResponse.<GeminiAskResponse>builder()
                .message("Gemini trả lời thành công")
                .result(GeminiAskResponse.builder().answer(answer).build())
                .build();
    }
}
