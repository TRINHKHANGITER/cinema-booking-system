package com.dev.cinemasystem.dto.seatTypeDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatTypeUpdateRequest {

    String seatTypeName;

    String description;

}
