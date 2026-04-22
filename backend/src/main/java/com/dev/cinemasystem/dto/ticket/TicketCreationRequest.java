package com.dev.cinemasystem.dto.ticket;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCreationRequest {
    int orderId;

    int showTimeId;

    int seatId;
}
