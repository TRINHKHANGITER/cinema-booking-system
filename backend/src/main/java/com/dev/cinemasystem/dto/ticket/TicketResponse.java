package com.dev.cinemasystem.dto.ticket;

import com.dev.cinemasystem.enums.TicketStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketResponse {
    Integer ticketId;

    int orderId;

    int showTimeId;

    int seatId;

    int ticketTypeId;

    int priceTicketId;

    BigDecimal unitPrice;

    String qrCode;

    LocalDateTime checkedInAt;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    TicketStatus status;
}
