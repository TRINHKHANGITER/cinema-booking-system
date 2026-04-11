package com.dev.cinemasystem.dto.showTimeDTO;

import java.time.LocalDateTime;

public record ShowTimeSearchDto (
    Integer showTimeId,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Integer movieId,
    String movieName,
    String movieTypeName,
    Integer cinemaId,
    String cinemaName,
    Integer roomId,
    String roomName,
    String roomTypeName
){}
