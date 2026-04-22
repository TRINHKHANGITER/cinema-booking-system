package com.dev.cinemasystem.dto.priceTicketDTO;

import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicketResponse {

    Integer priceTicketId;
    BigDecimal price;
    RoomTypeResponse roomType;
    SeatTypeResponse seatType;
    Integer roomTypeId;
    Integer seatTypeId;
    PriceTicketStatus status;
}
