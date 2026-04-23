package com.dev.cinemasystem.dto.cinemaDTO;

import com.dev.cinemasystem.enums.CinemaStatus;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaUpdateRequest {
    String cinemaName;

    @Min(value = 1, message = "PROVINCE_ID_INVALID")
    Integer provinceId;

    String addressText;

    String description;

    CinemaStatus status;
}
