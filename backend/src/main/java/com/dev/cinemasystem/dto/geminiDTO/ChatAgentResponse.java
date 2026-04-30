package com.dev.cinemasystem.dto.geminiDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatAgentResponse {
    String reply;
    String type;
    Object payload;
}