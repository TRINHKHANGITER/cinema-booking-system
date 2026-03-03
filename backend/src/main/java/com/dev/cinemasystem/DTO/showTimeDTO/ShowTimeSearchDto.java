package com.dev.cinemasystem.dto.showTimeDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public record ShowTimeSearchDto (
    Integer showTimeId,
    LocalDate releaseDate,
    LocalTime startTime,
    LocalTime endTime,
    Integer movieId,
    String movieName,
    String movieTypeName,
    Integer cinemaId,
    String cinemaName,
    Integer roomId,
    String roomName,
    String roomTypeName
){}