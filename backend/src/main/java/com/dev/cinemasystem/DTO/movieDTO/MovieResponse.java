package com.dev.cinemasystem.dto.movieDTO;

import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.enums.MovieStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieResponse {

    Integer movieId;

    String movieName;

    String description;

    Integer durationMinutes;

    String slug;
    Integer minimumAge;
    String imageLandscape;
    String imagePortrait;
    String trailerUrl;
    BigDecimal ratingAverage;
    Integer totalVotes;
    LocalDate releaseDate;
    LocalDate endDate;
    String country;
    String producer;
    String director;
    String actors;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    Integer movieTypeId;
    MovieTypeResponse movieType;

    MovieStatus status;

}

