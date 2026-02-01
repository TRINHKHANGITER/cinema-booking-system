package com.dev.cinemasystem.dto.seatDTO;

import com.dev.cinemasystem.enums.Status;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    Integer seatTypeId;
    Integer roomId;
    Status status;
}
