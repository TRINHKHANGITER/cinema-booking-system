package com.dev.cinemasystem.dto.movieDTO;


import com.dev.cinemasystem.enums.MovieStatus;
import jakarta.validation.constraints.Min;
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

    @Min(value = 1, message = "DURATION_MINUTES_INVALID")
    Integer durationMinutes;

    @Min(value = 1, message = "MOVIE_TYPE_ID_INVALID")
    Integer movieTypeId;

    String slug;
    Integer minimumAge;
    MultipartFile imageLandscape;
    MultipartFile imagePortrait;
    String trailerUrl;
    BigDecimal ratingAverage;
    Integer totalVotes;
    LocalDate releaseDate;
    LocalDate endDate;
    String country;
    String producer;
    String director;
    String actors;
    MovieStatus status;
}
