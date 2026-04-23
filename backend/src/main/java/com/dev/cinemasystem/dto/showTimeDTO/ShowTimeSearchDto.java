package com.dev.cinemasystem.dto.showTimeDTO;

public record ShowTimeSearchDto(
        Integer showTimeId,
        String startTime,
        String endTime,
        Integer movieId,
        String movieName,
        String movieTypeName,
        Integer cinemaId,
        String cinemaName,
        Integer roomId,
        String roomName,
        String roomTypeName
) {
}
