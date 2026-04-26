package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.geminiDTO.ChatAgentRequest;
import com.dev.cinemasystem.dto.geminiDTO.ChatAgentResponse;
import com.dev.cinemasystem.dto.geminiDTO.GeminiAskRequest;
import com.dev.cinemasystem.dto.geminiDTO.GeminiAskResponse;
import com.dev.cinemasystem.service.GeminiService;
import com.dev.cinemasystem.service.gemini.GeminiToolAgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gemini")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Gemini", description = "API hỏi đáp để kiểm tra Gemini key")
public class GeminiController {

    GeminiService geminiService;
    GeminiToolAgentService geminiToolAgentService;

    @PostMapping("/ask")
    @Operation(summary = "Hỏi Gemini", description = "Nhập câu hỏi để kiểm tra GEMINI_API_KEY có hoạt động hay không")
    public ApiResponse<GeminiAskResponse> ask(@RequestBody @Valid GeminiAskRequest request) {
        String answer = geminiService.ask(request.getQuestion().trim());

        return ApiResponse.<GeminiAskResponse>builder()
                .message("Gemini trả lời thành công")
                .result(GeminiAskResponse.builder().answer(answer).build())
                .build();
    }

    @PostMapping("/agent")
    @Operation(summary = "Gemini agent with tool calling")
    public ApiResponse<ChatAgentResponse> agent(@RequestBody @Valid ChatAgentRequest request) {
        return ApiResponse.<ChatAgentResponse>builder()
                .message("Gemini agent trả lời thành công")
                .result(geminiToolAgentService.chat(request.getMessage().trim()))
                .build();
    }
}