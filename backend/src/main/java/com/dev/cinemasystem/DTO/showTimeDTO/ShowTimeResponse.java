package com.dev.cinemasystem.dto.showTimeDTO;

import com.dev.cinemasystem.enums.Status;
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
public class ShowTimeResponse {

    Integer showTimeId;
    LocalDate releaseDate;
    LocalTime startTime;
    LocalTime endTime;
    Integer roomId;
    Integer movieId;
    Status status;

}
