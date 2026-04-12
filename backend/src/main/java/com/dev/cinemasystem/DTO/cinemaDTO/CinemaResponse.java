package com.dev.cinemasystem.dto.cinemaDTO;

import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.enums.CinemaStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaResponse {
    Integer cinemaId;
    String cinemaName;
    ProvinceResponse province;
    Integer provinceId;
    String provinceName;
    String addressText;
    String description;
    CinemaStatus status;
}

