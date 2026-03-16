package com.dev.cinemasystem.dto.roomDTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomUpdateResquest {

    String roomName;

    @Min(value = 1, message = "CAPACITY_INVALID")
    Integer capacity;

    @Min(value = 1, message = "ROOM_TYPE_ID_INVALID")
    Integer roomTypeId;

    @Min(value = 1, message = "CINEMA_ID_INVALID")
    Integer cinemaId;

}
