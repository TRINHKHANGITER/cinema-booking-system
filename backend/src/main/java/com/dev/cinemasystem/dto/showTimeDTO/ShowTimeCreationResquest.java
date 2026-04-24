package com.dev.cinemasystem.dto.showTimeDTO;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeCreationResquest {

    @NotNull(message = "RELEASE_DATE_BLANK")
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate releaseDate;

    @NotNull(message = "START_TIME_BLANK")
    @JsonFormat(pattern = "HH:mm:ss")
    LocalTime startTime;

    @NotNull(message = "END_TIME_BLANK")
    @JsonFormat(pattern = "HH:mm:ss")
    LocalTime endTime;

    @Min(value = 1, message = "ROOM_ID_INVALID")
    @NotNull(message = "ROOM_ID_BLANK")
    Integer roomId;

    @Min(value = 1, message = "MOVIE_ID_INVALID")
    @NotNull(message = "MOVIE_ID_BLANK")
    Integer movieId;

    @NotNull(message = "SHOWTIME_STATUS_BLANK")
    ShowTimeStatus status;
}
