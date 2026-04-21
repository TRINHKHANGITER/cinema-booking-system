package com.dev.cinemasystem.dto.priceTicketDTO;

import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeResponse;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceTicketResponse {

    Integer priceTicketId;
    Integer price;
    RoomTypeResponse roomType;
    SeatTypeResponse seatType;
    TicketTypeResponse ticketType;
    Integer roomTypeId;
    Integer seatTypeId;
    Integer ticketTypeId;
    PriceTicketStatus status;

}

