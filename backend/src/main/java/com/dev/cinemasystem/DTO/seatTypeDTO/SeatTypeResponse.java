package com.dev.cinemasystem.dto.seatTypeDTO;

import com.dev.cinemasystem.enums.Status;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatTypeResponse {
    Integer seatTypeId;

    String seatTypeName;

    String description;
    Status status;
}
