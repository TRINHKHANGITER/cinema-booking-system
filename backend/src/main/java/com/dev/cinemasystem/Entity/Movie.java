package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.MovieStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movie")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer movieId;

    @Column(nullable = false, length = 255)
    String movieName;

    @Column(columnDefinition = "TEXT")
    String description;



    Integer durationMinutes;

    @Column(unique = true, length = 255)
    String slug;

    Integer minimumAge;

    @Column(length = 500)
    String imageLandscape;

    @Column(length = 500)
    String imagePortrait;

    @Column(length = 500)
    String trailerUrl;

    @Column(precision = 3, scale = 1)
    BigDecimal ratingAverage;

    Integer totalVotes;

    LocalDate releaseDate;

    LocalDate endDate;

    @Column(length = 200)
    String country;

    @Column(length = 500)
    String producer;

    @Column(length = 500)
    String director;

    @Column(columnDefinition = "JSON")
    String actors;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    MovieStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_type_id",nullable = false)
    MovieType movieType;
}


