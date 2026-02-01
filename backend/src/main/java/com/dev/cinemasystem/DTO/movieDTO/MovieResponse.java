package com.dev.cinemasystem.dto.movieDTO;

import com.dev.cinemasystem.Entity.MovieType;
import com.dev.cinemasystem.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieResponse {

    Integer movieId;

    String movieName;

    String description;

    String videoTrailer;

    Integer durationMinutes;

    Integer movieTypeId;

    Status status;

}
