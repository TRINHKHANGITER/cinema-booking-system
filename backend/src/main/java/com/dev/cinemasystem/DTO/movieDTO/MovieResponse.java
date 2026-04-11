package com.dev.cinemasystem.dto.movieDTO;

import com.dev.cinemasystem.Entity.MovieType;
import com.dev.cinemasystem.enums.MovieStatus;
import jakarta.persistence.*;
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

    String videoTrailer;

    String image;

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

    MovieStatus status;

}

