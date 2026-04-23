package com.dev.cinemasystem.dto.roomDTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.dev.cinemasystem.enums.RoomStatus;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomCreationResquest {

    @NotBlank(message = "ROOM_NAME_BLANK")
    String roomName;

    @Min(value = 1, message = "CAPACITY_INVALID")
    @NotNull(message = "CAPACITY_BLANK")
    Integer capacity;

    @Min(value = 1, message = "ROOM_TYPE_ID_INVALID")
    @NotNull(message = "ROOM_TYPE_BLANK")
    Integer roomTypeId;

    @Min(value = 1, message = "CINEMA_ID_INVALID")
    @NotNull(message = "CINEMA_BLANK")
    Integer cinemaId;

    RoomStatus status;

}
