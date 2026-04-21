package com.dev.cinemasystem.dto.seatDTO;

import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.enums.SeatStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatResponse {

    Integer seatId;
    String seatRow;
    Integer seatColumn;
    SeatTypeResponse seatType;
    RoomResponse room;
    Integer seatTypeId;
    Integer roomId;
    SeatStatus status;
}

