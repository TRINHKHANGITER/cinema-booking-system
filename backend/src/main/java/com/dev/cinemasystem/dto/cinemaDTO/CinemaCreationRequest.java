package com.dev.cinemasystem.dto.cinemaDTO;

import com.dev.cinemasystem.enums.CinemaStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaCreationRequest {
    @NotBlank(message = "CINEMA_BLANK")
    String cinemaName;

    @NotNull(message = "PROVINCE_ID_BLANK")
    @Min(value = 1, message = "PROVINCE_ID_INVALID")
    Integer provinceId;

    @NotBlank(message = "ADDRESS_BLANK")
    String addressText;

    String description;

    CinemaStatus status;
}
