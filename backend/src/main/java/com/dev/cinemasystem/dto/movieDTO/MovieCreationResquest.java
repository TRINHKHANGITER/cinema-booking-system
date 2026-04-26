package com.dev.cinemasystem.dto.movieDTO;


import com.dev.cinemasystem.enums.MovieStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    MultipartFile imageLandscape;
    MultipartFile imagePortrait;
    String trailerUrl;
    BigDecimal ratingAverage;
    Integer totalVotes;

    @NotNull(message = "RELEASE_DATE_BLANK")
    LocalDate releaseDate;

    @NotNull(message = "END_DATE_BLANK")
    LocalDate endDate;
    String country;
    String producer;
    String director;
    String actors;

    @NotNull(message = "MOVIE_STATUS_BLANK")
    MovieStatus status;

}

