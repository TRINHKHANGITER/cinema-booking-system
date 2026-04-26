package com.dev.cinemasystem.dto.seatDTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import com.dev.cinemasystem.enums.SeatStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatCreationResquest {

    @NotBlank(message = "ROW_BLANK")
    @Pattern(regexp = "^[A-Z]$", message = "ROW_INVALID")
    String seatRow;


    @Min(value = 1, message = "COLUMN_INVALID")
    Integer seatColumn;

    @Min(value = 1, message = "SEAT_TYPE_ID_INVALID")
    @NotNull(message = "SEAT_TYPE_BLANK")
    Integer seatTypeId;

    @Min(value = 1, message = "ROOM_ID_INVALID")
    @NotNull(message = "ROOM_BLANK")
    Integer roomId;

    SeatStatus status;

}
