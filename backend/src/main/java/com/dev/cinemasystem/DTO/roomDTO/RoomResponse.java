package com.dev.cinemasystem.dto.roomDTO;

import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomResponse {

    Integer roomId;
    String roomName;
    Integer capacity;
    Integer roomTypeId;
    Integer cinemaId;
    String status;
}
