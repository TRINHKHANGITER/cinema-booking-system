package com.dev.cinemasystem.dto.orderDTO;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderShowTimeDetailResponse {
    Integer showTimeId;
    LocalDate releaseDate;
    LocalTime startTime;
    LocalTime endTime;

    Integer movieId;
    String movieName;

    Integer roomId;
    String roomName;

    Integer cinemaId;
    String cinemaName;

    Integer provinceId;
    String provinceName;
}
