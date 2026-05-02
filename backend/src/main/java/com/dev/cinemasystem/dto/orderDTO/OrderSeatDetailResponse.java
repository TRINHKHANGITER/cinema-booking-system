package com.dev.cinemasystem.dto.orderDTO;

import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import com.dev.cinemasystem.enums.TicketStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderSeatDetailResponse {
    Integer ticketId;
    Integer seatId;
    String seatRow;
    Integer seatColumn;
    String seatLabel;
    Integer seatTypeId;
    String seatTypeName;
    ShowTimeSeatStatus showTimeSeatStatus;
    BigDecimal unitPrice;
    TicketStatus ticketStatus;
}
