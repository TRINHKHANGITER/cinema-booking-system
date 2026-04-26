package com.dev.cinemasystem.service.gemini;

import com.dev.cinemasystem.dto.geminiDTO.ChatAgentResponse;
import com.dev.cinemasystem.dto.geminiDTO.GeminiFunctionModels.*;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GeminiToolAgentService {

    GeminiAgentClient geminiAgentClient;
    GeminiToolDeclarationFactory toolDeclarationFactory;
    ChatToolExecutor chatToolExecutor;

    public ChatAgentResponse chat(String userMessage) {
        List<Object> contents = new ArrayList<>();
        contents.add(userTextContent(userMessage));

        String finalReply = null;
        String finalType = "text";
        Object finalPayload = null;

        for (int i = 0; i < 5; i++) {
            GeminiGenerateResponse response =
                    geminiAgentClient.generate(contents, toolDeclarationFactory.buildTools());

            Candidate candidate = firstCandidate(response);
            Content content = candidate.getContent();
            List<Part> parts = content.getParts();

            Part functionCallPart = findFunctionCallPart(parts);
            if (functionCallPart != null && functionCallPart.getFunctionCall() != null) {
                FunctionCall call = functionCallPart.getFunctionCall();
                Map<String, Object> callArgs = call.getArgs() == null ? Map.of() : call.getArgs();

                ToolExecutionResult toolResult =
                        chatToolExecutor.execute(call.getName(), callArgs);

                finalType = toolResult.type();
                finalPayload = toolResult.data();

                contents.add(modelFunctionCallContent(call, callArgs));
                contents.add(userFunctionResponseContent(call, toolResult.data()));
                continue;
            }

            String text = extractText(parts);
            if (text == null || text.isBlank()) {
                throw new AppException(ErrorCode.GEMINI_EMPTY_RESPONSE);
            }

            finalReply = text;
            break;
        }

        if (finalReply == null || finalReply.isBlank()) {
            finalReply = "Mình chưa xử lý xong câu hỏi này, bạn thử hỏi lại cụ thể hơn nhé.";
        }

        return ChatAgentResponse.builder()
                .reply(finalReply)
                .type(finalType)
                .payload(finalPayload)
                .build();
    }

    private Candidate firstCandidate(GeminiGenerateResponse response) {
        if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
            throw new AppException(ErrorCode.GEMINI_EMPTY_RESPONSE);
        }
        return response.getCandidates().get(0);
    }

    private Part findFunctionCallPart(List<Part> parts) {
        if (parts == null) return null;
        for (Part part : parts) {
            if (part.getFunctionCall() != null) {
                return part;
            }
        }
        return null;
    }

    private String extractText(List<Part> parts) {
        if (parts == null) return null;
        StringBuilder sb = new StringBuilder();
        for (Part part : parts) {
            if (part.getText() != null) {
                sb.append(part.getText());
            }
        }
        return sb.toString().trim();
    }

    private Object userTextContent(String userMessage) {
        return Map.of(
                "role", "user",
                "parts", List.of(
                        Map.of("text", userMessage)
                )
        );
    }

    private Object modelFunctionCallContent(FunctionCall call, Map<String, Object> callArgs) {
        Map<String, Object> functionCall = new LinkedHashMap<>();
        if (call.getId() != null && !call.getId().isBlank()) {
            functionCall.put("id", call.getId());
        }
        functionCall.put("name", call.getName());
        functionCall.put("args", callArgs);

        return Map.of(
                "role", "model",
                "parts", List.of(
                        Map.of(
                                "functionCall", functionCall
                        )
                )
        );
    }

    private Object userFunctionResponseContent(FunctionCall call, Object responseData) {
        Map<String, Object> functionResponse = new LinkedHashMap<>();
        if (call.getId() != null && !call.getId().isBlank()) {
            functionResponse.put("id", call.getId());
        }
        functionResponse.put("name", call.getName());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("result", responseData);
        functionResponse.put("response", response);

        return Map.of(
                "role", "user",
                "parts", List.of(
                        Map.of(
                                "functionResponse", functionResponse
                        )
                )
        );
    }
}
