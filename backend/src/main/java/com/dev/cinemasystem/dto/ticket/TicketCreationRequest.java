package com.dev.cinemasystem.dto.ticket;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCreationRequest {
    Integer orderId;
    Integer showTimeId;
    Integer seatId;
}
