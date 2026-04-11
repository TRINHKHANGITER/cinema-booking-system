package com.dev.cinemasystem.dto.movieDTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieUpdateResquest {

    String movieName;

    String description;

    String videoTrailer;

    MultipartFile image;

    @Min(value = 1, message = "DURATION_MINUTES_INVALID")
    Integer durationMinutes;

    @Min(value = 1, message = "MOVIE_TYPE_ID_INVALID")
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
