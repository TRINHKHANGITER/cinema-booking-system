package com.dev.cinemasystem.dto.ticket;

import com.dev.cinemasystem.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketStatusUpdateRequest {
    @NotNull(message = "INVALID_REQUEST")
    TicketStatus status;
}
