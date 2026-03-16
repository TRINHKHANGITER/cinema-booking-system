package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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

    String movieName;

    String description;

    String videoTrailer;

    String image;

    Integer durationMinutes;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_type_id",nullable = false)
    MovieType movieType;
}
