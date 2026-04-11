package com.dev.cinemasystem.dto.cinemaDTO;

import com.dev.cinemasystem.enums.Status;
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
    Integer provinceId;
    String provinceName;
    String address;
    String description;
    Status status;
}
