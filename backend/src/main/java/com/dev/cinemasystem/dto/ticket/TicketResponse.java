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
    Integer orderId;
    Integer showTimeId;
    Integer seatId;
    Integer priceTicketId;
    BigDecimal unitPrice;
    BigDecimal netAmount;
    String qrCode;
    LocalDateTime checkedInAt;
    TicketStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
