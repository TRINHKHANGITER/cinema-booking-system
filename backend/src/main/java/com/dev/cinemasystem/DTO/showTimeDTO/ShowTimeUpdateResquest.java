package com.dev.cinemasystem.dto.showTimeDTO;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate releaseDate;

    @Pattern(
            regexp = "^([01]\\d|2[0-3])(:?[0-5]\\d)(:?([0-5]\\d))?$",
            message = "TIME_INVALID"
    )
    String startTime;

    @Pattern(
            regexp = "^([01]\\d|2[0-3])(:?[0-5]\\d)(:?([0-5]\\d))?$",
            message = "TIME_INVALID"
    )
    String endTime;

    @Min(value = 1, message = "ROOM_ID_INVALID")
    Integer roomId;

    @Min(value = 1, message = "MOVIE_ID_INVALID")
    Integer movieId;
}
