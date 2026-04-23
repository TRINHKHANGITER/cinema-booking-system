package com.dev.cinemasystem.dto.seatTypeDTO;

import com.dev.cinemasystem.enums.SeatTypeStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatTypeCreationRequest {

    @NotBlank(message = "SEAT_TYPE_NAME_BLANK")
    String seatTypeName;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

    SeatTypeStatus status;

}
