package com.dev.cinemasystem.dto.movieDTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieCreationResquest {

    @NotBlank(message = "MOVIE_NAME_BLANK")
    String movieName;

    @NotBlank(message = "DESCRIPTION_BLANK")
    String description;

    @Min(value = 1, message = "DURATION_MINUTES_INVALID")
    @NotNull(message = "DURATION_MINUTES_BLANK")
    Integer durationMinutes;

    @Min(value = 1, message = "MOVIE_TYPE_ID_INVALID")
    @NotNull(message = "MOVIE_TYPE_ID_BLANK")
    Integer movieTypeId;

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

}

