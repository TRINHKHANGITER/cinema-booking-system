package com.dev.cinemasystem.dto.showTimeDTO;

import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeResponse {

    Integer showTimeId;
    LocalDate releaseDate;
    LocalTime startTime;
    LocalTime endTime;
    Integer roomId;
    Integer movieId;
    RoomResponse room;
    ShowTimeStatus status;

}
