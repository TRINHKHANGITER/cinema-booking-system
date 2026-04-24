package com.dev.cinemasystem.dto.showTimeDTO;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeUpdateResquest {

    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate releaseDate;

    @JsonFormat(pattern = "HH:mm:ss")
    LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    LocalTime endTime;

    @Min(value = 1, message = "ROOM_ID_INVALID")
    Integer roomId;

    @Min(value = 1, message = "MOVIE_ID_INVALID")
    Integer movieId;

    ShowTimeStatus status;
}
